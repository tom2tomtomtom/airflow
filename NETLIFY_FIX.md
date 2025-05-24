# Netlify Deployment Fix

## ✅ Fixed Edge Runtime Error

The deployment was failing because the middleware was importing `env.ts` which tries to validate environment variables at build time. Edge Functions can't access this during bundling.

### Changes Made:
1. Removed `import { env } from './lib/env'` from middleware.ts
2. Changed to use `process.env.JWT_SECRET` directly
3. This fix has been pushed to GitHub

## 🔑 Add Missing Environment Variable

The error shows `JWT_SECRET` is missing. Add this to your Netlify environment variables:

**In Netlify Dashboard → Site settings → Environment variables:**

```
JWT_SECRET=your-jwt-secret-here
```

**Important:** JWT_SECRET should be:
- At least 32 characters long
- The same value as NEXTAUTH_SECRET (or different if you prefer)
- Generate with: `openssl rand -base64 32`

## 📋 Complete Environment Variables List

Make sure ALL of these are set in Netlify:

```bash
# Authentication (REQUIRED)
NEXTAUTH_URL=https://airwave2.netlify.app/
NEXTAUTH_SECRET=your-32-char-secret
JWT_SECRET=your-32-char-secret  # <-- ADD THIS!

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI Services (REQUIRED)
OPENAI_API_KEY=sk-your-key
ELEVENLABS_API_KEY=your-key
RUNWAY_API_KEY=your-key

# Optional
CREATOMATE_API_KEY=your-key
```

## 🚀 Next Steps

1. Add `JWT_SECRET` to Netlify environment variables
2. Trigger a new deployment
3. Build should now succeed!

The fix for the Edge Runtime compatibility has already been pushed to your repository.
