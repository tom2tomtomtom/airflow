import { getErrorMessage } from '@/utils/errorUtils';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { connection } from './connection';
import { handleError } from '@/lib/errors/errorHandler';

// Queue names
export const QUEUE_NAMES = {
  RENDER: 'render',
  EMAIL: 'email',
  WEBHOOK: 'webhook',
  FILE_CLEANUP: 'file-cleanup',
  ANALYTICS: 'analytics',
} as const;

// Queue configurations
const defaultJobOptions = {
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 24 * 3600, // Remove completed jobs after 24 hours
  },
  removeOnFail: {
    count: 500, // Keep last 500 failed jobs
  },
};

// Initialize queues only if Redis is available
export const queues = connection ? {
  render: new Queue(QUEUE_NAMES.RENDER, { connection }),
  email: new Queue(QUEUE_NAMES.EMAIL, { connection }),
  webhook: new Queue(QUEUE_NAMES.WEBHOOK, { connection }),
  fileCleanup: new Queue(QUEUE_NAMES.FILE_CLEANUP, { connection }),
  analytics: new Queue(QUEUE_NAMES.ANALYTICS, { connection }),
} : null;

// Queue event listeners for monitoring
if (queues && connection) {
  Object.entries(queues).forEach(([name, queue]) => {
    const queueEvents = new QueueEvents(name, { connection });
    
    queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`[${name}] Job ${jobId} completed`);
    });
    
    queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`[${name}] Job ${jobId} failed:`, failedReason);
    });
  });
}

// Job interfaces
export interface RenderJobData {
  executionId: string;
  matrixId: string;
  templateId: string;
  assets: Record<string, any>;
  userId: string;
  clientId: string;
  isPreview?: boolean;
}

export interface EmailJobData {
  to: string | string[];
  template: string;
  subject: string;
  data: Record<string, any>;
}

export interface WebhookJobData {
  url: string;
  event: string;
  data: any;
  secret?: string;
  attempts?: number;
  maxAttempts?: number;
}

export interface FileCleanupJobData {
  keys: string[];
  clientId: string;
  reason: 'expired' | 'deleted' | 'failed';
}

export interface AnalyticsJobData {
  event: string;
  userId?: string;
  clientId?: string;
  properties: Record<string, any>;
  timestamp: string;
}

// Add jobs to queues
export async function addRenderJob(data: RenderJobData, priority?: number): Promise<Job | null> {
  if (!queues) {
    console.warn('Queue system not available - render job skipped');
    return null;
  }
  
  return queues.render.add('process-render', data, {
    ...defaultJobOptions,
    priority,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 second delay
    },
  });
}

export async function addEmailJob(data: EmailJobData): Promise<Job | null> {
  if (!queues) {
    console.warn('Queue system not available - email job skipped');
    return null;
  }
  
  return queues.email.add('send-email', data, {
    ...defaultJobOptions,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

export async function addWebhookJob(data: WebhookJobData): Promise<Job | null> {
  if (!queues) {
    console.warn('Queue system not available - webhook job skipped');
    return null;
  }
  
  const attempts = data.maxAttempts || 3;
  const attemptNumber = data.attempts || 0;
  
  return queues.webhook.add('send-webhook', data, {
    ...defaultJobOptions,
    attempts,
    backoff: {
      type: 'exponential',
      delay: Math.pow(2, attemptNumber) * 1000, // Exponential backoff
    },
  });
}

export async function addFileCleanupJob(data: FileCleanupJobData, delay?: number): Promise<Job | null> {
  if (!queues) {
    console.warn('Queue system not available - file cleanup job skipped');
    return null;
  }
  
  return queues.fileCleanup.add('cleanup-files', data, {
    ...defaultJobOptions,
    delay, // Delay in milliseconds
  });
}

export async function addAnalyticsJob(data: AnalyticsJobData): Promise<Job | null> {
  if (!queues) {
    console.warn('Queue system not available - analytics job skipped');
    return null;
  }
  
  return queues.analytics.add('track-event', data, {
    ...defaultJobOptions,
    attempts: 5,
    backoff: {
      type: 'fixed',
      delay: 1000,
    },
  });
}

// Bulk operations
export async function addBulkRenderJobs(jobs: RenderJobData[]): Promise<Job[] | null> {
  if (!queues) {
    console.warn('Queue system not available - bulk render jobs skipped');
    return null;
  }
  
  const bulkJobs = jobs.map(data => ({
    name: 'process-render',
    data,
    opts: {
      ...defaultJobOptions,
      attempts: 3,
      backoff: {
        type: 'exponential' as const,
        delay: 5000,
      },
    },
  }));
  
  return queues.render.addBulk(bulkJobs);
}

// Queue management functions
export async function getQueueStats(queueName: keyof typeof queues): Promise<any> {
  if (!queues) return null;
  const queue = queues[queueName];
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
}

export async function getAllQueueStats(): Promise<Record<string, any>> {
  if (!queues) return {};
  const stats: Record<string, any> = {};
  
  for (const [name, _] of Object.entries(queues)) {
    stats[name] = await getQueueStats(name as keyof typeof queues);
  }
  
  return stats;
}

// Clean queue (remove completed/failed jobs)
export async function cleanQueue(queueName: keyof typeof queues, grace: number = 0): Promise<void> {
  const queue = queues[queueName];
  
  await Promise.all([
    queue.clean(grace, 1000, 'completed'),
    queue.clean(grace, 1000, 'failed'),
  ]);
}

// Pause/resume queue
export async function pauseQueue(queueName: keyof typeof queues): Promise<void> {
  if (!queues) return;
  await queues[queueName].pause();
}

export async function resumeQueue(queueName: keyof typeof queues): Promise<void> {
  if (!queues) return;
  await queues[queueName].resume();
}

// Get job by ID
export async function getJob(queueName: keyof typeof queues, jobId: string): Promise<Job | null> {
  if (!queues) return null;
  return queues[queueName].getJob(jobId);
}

// Retry failed job
export async function retryJob(queueName: keyof typeof queues, jobId: string): Promise<void> {
  const job = await getJob(queueName, jobId);
  if (job && job.failedReason) {
    await job.retry();
  }
}

// Worker health check
export async function checkWorkerHealth(): Promise<boolean> {
  if (!connection) {
    return false;
  }
  
  try {
    // Try to ping Redis
    await connection.ping();
    return true;
  } catch (error) {
    const message = getErrorMessage(error);
    handleError(error as Error);
    return false;
  }
}

// Graceful shutdown
export async function gracefulShutdown(): Promise<void> {
  console.log('Shutting down queues gracefully...');
  
  if (queues) {
    // Close all queues
    await Promise.all(
      Object.values(queues).map(queue => queue.close())
    );
  }
  
  if (connection) {
    // Close Redis connection
    await connection.quit();
  }
  
  console.log('Queues shut down successfully');
}

// Export types
export type QueueName = keyof typeof queues;
export type { Job, Queue, Worker };
