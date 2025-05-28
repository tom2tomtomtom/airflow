# Netlify Setup Guide for AIrWAVE

This guide will help you properly configure AIrWAVE on Netlify.

## Quick Start

### 1. Required Environment Variables

Add these environment variables in Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...

# Authentication (Required)
JWT_SECRET=your-secret-at-least-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.netlify.app

# Demo Mode (Optional - set to true to bypass auth)
NEXT_PUBLIC_DEMO_MODE=false

# API Keys (Optional but recommended)
OPENAI_API_KEY=sk-...
CREATOMATE_API_KEY=your-key
ELEVENLABS_API_KEY=your-key
RUNWAY_API_KEY=your-key
```

### 2. Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Generating Secrets

Generate secure secrets for JWT and NextAuth:

```bash
# For JWT_SECRET (minimum 32 characters)
openssl rand -base64 32

# For NEXTAUTH_SECRET
openssl rand -base64 32
```

### 4. Verify Configuration

After deployment, visit these URLs to check your setup:

1. **System Status**: `https://your-app.netlify.app/system-status`
   - Shows configuration status
   - Identifies missing variables
   - Tests Supabase connection

2. **API Status**: `https://your-app.netlify.app/api/system/status`
   - Returns JSON with detailed status

## Troubleshooting

### 404 Error on Home Page
- Ensure the latest deployment includes the netlify.toml fix
- Clear cache and redeploy: Deploys → Trigger Deploy → Clear cache and deploy site

### Authentication Errors
1. Check if `NEXT_PUBLIC_DEMO_MODE=true` for testing without real auth
2. Verify all Supabase credentials are correct
3. Ensure `NEXTAUTH_URL` matches your Netlify URL exactly

### Supabase Connection Failed
1. Check if your Supabase project is active (not paused)
2. Verify the anon key and service role key are from the same project
3. Check Supabase dashboard for any API restrictions

### Environment Variables Not Working
1. After adding variables, trigger a new deployment
2. Variables are only available after deployment completes
3. Use the system status page to verify they're loaded

## Demo Mode

To run the app without external services:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

In demo mode:
- Any email/password combination works for login
- External API calls are mocked
- No real data is stored

## Production Checklist

Before going live:

- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Ensure all required environment variables are set
- [ ] Generate secure secrets (not default values)
- [ ] Set up Supabase tables and RLS policies
- [ ] Configure custom domain (if applicable)
- [ ] Enable Netlify Analytics (optional)
- [ ] Set up error monitoring (Sentry)

## Support

If you encounter issues:

1. Check `/system-status` page
2. Review Netlify build logs
3. Check browser console for errors
4. Verify environment variables in Netlify dashboard
5. Ensure Supabase project is active and accessible

## Next Steps

After successful deployment:

1. Create your first user account
2. Set up client profiles
3. Upload assets and templates
4. Start creating campaigns

For more detailed documentation, see the main README.md file.
