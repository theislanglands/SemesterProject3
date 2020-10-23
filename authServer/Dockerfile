FROM node:latest

COPY package*.json ./

RUN npm install -g -y

# Bundles app source
COPY . .

EXPOSE 3300

CMD ["node", "server.js"]