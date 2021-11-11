FROM ubuntu

WORKDIR /MediaAcquisition

RUN apt update -y

RUN apt install python3-pip -y
RUN apt-get install -y python-dev default-libmysqlclient-dev
RUN apt-get install python3-dev
COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

