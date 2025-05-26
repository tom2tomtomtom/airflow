# Week 1 Implementation Guide - Critical Infrastructure

This guide provides step-by-step instructions for implementing the Week 1 critical infrastructure components.

## Day 1-2: Email Service Implementation

### 1. Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Create an account
3. Add and verify your domain (airwave.com)
4. Generate an API key
5. Add to Netlify environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

### 2. Install Dependencies
```bash
npm install resend @react-email/components @react-email/render
```

### 3. Implement Email Service
The email service has been implemented in:
- `lib/email/resend.ts` - Main email service
- `emails/templates/ClientApproval.tsx` - Client approval template

Create additional templates:
- `emails/templates/RenderComplete.tsx`
- `emails/templates/Welcome.tsx`
- `emails/templates/PasswordReset.tsx`
- `emails/templates/SystemAlert.tsx`

### 4. Integrate Email Sending

#### User Registration
```typescript
// In your registration handler
import { sendWelcomeEmail } from '@/lib/email/resend';

// After successful user creation
await sendWelcomeEmail({
  to: user.email,
  firstName: user.firstName,
});
```

#### Client Approval
```typescript
// In your approval submission handler
import { sendClientApprovalEmail } from '@/lib/email/resend';

await sendClientApprovalEmail({
  to: clientEmail,
  clientName: client.name,
  campaignName: campaign.name,
  approvalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/${approvalToken}`,
  submitterName: user.name,
  assetCount: assets.length,
});
```

## Day 2-3: Error Tracking Setup

### 1. Create Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Create a new project (Next.js)
3. Copy DSN and auth token
4. Add to Netlify environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_AUTH_TOKEN=xxx
   SENTRY_ORG=your-org
   SENTRY_PROJECT=airwave
   ```

### 2. Install and Configure Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 3. Configuration Files
The following files have been created:
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration

### 4. Add Error Boundary
```typescript
// components/ErrorBoundary.tsx
import { ErrorBoundary } from '@sentry/nextjs';

export default function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />} showDialog>
      {children}
    </ErrorBoundary>
  );
}
```

### 5. Use Error Handler in API Routes
```typescript
import { withErrorHandler } from '@/lib/errors/errorHandler';

export default withErrorHandler(async (req, res) => {
  // Your API logic here
  // Errors will be automatically caught and reported
});
```

## Day 3-4: Production Storage & CDN

### 1. Create AWS S3 Bucket
1. Log into AWS Console
2. Create S3 bucket: `airwave-production-assets`
3. Enable versioning
4. Configure CORS:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["https://app.airwave.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

### 2. Create CloudFront Distribution
1. Create distribution with S3 origin
2. Configure caching behaviors
3. Set up custom domain (cdn.airwave.com)
4. Enable compression

### 3. Create IAM User
1. Create user: `airwave-s3-user`
2. Attach policy with S3 permissions
3. Generate access keys
4. Add to Netlify:
   ```
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=airwave-production-assets
   CDN_DOMAIN=cdn.airwave.com
   ```

### 4. Update File Upload Logic
```typescript
// In your upload handler
import { S3Storage } from '@/lib/storage/s3Storage';

const storage = new S3Storage(clientId);

const file = await storage.upload(
  fileBuffer,
  filename,
  {
    contentType: mimeType,
    onProgress: (progress) => {
      // Update progress UI
    },
  }
);

// Save file.cdnUrl to database
```

## Day 5: Monitoring & Health Checks

### 1. Set Up Better Uptime
1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Add monitors for:
   - Main application URL
   - API health endpoint
   - Render service
   - WebSocket service

### 2. Configure Alerts
1. Add team members
2. Set up escalation policy
3. Configure Slack integration
4. Set up SMS alerts for critical issues

### 3. Implement Health Check
The health check endpoint has been implemented at:
- `pages/api/health.ts`

This checks:
- Database connectivity
- Redis connection
- S3/Storage access
- Creatomate API
- Email service

### 4. Test Health Endpoint
```bash
curl https://app.airwave.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": { "status": "ok", "latency": 23 },
    "redis": { "status": "ok", "latency": 5 },
    "storage": { "status": "ok", "latency": 45 },
    "creatomate": { "status": "ok", "latency": 234 },
    "email": { "status": "ok", "latency": 0 }
  }
}
```

## Testing Checklist

### Email Service
- [ ] Welcome email sends on registration
- [ ] Password reset email works
- [ ] Client approval email includes correct link
- [ ] Render complete notification sends
- [ ] Emails render correctly in major clients

### Error Tracking
- [ ] Client errors are captured
- [ ] Server errors are captured
- [ ] Error context is helpful
- [ ] Sensitive data is filtered
- [ ] Alerts are received for critical errors

### Storage & CDN
- [ ] Files upload to S3 successfully
- [ ] CDN serves files with caching
- [ ] Large files (50MB+) upload reliably
- [ ] Progress tracking works
- [ ] File deletion works

### Health Monitoring
- [ ] Health endpoint returns correct status
- [ ] Monitoring alerts work
- [ ] Status page is accessible
- [ ] Escalation policy triggers correctly

## Common Issues & Solutions

### Email Delivery Issues
- Check domain verification in Resend
- Verify SPF and DKIM records
- Check spam folder
- Monitor bounce rates

### Sentry Not Capturing Errors
- Verify DSN is correct
- Check network tab for Sentry requests
- Ensure error boundary is wrapping app
- Check Sentry dashboard filters

### S3 Upload Failures
- Check CORS configuration
- Verify IAM permissions
- Check bucket policy
- Monitor upload size limits

### Health Check Timeouts
- Increase timeout values
- Check service dependencies
- Monitor service performance
- Add circuit breakers

## Next Steps
Once Week 1 is complete, proceed to Week 2:
- Rate limiting implementation
- Background job queues
- Webhook retry system
- Database optimization
