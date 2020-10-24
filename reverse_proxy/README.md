# Reverseproxy using NGINX //Not completely done
##### we have had some troubles setting up our nginx with the docker-compose so right now if you go to localhost after running the docker-compose.yml file you will keep getting redirected with the statuscode 301 you get https but the page is redirected correctly 

## TODO
##### Much of the explanations is currently taken from this [site](https://nginx.org/en/docs/) and there will therefore have to be some cleanup writing that has to be done at a later point in time so that it is only our examples and our own words being used. 
### requst processing: 
```
server {
    listen      80;
    server_name example.org www.example.org;
    ...
}

server {
    listen      80;
    server_name example.net www.example.net;
    ...
}

server {
    listen      80;
    server_name example.com www.example.com;
    ...
}
```
##### In the configuration above, the default server is the first one — which is nginx’s standard default behaviour. It can also be set explicitly which server should be default, with the default_server parameter in the listen directive:
```
server {
    listen      80 default_server;
    server_name example.net www.example.net;
    ...
}
```
### In catch-all server examples the strange name “_” can be seen:
##### There is nothing special about this name, it is just one of a myriad of invalid domain names which never intersect with any real name. Other invalid names like “--” and “!@#” may equally be used.
```
server {
    listen       80  default_server;
    server_name  _;
    return       444;
}
```
### configuring an HTTPS server:
##### To configure an HTTPS server, the ssl parameter must be enabled on listening sockets in the server block, and the locations of the server certificate and private key files should be specified:
example:
```
server {
    listen              443 ssl;
    server_name         www.example.com;
    ssl_certificate     www.example.com.crt;
    ssl_certificate_key www.example.com.key;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ...
}
```
##### The server certificate is a public entity. It is sent to every client that connects to the server. The private key is a secure entity and should be stored in a file with restricted access, however, it must be readable by nginx’s master process. The private key may alternately be stored in the same file as the certificate:
```
    ssl_certificate     www.example.com.cert;
    ssl_certificate_key www.example.com.cert;
```
##### in which case the file access rights should also be restricted. Although the certificate and the key are stored in one file, only the certificate is sent to a client.

##### The directives ssl_protocols and ssl_ciphers can be used to limit connections to include only the strong versions and ciphers of SSL/TLS. By default nginx uses “ssl_protocols TLSv1 TLSv1.1 TLSv1.2” and “ssl_ciphers HIGH:!aNULL:!MD5”, so configuring them explicitly is generally not needed. Note that default values of these directives were changed several times.

### Our set up:
```
server {
		listen 443 ssl;
		server_name _;
		ssl_certificate selfsigned_cert.crt;
		ssl_certificate_key private_key.key;
		ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
		ssl_prefer_server_ciphers on;
		ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DHE+AES128:!ADH:!AECDH:!MD5;
		location / {
			proxy_pass http://127.0.0.1/;
		}	
	}
```

### read up on this 
#### HTTPS server optimization
##### SSL operations consume extra CPU resources. On multi-processor systems several worker processes should be run, no less than the number of available CPU cores. The most CPU-intensive operation is the SSL handshake. There are two ways to minimize the number of these operations per client: the first is by enabling keepalive connections to send several requests via one connection and the second is to reuse SSL session parameters to avoid SSL handshakes for parallel and subsequent connections. The sessions are stored in an SSL session cache shared between workers and configured by the ssl_session_cache directive. One megabyte of the cache contains about 4000 sessions. The default cache timeout is 5 minutes. It can be increased by using the ssl_session_timeout directive. Here is a sample configuration optimized for a multi-core system with 10 megabyte shared session cache:
```
worker_processes auto;

http {
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    server {
        listen              443 ssl;
        server_name         www.example.com;
        keepalive_timeout   70;

        ssl_certificate     www.example.com.crt;
        ssl_certificate_key www.example.com.key;
        ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers         HIGH:!aNULL:!MD5;
        ...
```
### location 
##### nginx first searches for the most specific prefix location given by literal strings regardless of the listed order. In the configuration above the only prefix location is “/” and since it matches any request it will be used as a last resort. Then nginx checks locations given by regular expression in the order listed in the configuration file. The first matching expression stops the search and nginx will use this location. If no regular expression matches a request, then nginx uses the most specific prefix location found earlier.