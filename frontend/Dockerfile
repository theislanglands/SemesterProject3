FROM node:latest
EXPOSE 8090
WORKDIR /app
COPY package.json /app
RUN npm install -y
COPY . /app
CMD ["node", "frontEndServer.js"]