if [ x${ELASTIC_PASSWORD} == x ]; then
    echo "Set the ELASTIC_PASSWORD environment variable in the .env file"
    exit 1
elif [ x${KIBANA_PASSWORD} == x ]; then
    echo "Set the KIBANA_PASSWORD environment variable in the .env file"
    exit 1
fi
if [ ! -f config/certs/ca.zip ]; then
    echo "Creating CA"
    bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip
    unzip config/certs/ca.zip -d config/certs
fi
if [ ! -f config/certs/certs.zip ]; then
    echo "Creating certs"
    echo -ne \
        "instances:\n" \
        "  - name: es01\n" \
        "    dns:\n" \
        "      - es01\n" \
        "      - localhost\n" \
        "    ip:\n" \
        "      - 127.0.0.1\n" \
        "  - name: es02\n" \
        "    dns:\n" \
        "      - es02\n" \
        "      - localhost\n" \
        "    ip:\n" \
        "      - 127.0.0.1\n" \
        "  - name: es03\n" \
        "    dns:\n" \
        "      - es03\n" \
        "      - localhost\n" \
        "    ip:\n" \
        "      - 127.0.0.1\n" \
        "  - name: kibana\n" \
        "    dns:\n" \
        "      - kibana\n" \
        "      - localhost\n" \
        "    ip:\n" \
        "      - 127.0.0.1\n" \
        >config/certs/instances.yml
    bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key
    unzip config/certs/certs.zip -d config/certs
fi

echo "Setting file permissions"
chown -R root:root config/certs
find . -type d -exec chmod 750 \{\} \;
find . -type f -exec chmod 640 \{\} \;
chmod -R 777 /mnt/es_archive

echo "Waiting for Elasticsearch availability"
until curl -s --cacert config/certs/ca/ca.crt https://es01:9200 | grep -q "missing authentication credentials"; do sleep 30; done

echo "Creating local repo for archiving"
until curl -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -X PUT --cacert config/certs/ca/ca.crt "https://es01:9200/_snapshot/local_archive" \
    -H "Content-Type: application/json" \
    -d '
    {
        "type": "fs",
        "settings": {
        "location": "/mnt/es_archive",
        "compress": true
    }
}'; do sleep 10; done

echo "Creating lifecycle policy"
until curl -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -X PUT --cacert config/certs/ca/ca.crt "https://es01:9200/_ilm/policy/logstash-policy" \
    -H "Content-Type: application/json" \
    -d @/usr/share/elasticsearch/config/ilm_policy.json; do sleep 10; done

echo "Setting snapshot policy"
until curl -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -X PUT --cacert config/certs/ca/ca.crt "https://es01:9200/_slm/policy/snapshot-policy" \
    -H "Content-Type: application/json" \
    -d '{
  "schedule": "0 /15 * * * ?",
  "name": "<fifteen-minute-snap-{now/1m}>",
  "repository": "local_archive",
  "config": {
    "indices": ["logstash-*"],
    "ignore_unavailable": false,
    "include_global_state": true
  },
  "retention": {
    "policy": {
      "max_count": 10
    }
  }
}'; do sleep 10; done

echo "Creating template"
until curl -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -X PUT --cacert config/certs/ca/ca.crt "https://es01:9200/_index_template/logstash-template" \
    -H "Content-Type: application/json" \
    -d '{
    "index_patterns": ["logstash-*"],
    "template": {
      "settings": {
        "index.number_of_replicas": 0,
        "index.lifecycle.name": "logstash-policy",
        "index.lifecycle.rollover_alias": "logstash"
      }
    }
}'; do sleep 10; done

echo "Setting better lifecycle polling rate"
until curl -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -X PUT --cacert config/certs/ca/ca.crt "https://es01:9200/_cluster/settings" \
    -H "Content-Type: application/json" \
    -d '
    {
        "persistent": {
            "indices.lifecycle.poll_interval": "10s"
        }
    }'; do sleep 10; done

echo "Setting kibana_system password"
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://es01:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done

echo "All done!"
