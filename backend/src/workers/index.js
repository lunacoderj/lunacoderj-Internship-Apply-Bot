// src/workers/index.js
import { Worker } from 'bullmq';
import { createLogger } from '../lib/logger.js';
import { processResumeParsing } from './resumeWorker.js';
import { processApplicationApply } from './applicationWorker.js';
import { redisConnection } from '../lib/redis.js';

const logger = createLogger('worker-main');

const resumeWorker = new Worker('resumeQueue', processResumeParsing, {
  connection: redisConnection,
  concurrency: 5,
});

const applicationWorker = new Worker('applicationQueue', processApplicationApply, {
  connection: redisConnection,
  concurrency: 2, // Automation is slower/heavier
});

resumeWorker.on('completed', (job) => {
  logger.info(`Resume parsing job ${job.id} completed`);
});

resumeWorker.on('failed', (job, err) => {
  logger.error(`Resume parsing job ${job.id} failed: ${err.message}`);
});

applicationWorker.on('completed', (job) => {
  logger.info(`Application job ${job.id} completed`);
});

applicationWorker.on('failed', (job, err) => {
  logger.error(`Application job ${job.id} failed: ${err.message}`);
});

logger.info('Workers started successfully');
