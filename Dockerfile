FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm

RUN npm install

COPY . .

EXPOSE 3333

CMD ["npm", "run", "dev:server"]