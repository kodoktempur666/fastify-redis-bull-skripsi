import { Worker } from "bullmq";
import redis from "../config/redis.js";
import client from "../config/grpc.js";

const editCheckoutWorker = new Worker(
  "editCheckoutQueue",
  async (job) => {
    return new Promise((resolve, reject) => {
      client.EditCheckout(job.data, (err, res) => {
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

editCheckoutWorker.on("completed", () => {
  console.log("Edit checkout job completed");
});

editCheckoutWorker.on("failed", (job, err) => {
  console.error("Edit checkout failed:", err.message);
});

export default editCheckoutWorker;