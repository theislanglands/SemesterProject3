FROM node:latest

COPY package*.json ./

RUN npm install -y

# Bundles app source
COPY . .

EXPOSE 3300

CMD ["node", "server.js"]