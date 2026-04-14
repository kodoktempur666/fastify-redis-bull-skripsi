FROM node:24

WORKDIR ./

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3010

# CMD ["node", "src/index.js"]

CMD ["sh", "-c", "node src/server.js & node src/worker/checkoutPost.worker.js"]