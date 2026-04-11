import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const createQueue = new Queue("createCheckoutQueue", { connection: redis });
export const editQueue = new Queue("editCheckoutQueue", { connection: redis });
export const patchQueue = new Queue("patchCheckoutQueue", { connection: redis });