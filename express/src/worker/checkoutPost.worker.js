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