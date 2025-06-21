import { getErrorMessage } from '@/utils/errorUtils';
// workers/email.ts
import { Worker, Job } from 'bullmq';
import { connectionOptions } from '@/lib/queue/connection';
import { sendEmail } from '../lib/email/resend';

interface EmailJobData {
  to: string;
  template: 'welcome' | 'render-complete' | 'client-approval' | 'password-reset';
  data: Record<string, any>;
}

export const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job: Job<EmailJobData>) => {
    const { to, template, data } = job.data;
    
    try {
      await sendEmail({
        to,
        subject: `Template: ${template}`,
        template,
        data
      });
      
      return { success: true, sentAt: new Date().toISOString() };
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Email send failed:', error);
      throw error;
    }
  },
  {
    connection: connectionOptions,
    concurrency: 10,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 }
  }
);