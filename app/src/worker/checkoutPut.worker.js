// import { Worker } from "bullmq";
// import redis from "../config/redis.js";
// import client from "../config/grpc.js";

// const editCheckoutWorker = new Worker(
//   "editCheckoutQueue",
//   async (job) => {
//     return new Promise((resolve, reject) => {
//       client.EditCheckout(job.data, (err, res) => {
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

// editCheckoutWorker.on("completed", () => {
//   console.log("Edit checkout job completed");
// });

// editCheckoutWorker.on("failed", (job, err) => {
//   console.error("Edit checkout failed:", err.message);
// });

// export default editCheckoutWorker;

import { Worker } from "bullmq";
import redis from "../config/redis.js";
import pool from "../config/db.js"; 

const editCheckoutWorker = new Worker(
  "editCheckoutQueue",
  async (job) => {
    try {
     const { id, name, amount, item } = job.data;

      const result = await pool.query(
        `UPDATE checkouts 
         SET name = $1, amount = $2, item = $3 
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
editCheckoutWorker.on("completed", (job, result) => {
  console.log("Create checkout success:", result);
});

// log error
editCheckoutWorker.on("failed", (job, err) => {
  console.error("Create checkout failed:", err.message);
});

export default editCheckoutWorker;