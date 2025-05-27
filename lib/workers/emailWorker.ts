import { Worker, Job } from 'bullmq';
import { connection } from '@/lib/queue/connection';
import { EmailJobData } from '@/lib/queue/bullQueue';
import { sendEmail } from '@/lib/email/resend';
import * as Sentry from '@sentry/node';

// Process email job
async function processEmailJob(job: Job<EmailJobData>) {
  const { to, template, subject, data } = job.data;
  
  try {
    console.log(`Processing email job: ${template} to ${Array.isArray(to) ? to.join(', ') : to}`);
    
    // Send email using Resend
    const result = await sendEmail({
      to,
      subject,
      template: template as any,
      data,
    });
    
    console.log(`Email sent successfully: ${result.id}`);
    
    return {
      success: true,
      emailId: result.id,
      to,
      template,
    };
  } catch (error) {
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
    connection,
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
  if (!job?.returnvalue?.permanentFailure) {
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
