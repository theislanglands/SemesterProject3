# Connection security 10

used to build and push image (gmail)

docker build -t gitlab.sdu.dk:5050/semester-project-e2020/team-10-connection-security/template:gmail-service .

docker push gitlab.sdu.dk:5050/semester-project-e2020/team-10-connection-security/template:gmail-service

used to build and push image (auth)

docker build -t gitlab.sdu.dk:5050/semester-project-e2020/team-10-connection-security/template:auth-service .

docker push gitlab.sdu.dk:5050/semester-project-e2020/team-10-connection-security/template:auth-service

connect to sites
kubectl port-forward svc/reverse-proxy 3030:3030 3031:3031

Connection security
http://kubuntu.stream.stud-srv.sdu.dk

### TODO

fix gmail so that instead of going to localhost/resetPass it needs to go to /resetPass
check for similar error

if you do not have config file you need to get one otherwhise you cannot deploy, you need to be at uni to be able to get a config file.
