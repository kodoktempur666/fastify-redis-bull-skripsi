import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const stockQueue = new Queue("stockQueue", {
  connection: redis,
  // defaultJobOptions: {
  //   attempts: 3,
  //   backoff: { type: "exponential", delay: 1000 },
  //   removeOnComplete: true,
  //   removeOnFail: false,
  // },
});