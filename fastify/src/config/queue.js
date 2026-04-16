import { Queue } from "bullmq";
import redis from "./redis.js";

export const emailQueue = new Queue("emailQueue", { connection: redis });
export const checkoutQueue = new Queue("checkoutQueue", { connection: redis });
export const cartQueue = new Queue("cartQueue", { connection: redis });