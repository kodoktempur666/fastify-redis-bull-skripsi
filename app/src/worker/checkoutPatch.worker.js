import { Worker } from "bullmq";
import redis from "../config/redis.js";
import client from "../config/grpc.js";

const patchCheckoutWorker = new Worker(
  "patchCheckoutQueue",
  async (job) => {
    return new Promise((resolve, reject) => {
      client.PatchCheckout(job.data, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

patchCheckoutWorker.on("completed", () => {
  console.log("Patch checkout job completed");
});

patchCheckoutWorker.on("failed", (job, err) => {
  console.error("Patch checkout failed:", err.message);
});

export default patchCheckoutWorker;