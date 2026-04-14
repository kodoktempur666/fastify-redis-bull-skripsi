// import { Worker } from "bullmq";
// import redisWorker from "../config/redis.worker.js";
// import client from "../config/grpc.js";

// const createCheckoutWorker = new Worker(
//   "createCheckoutQueue",
//   async (job) => {
//     return new Promise((resolve, reject) => {
//       client.CreateCheckout(job.data, (err, res) => {
//         if (err) reject(err);
//         else resolve(res);
//       });
//     });
//   },
//   {
//     connection: redisWorker,
//     concurrency: 20,
//   }
// );

// // createCheckoutWorker.on("completed", () => {
// //   console.log("Create checkout job completed");
// // });

// // createCheckoutWorker.on("failed", (job, err) => {
// //   console.error("Create checkout failed:", err.message);
// // });

// export default createCheckoutWorker;

import { Worker } from "bullmq";
import redis from "../config/redis.js";
import pool from "../config/db.js"; 

const createCheckoutWorker = new Worker(
  "createCheckoutQueue",
  async (job) => {
    try {
      const { name, amount, item } = job.data;

      const result = await pool.query(
        `INSERT INTO checkouts(name, amount, item)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, amount, item]
      );
      // await new Promise((resolve) => setTimeout(resolve, 30));

      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 30,
  }
);

// createCheckoutWorker.on("completed", (job, result) => {
//   console.log("Create checkout success:", result);
// });

// createCheckoutWorker.on("failed", (job, err) => {
//   console.error("Create checkout failed:", err.message);
// });

export default createCheckoutWorker;