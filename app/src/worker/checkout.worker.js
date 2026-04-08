import { Worker } from "bullmq";
import pool from "../config/db.js";
import redis from "../config/redis.js";

const worker = new Worker(
  "checkoutQueue",
  async (job) => {
    const { name, amount, item } = job.data;

    const result = await pool.query(
      `INSERT INTO checkouts (name, amount, item)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, amount, item]
    );

    return result.rows[0];
  },
  { connection: redis, concurrency: 10 }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});