FROM ubuntu

WORKDIR /MediaAcquisition

RUN apt update -y
ENV DEBIAN_FRONTEND=noninteractive
RUN apt install python3-pip -y
RUN apt-get install -y python-dev default-libmysqlclient-dev python3-dev ffmpeg
COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

CMD sh -c "python3 manage.py wait_for_database && python3 manage.py makemigrations && python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:8000"