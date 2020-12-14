FROM node:latest
EXPOSE 3031
WORKDIR /app
COPY package.json /app
RUN npm install -y
COPY . /app
CMD ["node", "frontEndServer.js"]