FROM ubuntu

WORKDIR /MediaAcquisition

RUN apt update -y
ENV DEBIAN_FRONTEND=noninteractive
RUN apt install python3-pip -y
RUN apt-get install -y python-dev default-libmysqlclient-dev
RUN apt-get install -y python3-dev
RUN apt-get install -y ffmpeg
COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

