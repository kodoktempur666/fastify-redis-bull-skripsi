import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const checkoutQueue = new Queue("checkoutQueue", {
  connection: redis,
  // defaultJobOptions: {
  //   attempts: 5,
  //   backoff: { type: "exponential", delay: 2000 },
  //   removeOnComplete: false,
  //   removeOnFail: false,
  // },
});