FROM nginx:latest

EXPOSE 80 443

ADD nginx.conf /etc/nginx/sp2020.conf
ADD cert_key/nginx-selfsigned.key /etc/nginx/private_key.key
ADD cert_key/nginx-selfsigned.crt /etc/nginx/selfsigned_cert.crt
ADD html/ /usr/share/nginx/html
RUN /etc/init.d/nginx restart
