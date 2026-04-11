// import { Worker } from "bullmq";
// import redis from "../config/redis.js";
// import client from "../config/grpc.js";

// const patchCheckoutWorker = new Worker(
//   "patchCheckoutQueue",
//   async (job) => {
//     return new Promise((resolve, reject) => {
//       client.PatchCheckout(job.data, (err, res) => {
//         if (err) reject(err);
//         else resolve(res);
//       });
//     });
//   },
//   {
//     connection: redis,
//     concurrency: 10,
//   }
// );

// patchCheckoutWorker.on("completed", () => {
//   console.log("Patch checkout job completed");
// });

// patchCheckoutWorker.on("failed", (job, err) => {
//   console.error("Patch checkout failed:", err.message);
// });

// export default patchCheckoutWorker;

import { Worker } from "bullmq";
import redis from "../config/redis.js";
import pool from "../config/db.js"; 

const patchCheckoutWorker = new Worker(
  "patchCheckoutQueue",
  async (job) => {
    try {
     const { id, name, amount, item } = job.data;

      const result = await pool.query(
        `UPDATE checkouts
         SET 
           name = COALESCE($1, name),
           amount = COALESCE($2, amount),
           item = COALESCE($3, item)
         WHERE id = $4
         RETURNING *`,
        [name, amount, item, id],
      );

      callback(null, result.rows[0] || {});
    } catch (err) {
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

// log sukses
patchCheckoutWorker.on("completed", (job, result) => {
  console.log("Create checkout success:", result);
});

// log error
patchCheckoutWorker.on("failed", (job, err) => {
  console.error("Create checkout failed:", err.message);
});

export default patchCheckoutWorker;