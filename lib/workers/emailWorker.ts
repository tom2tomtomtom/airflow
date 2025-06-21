import { getErrorMessage } from '@/utils/errorUtils';
import { Worker, Job } from 'bullmq';
import { connectionOptions } from '@/lib/queue/connection';
import { EmailJobData } from '@/lib/queue/bullQueue';
import { sendEmail, EmailTemplate } from '../email/resend';
import * as Sentry from '@sentry/node';

// Process email job
async function processEmailJob(job: Job<EmailJobData>): Promise<{ success: boolean; emailId: string; to: string | string[]; template: string; } | { success: false; permanentFailure: boolean; error: string; }> {
  const { to, template, subject, data } = job.data;
  
  try {
    console.log(`Processing email job: ${template} to ${Array.isArray(to) ? to.join(', ') : to}`);
    
    // Send email using Resend
    const result = await sendEmail({
      to,
      subject,
      template: template as EmailTemplate,
      data,
    });
    
    const resultId = typeof result === 'object' && result && 'id' in result 
      ? (result as { id: string }).id 
      : 'unknown';
    console.log(`Email sent successfully: ${resultId}`);
    
    return {
      success: true,
      emailId: resultId,
      to,
      template,
    };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Email send failed:', error);
    
    // Check if it's a permanent failure
    const isPermanentFailure = 
      error instanceof Error && 
      (error.message.includes('invalid email') ||
       error.message.includes('domain not found') ||
       error.message.includes('blocked'));
    
    if (isPermanentFailure) {
      // Don't retry permanent failures
      console.error('Permanent email failure, not retrying:', error);
      return {
        success: false,
        permanentFailure: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    
    // Re-throw for retry
    throw error;
  }
}

// Create email worker
export const emailWorker = new Worker(
  'email',
  processEmailJob,
  {
    connection: connectionOptions,
    concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '5'),
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }
);

// Worker event handlers
emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error);
  
  // Only capture to Sentry if it's not a permanent failure
  const returnValue = job?.returnvalue as any;
  if (!returnValue?.permanentFailure) {
    Sentry.captureException(error, {
      tags: {
        job_type: 'email',
        job_id: job?.id,
        template: job?.data.template,
      },
      extra: {
        to: job?.data.to,
        subject: job?.data.subject,
      },
    });
  }
});

emailWorker.on('error', (error) => {
  console.error('Email worker error:', error);
  Sentry.captureException(error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing email worker...');
  await emailWorker.close();
});
