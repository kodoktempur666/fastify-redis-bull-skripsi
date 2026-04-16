import { Worker } from "bullmq";
import redis from "../config/redis.js";

const mockSendEmail = async (email, name) => {
  const delay = Math.random() * 200 + 50;
  await new Promise((r) => setTimeout(r, delay));

  if (Math.random() < 0.05) {
    throw new Error("SMTP mock error");
  }
};

new Worker(
  "emailQueue",
  async (job) => {
    const { email, name } = job.data;

    await mockSendEmail(email, name);

    console.log("Email sent to:", email);
  },
  {
    connection: redis,
    concurrency: 5,
  }
);