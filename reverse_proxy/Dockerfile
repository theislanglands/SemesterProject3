FROM nginx:latest

EXPOSE 80 443

ADD nginx.conf /etc/nginx/conf.d/sp2020.conf
ADD nginx-selfsigned.key /etc/nginx/private_key.key
ADD nginx-selfsigned.crt /etc/nginx/selfsigned_cert.crt
ADD html/ /usr/share/nginx/html
RUN /etc/init.d/nginx restart
