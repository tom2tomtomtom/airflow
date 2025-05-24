# Netlify Deployment Guide

## Quick Start

This guide helps you deploy AIRWAVE_0525_CODEX to Netlify.

## Required Environment Variables

You must set these environment variables in Netlify's dashboard:

### Critical Variables (Build will fail without these)
- `NEXTAUTH_URL` - Set to your Netlify URL (e.g., `https://your-app.netlify.app`)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key

### Required for Functionality
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key

### Additional API Keys (if using these features)
- `CREATOMATE_API_KEY` - For video generation
- `ELEVENLABS_API_KEY` - For voice synthesis
- `RUNWAY_API_KEY` - For AI video features

## Setting Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to **Site configuration** → **Environment variables**
4. Click **Add a variable**
5. Add each variable with its value
6. Deploy or redeploy your site

## Build Settings

Your `netlify.toml` should already be configured, but verify:
- Build command: `npm run build`
- Publish directory: (leave empty or set to `.next`)

## Troubleshooting

### Build Fails with TypeScript Errors
- Ensure all TypeScript errors are resolved locally first
- Run `npm run build` locally to test

### Missing Environment Variables
- The build log will show which variables are missing
- Add them in Netlify's environment variables section

### Node Version Issues
- Netlify uses Node 18 by default
- You can specify a version in `.nvmrc` or environment variables

## Production Checklist

Before deploying to production:
1. ✅ All required environment variables are set
2. ✅ Production values are used (not development)
3. ✅ NEXTAUTH_URL matches your production domain
4. ✅ All API keys are valid and have proper permissions
5. ✅ Database is properly configured for production use
