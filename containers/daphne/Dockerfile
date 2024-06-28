FROM    python:3.12.4-bookworm

COPY    requirements.txt /etc/

RUN     pip3 install -r /etc/requirements.txt --no-cache-dir

WORKDIR /project
EXPOSE  8001
ENTRYPOINT ["daphne", "-b", "0.0.0.0", "-p", "8001", "transcendence.asgi:application", "-v2"]
