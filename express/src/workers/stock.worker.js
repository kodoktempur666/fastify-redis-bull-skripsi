import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { reduceStock } from "../models/product.model.js";

new Worker(
  "stockQueue",
  async (job) => {
    const { productId, quantity } = job.data;

    await reduceStock(productId, quantity);

    console.log(`Stock reduced: ${productId} - ${quantity}`);
  },
  {
    connection: redis,

    concurrency: 1, 
  }
);