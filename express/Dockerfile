FROM node:24

WORKDIR /express

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3020

# CMD ["node", "src/index.js"]

CMD ["sh", "-c", "node src/server.js & node src/workers/checkoutPost.worker.js"]