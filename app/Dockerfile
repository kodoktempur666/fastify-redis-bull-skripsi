FROM node:24

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3025

CMD ["sh", "-c", "node src/index.js & node src/worker/checkout.worker.js"]