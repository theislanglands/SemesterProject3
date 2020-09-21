FROM nginx:latest

EXPOSE 80 443

ADD nginx.conf /etc/nginx/sp2020.conf
ADD html/ /usr/share/nginx/html