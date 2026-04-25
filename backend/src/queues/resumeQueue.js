import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis.js';

export const resumeQueue = new Queue('resumeQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

export default resumeQueue;
