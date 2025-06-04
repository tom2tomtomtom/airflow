# 🚀 AIRWAVE CLI Deployment Guide

Complete guide for deploying AIRWAVE using Supabase + Netlify + Playwright CLI.

## 🏃‍♂️ Quick Start

```bash
# 1. Run setup script
./setup-deployment.sh

# 2. Start development
npm run dev

# 3. Run tests
npm run test:e2e
```

## 📋 Prerequisites

- **Node.js 18+** and **npm 10+**
- **Git** repository
- **Supabase** account and project
- **Netlify** account

## 🔧 Installation & Setup

### 1. Project Setup

```bash
# Clone and navigate to project
cd AIRWAVE_0525_CODEX

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Install Supabase CLI (optional for local development)
npm install -g supabase
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

Required environment variables:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
CREATOMATE_API_KEY=your_creatomate_api_key_here
RESEND_API_KEY=your_resend_api_key_here
TEST_EMAIL=your_test_email@example.com
TEST_PASSWORD=your_test_password
NEXT_PUBLIC_BASE_URL=https://your-app-url.netlify.app
```

## 🗄️ Supabase Setup

### Database Migration

```bash
# 1. Login to Supabase (if using CLI)
supabase login

# 2. Link to your project
supabase link --project-ref your-project-ref

# 3. Run migrations
supabase db push

# OR manually via Supabase Dashboard:
# - Go to SQL Editor
# - Run: scripts/setup-supabase-complete.sql
```

### Storage Buckets

The setup script creates these buckets:
- `assets` - User uploads (100MB limit)
- `templates` - Creatomate templates (50MB limit)  
- `renders` - Generated outputs (200MB limit)
- `avatars` - Profile pictures (10MB limit)
- `campaigns` - Campaign files (50MB limit)

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ... (handled by migration script)
```

## 🌐 Netlify Deployment

### Configuration

Your `netlify.toml` is already configured with:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 20
- **Next.js Plugin**: `@netlify/plugin-nextjs`

### Environment Variables in Netlify

Add these in Netlify Dashboard → Site Settings → Environment Variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
CREATOMATE_API_KEY=your_creatomate_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
NODE_ENV=production
```

### Deploy Commands

```bash
# Deploy via Git (recommended)
git add .
git commit -m "Deploy AIRWAVE"
git push origin main

# Manual deploy via Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 🎭 Playwright Testing

### Test Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test
npm run test:auth

# Debug authentication
npm run debug:auth
```

### Test Configuration

Multiple Playwright configs for different scenarios:
- `playwright.config.ts` - Main configuration
- `playwright.config.comprehensive.ts` - Full test suite
- `playwright.config.production.ts` - Production tests
- `playwright-standalone.config.ts` - Standalone tests

### Available Test Suites

```bash
# Authentication tests
npx playwright test tests/e2e/auth-comprehensive-test.spec.ts

# Complete workflow tests  
npx playwright test tests/e2e/complete-user-workflow.spec.ts

# UI/UX tests
npx playwright test tests/e2e/comprehensive-ux-ui-test.spec.ts

# MVP readiness tests
npx playwright test tests/e2e/mvp-comprehensive-test.spec.ts
```

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development server
npm run dev

# Run TypeScript checks
npm run type-check

# Fix TypeScript errors
npm run fix:typescript:all

# Run linting
npm run lint

# Test build
npm run build
```

### Pre-Deployment Checklist

```bash
# 1. Fix any critical errors
npm run fix:typescript:all

# 2. Test build
npm run build

# 3. Run comprehensive tests
npm run test:e2e

# 4. Check environment variables
# Verify all required vars are set in Netlify

# 5. Deploy
git push origin main
```

## 🔍 Debugging & Monitoring

### Log Locations

```bash
# Development logs
tail -f dev.log

# TypeScript errors
cat typescript-errors-remaining.log

# Build errors (check Netlify build logs)
# https://app.netlify.com/sites/your-site/deploys
```

### Common Issues & Solutions

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**TypeScript Errors:**
```bash
# Auto-fix common issues
npm run fix:typescript:all

# Manual check
npm run type-check
```

**Test Failures:**
```bash
# Update test snapshots
npx playwright test --update-snapshots

# Debug specific test
npx playwright test --debug tests/e2e/auth.test.ts
```

**Supabase Connection Issues:**
```bash
# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Connection test:', client);
"
```

## 📊 Performance Testing

```bash
# Load testing with Playwright
npx playwright test tests/e2e/performance/ --project=chromium

# Lighthouse audit (if configured)
npm install -g lighthouse
lighthouse https://your-site.netlify.app
```

## 🔄 CI/CD Integration

### GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npx playwright install chromium
      - run: npm run test:e2e
```

## 🚨 Emergency Procedures

### Rollback Deployment

```bash
# Via Netlify CLI
netlify sites:list
netlify deploy --site=your-site-id --dir=.next

# Via Dashboard
# Go to Netlify → Deploys → Click on previous successful deploy → "Publish deploy"
```

### Database Recovery

```bash
# Backup current state
supabase db dump --db-url "your-db-url" > backup.sql

# Restore from backup
supabase db reset --db-url "your-db-url"
psql "your-db-url" < backup.sql
```

---

## 🎯 Summary

Your AIRWAVE deployment stack:
- **Frontend**: Next.js 15 + React 18
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Testing**: Playwright
- **CI/CD**: Git-based deployment

**Key Commands:**
- `./setup-deployment.sh` - Initial setup
- `npm run dev` - Development
- `npm run test:e2e` - Testing  
- `git push` - Deploy

**Monitor:** 
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://supabase.com/dashboard
- Playwright Reports: `./playwright-report/index.html`