import { getErrorMessage } from '@/utils/errorUtils';
import Redis from 'ioredis';

// Create a shared Redis connection for all queues and workers
// Use Upstash Redis URL if available, fall back to standard Redis URL
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

let connection: Redis | null = null;
let connectionOptions: any = null;

try {
  if (redisUrl) {
    const redisConfig = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    connection = new Redis(redisUrl, redisConfig);

    // For BullMQ, we need to provide connection options, not the instance
    connectionOptions = redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')
      ? redisUrl
      : {
          host: redisUrl.includes('@') ? redisUrl.split('@')[1].split(':')[0] : 'localhost',
          port: redisUrl.includes(':') ? parseInt(redisUrl.split(':').pop() || '6379') : 6379,
          ...redisConfig
        };
  } else {
    console.warn('No Redis URL configured. Queue functionality will be disabled.');
  }
} catch (error) {
    const message = getErrorMessage(error);
  console.error('Failed to initialize Redis connection:', error);
  connection = null;
  connectionOptions = null;
}

export { connection, connectionOptions };

// Connection event handlers
if (connection) {
  connection.on('connect', () => {
    console.log('Redis connected successfully');
  });

  connection.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  connection.on('close', () => {
    console.log('Redis connection closed');
  });

  connection.on('reconnecting', () => {
    console.log('Redis reconnecting...');
  });
}

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  if (!connection) {
    console.warn('Redis not configured');
    return false;
  }
  
  try {
    const result = await connection.ping();
    return result === 'PONG';
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
  }
}
