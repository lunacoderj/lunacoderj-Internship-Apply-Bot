import { Redis } from 'ioredis';
import { createLogger } from './logger.js';

const logger = createLogger('redis');

const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const cleanUrl = redisUrl.replace(/^["']|["']$/g, '');
      const url = new URL(cleanUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: decodeURIComponent(url.password || ''),
        username: decodeURIComponent(url.username || ''),
        ...(url.protocol === 'rediss:' && { tls: {} }),
        maxRetriesPerRequest: null,
      };
    } catch (e) {
      logger.warn(`Failed to parse REDIS_URL, using defaults: ${e.message}`);
    }
  }
  return { 
    host: '127.0.0.1', 
    port: 6379,
    maxRetriesPerRequest: null 
  };
};

export const redisOptions = getRedisConnection();
export const redisConnection = new Redis(redisOptions);

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});

redisConnection.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});
