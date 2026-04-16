import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { processCartItem } from "../services/cart.service.js";

new Worker(
  "cartQueue",
  async (job) => {
    await processCartItem(job.data);
  },
  {
    connection: redis,
    concurrency: 20,
  }
);