import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { processCheckout } from "../services/checkout.service.js";


new Worker(
  "checkoutQueue",
  async (job) => {
    await processCheckout(job.data);


  },
  {
    connection: redis,
    concurrency: 20,
  }
);