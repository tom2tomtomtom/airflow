import { Resend } from 'resend';

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

function getTemplate(template: EmailTemplate, data: Record<string, any>): string {
  switch (template) {
    case 'client-approval':
      const approval = data as ClientApprovalData;
      return `
        <h1>AIrWAVE - Campaign Approval Needed</h1>
        <p>Hello,</p>
        <p>A new campaign "${approval.campaignName}" for ${approval.clientName} is ready for your approval.</p>
        <p>Submitted by: ${approval.submitterName}</p>
        <p>Assets: ${approval.assetCount}</p>
        ${approval.message ? `<p>Message: ${approval.message}</p>` : ''}
        <a href="${approval.approvalUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Campaign</a>
      `;
    case 'render-complete':
      const render = data as RenderCompleteData;
      return `
        <h1>AIrWAVE - Render Complete</h1>
        <p>Your campaign "${render.campaignName}" has finished rendering.</p>
        <p>Results: ${render.successCount} successful, ${render.failedCount} failed out of ${render.renderCount} total.</p>
        <a href="${render.downloadUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Results</a>
      `;
    case 'welcome':
      const welcome = data as WelcomeData;
      return `
        <h1>Welcome to AIrWAVE, ${welcome.firstName}!</h1>
        <p>Thank you for joining AIrWAVE. We're excited to help you create amazing content.</p>
        ${welcome.verificationUrl ? `<a href="${welcome.verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>` : ''}
      `;
    case 'password-reset':
      const reset = data as PasswordResetData;
      return `
        <h1>AIrWAVE - Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password.</p>
        <p>This link expires in ${reset.expiresIn}.</p>
        <a href="${reset.resetUrl}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      `;
    case 'system-alert':
      const alert = data as SystemAlertData;
      return `
        <h1>AIrWAVE - System Alert</h1>
        <p><strong>${alert.alertType.toUpperCase()}:</strong> ${alert.message}</p>
        ${alert.details ? `<p>Details: ${alert.details}</p>` : ''}
        <p>Time: ${alert.timestamp}</p>
      `;
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, template, data } = options;
  
  try {
    const result = await resend.emails.send({
      from: 'AIrWAVE <notifications@airwave.app>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: getTemplate(template, data),
    });
    
    // Check if result has data property (success) or error property
    if ('error' in result && result.error) {
      console.error('Resend error:', result.error);
      const errorMessage = typeof result.error === 'object' && result.error && 'message' in result.error 
        ? (result.error as { message: string }).message 
        : 'Unknown email error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
    
    if ('data' in result && result.data) {
      console.log('Email sent successfully:', result.data.id);
      return result.data;
    }
    
    throw new Error('Unexpected response from Resend API');
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
