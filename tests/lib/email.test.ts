import { sendEmail, sendClientApprovalEmail } from '@/lib/email/resend';
import { ClientApprovalData } from '@/lib/email/resend';

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({
        data: { id: 'test-email-id' },
        error: null,
      }),
    },
  })),
}));

describe('Email Service', () => {
  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'welcome',
        data: {
          firstName: 'Test',
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('test-email-id');
    });

    it('should handle email errors', async () => {
      // Mock error response
      const Resend = require('resend').Resend;
      Resend.mockImplementationOnce(() => ({
        emails: {
          send: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid email address' },
          }),
        },
      }));

      await expect(
        sendEmail({
          to: 'invalid-email',
          subject: 'Test',
          template: 'welcome',
          data: {},
        })
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendClientApprovalEmail', () => {
    it('should send client approval email', async () => {
      const data: ClientApprovalData & { to: string } = {
        to: 'client@example.com',
        clientName: 'Test Client',
        campaignName: 'Summer Campaign',
        approvalUrl: 'https://app.airwave.com/approve/123',
        submitterName: 'John Doe',
        assetCount: 10,
        message: 'Please review these assets',
      };

      const result = await sendClientApprovalEmail(data);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-email-id');
    });
  });
});
