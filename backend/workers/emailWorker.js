// backend/workers/emailWorker.js
import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // ✅ REQUIRED FOR BULLMQ
});

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    console.log("📨 Processing Email Job");
    console.log("To:", job.data.to);
    console.log("Subject:", job.data.subject);
    console.log("Body:", job.data.body);

    return true;
  },
  { connection }
);

console.log("✅ Email Worker started and listening...");
