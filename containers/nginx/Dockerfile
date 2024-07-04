FROM nginx:1.27.0

COPY    nginx/nginx.conf /etc/nginx/nginx.conf
COPY    ./scripts/nginx.sh /nginx.sh

RUN     chmod +x /nginx.sh
ENTRYPOINT ["/nginx.sh"]
CMD ["nginx", "-g", "daemon off;"]
