FROM node:12-alpine

COPY package*.json ./

RUN npm install

# Bundles app source
COPY . .

EXPOSE 3300

CMD ["node", "server.js"]