FROM node:20.12.1-alpine

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
