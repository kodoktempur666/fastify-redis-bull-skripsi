FROM node:24

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3025

CMD ["node", "src/index.js"]