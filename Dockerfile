FROM nginx:latest

EXPOSE 8080 443

ADD nginx.conf /etc/nginx/nginx.conf
ADD html/ /usr/share/nginx/html
ADD SSL/ /etc/nginx/