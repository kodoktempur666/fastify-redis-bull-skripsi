import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const cartQueue = new Queue("cartQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 500 },
    removeOnComplete: true,
    removeOnFail: true,
  },
});