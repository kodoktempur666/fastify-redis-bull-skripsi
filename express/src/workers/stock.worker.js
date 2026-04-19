// import { Worker } from "bullmq";
// import redis from "../config/redis.js";
// import pool from "../db/pool.js";

// new Worker(
//   "stockQueue",
//   async (job) => {
//     const { items } = job.data;

//     const values = [];
//     const params = [];

//     items.forEach((item, index) => {
//       const i = index * 2;

//       values.push(`($${i + 1}, $${i + 2})`);
//       params.push(item.product_id, item.quantity);
//     });

//     await pool.query(`
//       UPDATE products p
//       SET stock = p.stock - v.quantity
//       FROM (VALUES ${values.join(",")}) AS v(id, quantity)
//       WHERE p.id = v.id AND p.stock >= v.quantity
//     `, params);

//     console.log("Batch stock updated");
//   },
//   {
//     connection: redis,
//     concurrency: 20, // naikkan juga
//   }
// );

import { Worker } from "bullmq";
import redis from "../config/redis.js";
import pool from "../db/pool.js";

console.log("Stock worker starting...");

const worker = new Worker(
  "stockQueue",
  async (job) => {
    try {
      console.log("Job received:", job.id);

      const { items } = job.data;

      const cleanItems = items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

      const values = [];
      const params = [];

      cleanItems.forEach((item, index) => {
        const i = index * 2;

        values.push(`($${i + 1}, $${i + 2})`);

        params.push(item.product_id, item.quantity);
      });

      await pool.query(
        `
        UPDATE products p
        SET stock = p.stock - v.quantity::int
        FROM (VALUES ${values.join(",")}) AS v(id, quantity)
        WHERE p.id = v.id::bigint
          AND p.stock >= v.quantity::int
        `,
        params
      );
      
      console.log("Batch stock updated");
    } catch (err) {
      console.error("Worker error:", err);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 20,
  },
);

worker.on("completed", (job) => {
  console.log("✔ Completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.log("❌ Failed:", job?.id, err.message);
});
