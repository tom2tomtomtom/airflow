import Redis from 'ioredis';

// Create a shared Redis connection for all queues and workers
// Use Upstash Redis URL if available, fall back to standard Redis URL
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

let connection: Redis | null = null;

try {
  if (redisUrl) {
    connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  } else {
    console.warn('No Redis URL configured. Queue functionality will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis connection:', error);
  connection = null;
}

export { connection };

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
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnection() {
  if (connection) {
    await connection.quit();
  }
}
