import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis.js';

export const applicationQueue = new Queue('applicationQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
    attempts: 2,
    backoff: { type: 'exponential', delay: 30000 },
  },
});

export default applicationQueue;
