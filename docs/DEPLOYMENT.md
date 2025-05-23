# AIrWAVE Deployment Guide

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase project
- API keys for OpenAI and ElevenLabs
- (Optional) Docker for containerized deployment

## Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX.git
   cd AIRWAVE_0525_CODEX
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key # Only for scripts

   # Authentication
   JWT_SECRET=your-jwt-secret-min-32-chars
   JWT_EXPIRY=7d

   # AI Services
   OPENAI_API_KEY=sk-your-openai-key
   ELEVENLABS_API_KEY=your-elevenlabs-key

   # Optional
   CREATOMATE_API_KEY=your-creatomate-key
   ```

## Database Setup

1. **Run Supabase migrations:**
   ```bash
   cd supabase
   supabase db push
   ```

2. **Seed initial data (optional):**
   ```bash
   npm run seed
   ```

## Local Development

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Test the production build:**
   ```bash
   npm start
   ```

## Deployment Options

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

### Docker Deployment

1. **Build Docker image:**
   ```bash
   docker build -t airwave:latest .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Copy files to server:**
   - `.next/` directory
   - `public/` directory
   - `package.json`
   - `package-lock.json`
   - `next.config.js`

3. **Install production dependencies:**
   ```bash
   npm ci --production
   ```

4. **Start with PM2:**
   ```bash
   pm2 start npm --name "airwave" -- start
   pm2 save
   pm2 startup
   ```

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] JWT_SECRET is at least 32 characters
- [ ] Supabase RLS policies are enabled
- [ ] CORS is configured for your domain
- [ ] SSL/TLS certificate is installed
- [ ] Security headers are configured (handled by middleware)
- [ ] Rate limiting is enabled (handled by middleware)

## Monitoring Setup

### Health Checks

- **Basic status:** `GET /api/status`
- **Detailed health:** `GET /api/health`

### Recommended Monitoring Tools

1. **Uptime Monitoring:**
   - Configure monitoring for `/api/status`
   - Alert on 5xx responses or timeouts

2. **Application Monitoring:**
   - Sentry for error tracking
   - New Relic or DataDog for performance

3. **Log Aggregation:**
   - CloudWatch Logs (AWS)
   - Stackdriver (GCP)
   - LogDNA or Papertrail

## Performance Optimization

1. **Enable caching:**
   ```nginx
   # nginx.conf
   location /_next/static {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

2. **Configure CDN:**
   - CloudFlare
   - AWS CloudFront
   - Vercel Edge Network

3. **Database indexes:**
   Ensure indexes exist for:
   - `profiles.email`
   - `assets.client_id`
   - `assets.created_at`
   - `templates.platform`

## Backup Strategy

1. **Database backups:**
   - Enable Supabase point-in-time recovery
   - Schedule daily backups

2. **Asset backups:**
   - Configure S3 cross-region replication
   - Enable versioning on storage buckets

## Scaling Considerations

### Horizontal Scaling

1. **Application servers:**
   - Use load balancer (nginx, HAProxy)
   - Session persistence with Redis
   - Shared storage for uploads

2. **Database scaling:**
   - Enable Supabase read replicas
   - Implement connection pooling

### Vertical Scaling

Monitor and adjust:
- CPU and memory allocation
- Database connection limits
- File upload size limits

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Database connection errors:**
   - Check Supabase URL and keys
   - Verify network connectivity
   - Check connection pool limits

3. **Authentication failures:**
   - Verify JWT_SECRET matches across deployments
   - Check token expiration settings
   - Clear browser cookies

### Debug Mode

Enable debug logging:
```env
DEBUG=airwave:*
LOG_LEVEL=debug
```

## Maintenance

### Regular Tasks

- **Weekly:**
  - Review error logs
  - Check disk usage
  - Monitor API rate limits

- **Monthly:**
  - Update dependencies
  - Review security alerts
  - Analyze performance metrics

- **Quarterly:**
  - Security audit
  - Database optimization
  - Backup restoration test

### Update Process

1. **Test in staging:**
   ```bash
   git checkout -b staging
   npm run test
   npm run build
   ```

2. **Deploy with zero downtime:**
   ```bash
   pm2 reload airwave
   ```

3. **Rollback if needed:**
   ```bash
   git checkout main
   npm run build
   pm2 reload airwave
   ```

## Support

For deployment support:
- GitHub Issues: https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX/issues
- Documentation: /docs
- Community: Discord/Slack (if available)
