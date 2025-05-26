import { Resend } from 'resend';
import { ClientApprovalEmail } from '@/emails/templates/ClientApproval';
import { RenderCompleteEmail } from '@/emails/templates/RenderComplete';
import { WelcomeEmail } from '@/emails/templates/Welcome';
import { PasswordResetEmail } from '@/emails/templates/PasswordReset';
import { SystemAlertEmail } from '@/emails/templates/SystemAlert';

const resend = new Resend(process.env.RESEND_API_KEY!);

export type EmailTemplate = 
  | 'client-approval'
  | 'render-complete'
  | 'welcome'
  | 'password-reset'
  | 'system-alert';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

export interface ClientApprovalData {
  clientName: string;
  campaignName: string;
  approvalUrl: string;
  submitterName: string;
  assetCount: number;
  message?: string;
}

export interface RenderCompleteData {
  campaignName: string;
  renderCount: number;
  successCount: number;
  failedCount: number;
  downloadUrl: string;
  completedAt: string;
}

export interface WelcomeData {
  firstName: string;
  verificationUrl?: string;
}

export interface PasswordResetData {
  resetUrl: string;
  expiresIn: string;
}

export interface SystemAlertData {
  alertType: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp: string;
}

function getTemplate(template: EmailTemplate, data: Record<string, any>) {
  switch (template) {
    case 'client-approval':
      return ClientApprovalEmail(data as ClientApprovalData);
    case 'render-complete':
      return RenderCompleteEmail(data as RenderCompleteData);
    case 'welcome':
      return WelcomeEmail(data as WelcomeData);
    case 'password-reset':
      return PasswordResetEmail(data as PasswordResetData);
    case 'system-alert':
      return SystemAlertEmail(data as SystemAlertData);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, template, data } = options;
  
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'AIrWAVE <notifications@airwave.app>',
      to: Array.isArray(to) ? to : [to],
      subject,
      react: getTemplate(template, data),
    });
    
    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log('Email sent successfully:', result?.id);
    return result;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

// Helper functions for common email sends
export async function sendClientApprovalEmail(data: ClientApprovalData & { to: string }) {
  return sendEmail({
    to: data.to,
    subject: `Review Required: ${data.campaignName}`,
    template: 'client-approval',
    data,
  });
}

export async function sendRenderCompleteEmail(data: RenderCompleteData & { to: string }) {
  return sendEmail({
    to: data.to,
    subject: `Render Complete: ${data.campaignName}`,
    template: 'render-complete',
    data,
  });
}

export async function sendWelcomeEmail(data: WelcomeData & { to: string }) {
  return sendEmail({
    to: data.to,
    subject: 'Welcome to AIrWAVE!',
    template: 'welcome',
    data,
  });
}

export async function sendPasswordResetEmail(data: PasswordResetData & { to: string }) {
  return sendEmail({
    to: data.to,
    subject: 'Password Reset Request',
    template: 'password-reset',
    data,
  });
}

export async function sendSystemAlertEmail(data: SystemAlertData & { to: string }) {
  const alertEmoji = {
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  return sendEmail({
    to: data.to,
    subject: `${alertEmoji[data.alertType]} System Alert: ${data.message.slice(0, 50)}...`,
    template: 'system-alert',
    data,
  });
}
