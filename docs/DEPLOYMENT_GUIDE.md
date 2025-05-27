# AIrWAVE Deployment Guide

## Overview

This guide covers deploying AIrWAVE to production using Netlify for the frontend and various cloud services for backend infrastructure.

## Prerequisites

- Node.js 18+ and npm/yarn
- Netlify account
- Supabase project
- AWS account (for S3 storage)
- Redis instance (Upstash recommended)
- Domain name configured

## Deployment Steps

### 1. Environment Setup

#### Create Production Environment Variables

1. Copy `.env.production.example` to `.env.production`
2. Fill in all production values
3. Generate secure secrets:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate JWT_SECRET
   openssl rand -base64 32
   ```

### 2. Database Setup

#### Run Migrations

1. Connect to your Supabase project
2. Run the migration files in order:
   ```sql
   -- Run in Supabase SQL editor
   -- 1. Performance indexes
   -- 2. RLS policies
   -- 3. Any additional migrations
   ```

#### Verify RLS Policies

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Storage Configuration

#### S3 Setup

1. Create S3 bucket: `airwave-production-assets`
2. Configure bucket policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicRead",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::airwave-production-assets/*"
       }
     ]
   }
   ```
3. Set up CloudFront distribution
4. Configure CORS for the bucket

### 4. Redis Setup

#### Upstash Configuration

1. Create Upstash Redis database
2. Enable eviction policy: `allkeys-lru`
3. Set max memory based on expected load
4. Copy connection credentials

### 5. Netlify Deployment

#### Initial Setup

1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

#### Environment Variables

Add all production environment variables to Netlify:

1. Go to Site settings → Environment variables
2. Add each variable from `.env.production`
3. Mark sensitive values as "Sensitive"

#### Deploy Settings

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### 6. Worker Deployment

#### Option 1: Dedicated Server (Recommended)

1. Set up Ubuntu 22.04 server
2. Install dependencies:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Redis (if not using Upstash)
   sudo apt-get install redis-server
   ```

3. Deploy worker code:
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/airwave.git
   cd airwave
   
   # Install dependencies
   npm install
   
   # Start workers with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'airwave-workers',
      script: 'npm',
      args: 'run workers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: 'logs/workers-error.log',
      out_file: 'logs/workers-out.log',
      log_file: 'logs/workers-combined.log',
      time: true,
    },
  ],
};
```

### 7. External Service Configuration

#### Creatomate Webhooks

1. Log into Creatomate dashboard
2. Configure webhook URL: `https://app.airwave.com/api/webhooks/creatomate`
3. Add webhook secret to environment variables

#### Email Domain Verification

1. Add Resend DNS records
2. Verify domain ownership
3. Configure SPF and DKIM

### 8. SSL and Domain Setup

1. Point domain to Netlify
2. Enable automatic HTTPS
3. Configure subdomain for CDN
4. Set up email subdomain

### 9. Monitoring Setup

#### Error Monitoring

1. Verify Sentry integration
2. Set up alert rules
3. Configure release tracking

#### Uptime Monitoring

1. Configure Better Uptime monitors
2. Set up status page
3. Configure alerting

#### Performance Monitoring

```javascript
// Add to pages/_app.tsx
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    analytics.track('Web Vital', {
      metric: metric.name,
      value: metric.value,
      label: metric.label,
    });
  }
}
```

### 10. Pre-Launch Checklist

#### Security
- [ ] All secrets rotated from development
- [ ] RLS policies tested
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints

#### Performance
- [ ] Database indexes created
- [ ] CDN caching headers set
- [ ] Image optimization enabled
- [ ] Bundle size optimized

#### Functionality
- [ ] Email sending tested
- [ ] File uploads working
- [ ] Render queue processing
- [ ] Client portal accessible
- [ ] Analytics tracking

#### Monitoring
- [ ] Error tracking active
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up
- [ ] Alerts configured

### 11. Launch Procedure

1. **Final Testing**
   ```bash
   # Run production build locally
   npm run build
   npm run start
   
   # Test all critical paths
   ```

2. **Deploy to Production**
   ```bash
   # Push to main branch
   git push origin main
   
   # Netlify auto-deploys
   ```

3. **Start Workers**
   ```bash
   # On worker server
   pm2 start ecosystem.config.js
   pm2 status
   ```

4. **Verify Services**
   - Check health endpoint
   - Test user registration
   - Upload test asset
   - Create test campaign
   - Verify email delivery

5. **Monitor Launch**
   - Watch error rates
   - Monitor performance
   - Check queue processing
   - Review user feedback

### 12. Post-Launch

#### Daily Monitoring
- Error rate trends
- Queue backlogs
- Storage usage
- API response times

#### Weekly Tasks
- Review analytics
- Check for updates
- Audit security logs
- Performance review

#### Monthly Tasks
- Security patches
- Dependency updates
- Cost optimization
- Backup verification

## Rollback Procedure

If issues arise:

1. **Immediate Rollback**
   ```bash
   # Netlify
   # Go to Deploys → Click previous deploy → Publish deploy
   
   # Workers
   pm2 stop all
   git checkout previous-tag
   npm install
   pm2 start ecosystem.config.js
   ```

2. **Database Rollback**
   - Restore from point-in-time backup
   - Run rollback migrations if available

3. **Communication**
   - Update status page
   - Notify affected users
   - Document incident

## Scaling Considerations

### Horizontal Scaling
- Add more worker instances
- Implement database read replicas
- Use Redis cluster mode
- CDN geographic distribution

### Vertical Scaling
- Increase worker server resources
- Upgrade database plan
- Increase Redis memory
- Optimize heavy queries

## Support Information

- Documentation: https://docs.airwave.com
- Status Page: https://status.airwave.com
- Support Email: support@airwave.com
- Emergency: [On-call rotation details]
