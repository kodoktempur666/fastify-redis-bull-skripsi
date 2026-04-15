// import { Worker } from "bullmq";
// import redis from "../config/redis.js";
// import pool from "../config/db.js"; 

// const createCheckoutWorker = new Worker(
//   "createCheckoutQueue",
//   async (job) => {
//     try {
//       const { name, amount, item } = job.data;

//       const result = await pool.query(
//         `INSERT INTO checkouts(name, amount, item)
//          VALUES ($1, $2, $3)
//          RETURNING *`,
//         [name, amount, item]
//       );
//       // await new Promise((resolve) => setTimeout(resolve, 30));

//       return result.rows[0];
//     } catch (err) {
//       throw err;
//     }
//   },
//   {
//     connection: redis,
//     concurrency: 30,
//   }
// );

// // createCheckoutWorker.on("completed", (job, result) => {
// //   console.log("Create checkout success:", result);
// // });

// // createCheckoutWorker.on("failed", (job, err) => {
// //   console.error("Create checkout failed:", err.message);
// // });

// export default createCheckoutWorker;

import { Worker } from "bullmq";
import redis from "../config/redis.js";
import pool from "../config/db.js";

let buffer = [];
let timer = null;

const BATCH_SIZE = 50;     // bisa kamu tuning (20–100)
const FLUSH_INTERVAL = 100; // ms

const flushBuffer = async () => {
  if (buffer.length === 0) return;

  const currentBatch = buffer;
  buffer = [];

  const values = [];
  const params = [];

  currentBatch.forEach((item, i) => {
    const idx = i * 3;
    values.push(`($${idx + 1}, $${idx + 2}, $${idx + 3})`);
    params.push(item.name, item.amount, item.item);
  });

  try {
    await pool.query(
      `INSERT INTO checkouts(name, amount, item) VALUES ${values.join(",")}`,
      params
    );
  } catch (err) {
    console.error("Batch insert error:", err.message);
  }
};

const createCheckoutWorker = new Worker(
  "createCheckoutQueue",
  async (job) => {
    buffer.push(job.data);

    // flush kalau sudah penuh
    if (buffer.length >= BATCH_SIZE) {
      await flushBuffer();
    }

    // flush berkala (hindari data nyangkut)
    if (!timer) {
      timer = setTimeout(async () => {
        await flushBuffer();
        timer = null;
      }, FLUSH_INTERVAL);
    }

    return { status: "queued" };
  },
  {
    connection: redis,
    concurrency: 30,
  }
);

export default createCheckoutWorker;