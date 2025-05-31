# 🔧 Netlify Environment Variables for AIrWAVE

Copy these environment variables to your Netlify site settings. Go to **Site Settings > Environment Variables** and add each one.

## 🔑 Required Variables (Critical)

These variables are **mandatory** for the application to function:

```env
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-netlify-site.netlify.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-32-character-random-secret-here
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
STORAGE_BUCKET=airwave-assets
MAX_FILE_SIZE=52428800
```

## 🎯 Feature Flags

Control which features are enabled:

```env
ENABLE_AI_FEATURES=true
ENABLE_VIDEO_GENERATION=true
ENABLE_SOCIAL_PUBLISHING=false
```

## 🤖 AI Service API Keys (Optional)

Add these to enable AI features:

```env
OPENAI_API_KEY=sk-your-openai-key-here
CREATOMATE_API_KEY=your-creatomate-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
RUNWAY_API_KEY=your-runway-key-here
```

## 📧 Email Configuration (Optional)

For user notifications and system emails. If not configured, emails will be logged to the console:

```env
RESEND_API_KEY=re_your-resend-api-key-here
```

## 🗄️ Redis Configuration (Optional)

For rate limiting and queue management. If not configured, these features will be disabled:

```env
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
```

## 📊 Monitoring (Optional)

For error tracking and analytics:

```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

## 🔒 Security Configuration

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://your-netlify-site.netlify.app
```

---

## 📝 Instructions for Setup

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings > API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - **Service role** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
openssl rand -hex 32
```

### Step 3: Update Site-Specific Values

Replace these placeholders with your actual values:

- `https://your-netlify-site.netlify.app` → Your actual Netlify URL
- `https://yourdomain.com` → Your custom domain (if any)
- `noreply@yourdomain.com` → Your actual email domain

### Step 4: Set Environment Variables in Netlify

1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site Settings > Environment Variables**
4. Click **Add a variable** for each environment variable above
5. Copy the exact key and value for each variable

### Step 5: Trigger a New Build

After setting all variables:

1. Go to **Deploys** in your Netlify dashboard
2. Click **Trigger deploy** > **Deploy site**
3. Wait for the build to complete

---

## ⚠️ Security Notes

- **Never commit these values to version control**
- **Keep your Service Role Key secure** - it has admin access to your database
- **Rotate API keys regularly** for better security
- **Use environment-specific values** for different deployment stages

## 🔍 Verification

After deployment, verify your setup by:

1. Visiting your deployed site
2. Checking the browser console for errors
3. Testing user registration and login
4. Creating a test client and uploading an asset

If you encounter issues, check the Netlify build logs and ensure all required environment variables are set correctly.

---

## 🚀 Quick Setup with Netlify CLI

If you have Netlify CLI installed, you can set these programmatically:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and link your site
netlify login
netlify link

# Set variables (replace values with your actual credentials)
netlify env:set NEXT_PUBLIC_DEMO_MODE "false"
netlify env:set NODE_ENV "production"
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-service-key"
netlify env:set JWT_SECRET "your-jwt-secret"
# ... continue with other variables

# Deploy
netlify deploy --prod
```

---

**🎉 Once all environment variables are set, your AIrWAVE application will be fully functional in production!**