import Redis from 'ioredis';

// Create a shared Redis connection for all queues and workers
export const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Connection event handlers
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

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await connection.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnection() {
  await connection.quit();
}
