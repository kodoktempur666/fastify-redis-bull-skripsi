FROM node:24

WORKDIR /

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3025

# CMD ["node", "src/index.js"]
CMD ["sh", "-c", "node src/server.js & node src/workers/checkoutPost.worker.js"]