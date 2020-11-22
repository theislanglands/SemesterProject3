FROM node:latest
WORKDIR /app
COPY package.json /app
RUN npm install -y
COPY . /app
CMD ["node", "withgmail.js"]
