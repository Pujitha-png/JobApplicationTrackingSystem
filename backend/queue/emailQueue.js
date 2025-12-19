// backend/queue/emailQueue.js
import { Queue } from "bullmq";
import IORedis from "ioredis";

// Connect to Redis
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
});

// Create email queue
const emailQueue = new Queue("email-queue", { connection });

export default emailQueue;
