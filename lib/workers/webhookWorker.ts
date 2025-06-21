import { getErrorMessage } from '@/utils/errorUtils';
import { Worker, Job } from 'bullmq';
import { connectionOptions } from '@/lib/queue/connection';
import { WebhookJobData, addWebhookJob } from '@/lib/queue/bullQueue';
import crypto from 'crypto';
import * as Sentry from '@sentry/node';

// Generate webhook signature
function generateSignature(payload: any, secret: string): string {
  const timestamp = Date.now();
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Process webhook job
async function processWebhookJob(job: Job<WebhookJobData>): Promise<{ success: boolean; status?: number; response?: string; deliveredAt?: string; retryScheduled?: boolean; permanentFailure?: boolean; error?: string; attempts?: number; }> {
  const { url, event, data, secret, attempts = 0, maxAttempts = 3 } = job.data;
  
  try {
    console.log(`Sending webhook: ${event} to ${url} (attempt ${attempts + 1}/${maxAttempts})`);
    
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': event,
      'X-Webhook-Delivery': job.id!,
      'User-Agent': 'AIrWAVE-Webhook/1.0',
    };
    
    // Add signature if secret is provided
    if (secret) {
      headers['X-Webhook-Signature'] = generateSignature(payload, secret);
    }
    
    // Send webhook with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    }
    
    console.log(`Webhook delivered successfully: ${event} to ${url}`);
    
    return {
      success: true,
      status: response.status,
      response: responseText,
      deliveredAt: new Date().toISOString(),
    };
    
  } catch (error) {
    const message = getErrorMessage(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if we should retry
    if (attempts + 1 < maxAttempts) {
      console.log(`Webhook failed, scheduling retry ${attempts + 2}/${maxAttempts}`);
      
      // Add retry job with exponential backoff
      await addWebhookJob({
        ...job.data,
        attempts: attempts + 1,
      });
      
      // Return without throwing to mark this job as complete
      return {
        success: false,
        retryScheduled: true,
        error: errorMessage,
      };
    }
    
    // Max attempts reached, give up
    console.error(`Webhook failed after ${maxAttempts} attempts:`, error);
    
    // Log to Sentry for investigation
    Sentry.captureException(error, {
      tags: {
        job_type: 'webhook',
        job_id: job.id,
        webhook_event: event,
        webhook_url: url,
      },
      extra: {
        attempts: attempts + 1,
        maxAttempts,
        data,
      },
    });
    
    return {
      success: false,
      permanentFailure: true,
      error: errorMessage,
      attempts: attempts + 1,
    };
  }
}

// Create webhook worker
export const webhookWorker = new Worker(
  'webhook',
  processWebhookJob,
  {
    connection: connectionOptions,
    concurrency: parseInt(process.env.WEBHOOK_WORKER_CONCURRENCY || '10'),
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  }
);

// Worker event handlers
webhookWorker.on('completed', (job) => {
  if (job.returnvalue?.success) {
    console.log(`Webhook job ${job.id} delivered successfully`);
  } else if (job.returnvalue?.retryScheduled) {
    console.log(`Webhook job ${job.id} failed, retry scheduled`);
  } else {
    console.log(`Webhook job ${job.id} failed permanently`);
  }
});

webhookWorker.on('failed', (job, error) => {
  console.error(`Webhook job ${job?.id} failed unexpectedly:`, error);
  Sentry.captureException(error, {
    tags: {
      job_type: 'webhook',
      job_id: job?.id,
    },
  });
});

webhookWorker.on('error', (error) => {
  console.error('Webhook worker error:', error);
  Sentry.captureException(error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing webhook worker...');
  await webhookWorker.close();
});
