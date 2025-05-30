# AIrWAVE Environment Setup Guide

This guide will help you properly configure your AIrWAVE application for production deployment on Netlify.

## Quick Fix for Authentication Issues

If you're seeing "Demo mode - auth not available" errors, follow these steps:

### 1. Add Missing Environment Variable in Netlify

Go to your Netlify dashboard → Site Settings → Environment Variables and add:

```
NEXT_PUBLIC_DEMO_MODE=false
```

### 2. Verify Your Supabase Configuration

Ensure these variables contain real values from your Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

To find these values:
1. Go to your Supabase dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL, anon public key, and service_role key

### 3. Add JWT Secret

Generate a secure JWT secret (at least 32 characters):

```
JWT_SECRET=[generate-a-secure-random-string-at-least-32-chars]
```

You can generate one using:
```bash
openssl rand -base64 32
```

## Complete Environment Variables List

Here's the complete list of environment variables you should have in Netlify:

### Required for Authentication
```
# Disable demo mode for production
NEXT_PUBLIC_DEMO_MODE=false

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Authentication
JWT_SECRET=[your-secure-jwt-secret-at-least-32-chars]
NEXTAUTH_SECRET=[your-nextauth-secret]
NEXTAUTH_URL=https://[your-netlify-site].netlify.app

# API Configuration
NEXT_PUBLIC_API_URL=https://[your-netlify-site].netlify.app/api
```

### Optional Services (Already in your Netlify)
```
# AI Services
OPENAI_API_KEY=[your-key]
CREATOMATE_API_KEY=[your-key]
ELEVENLABS_API_KEY=[your-key]
RUNWAY_API_KEY=[your-key]
```

## Troubleshooting

### Still getting "Demo mode" errors?

1. **Check Browser Console**: Open developer tools and look for any environment variable errors
2. **Clear Cache**: Try hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. **Redeploy**: After adding environment variables, trigger a new deployment in Netlify
4. **Check Build Logs**: Look for any warnings about missing environment variables

### Verify Environment Variables are Set

You can add this temporary debug code to your app to check if variables are loaded:

```javascript
console.log('Demo mode:', process.env.NEXT_PUBLIC_DEMO_MODE);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
```

### Common Issues

1. **Typo in variable names**: Double-check the exact spelling
2. **Missing NEXT_PUBLIC_ prefix**: Client-side variables must have this prefix
3. **Not redeploying**: Environment variable changes require a new deployment

## Local Development Setup

For local development, create a `.env.local` file in your project root:

```env
# Disable demo mode
NEXT_PUBLIC_DEMO_MODE=false

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Authentication
JWT_SECRET=[your-jwt-secret]
NEXTAUTH_SECRET=[your-nextauth-secret]
NEXTAUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# AI Services (optional)
OPENAI_API_KEY=[your-key]
CREATOMATE_API_KEY=[your-key]
ELEVENLABS_API_KEY=[your-key]
RUNWAY_API_KEY=[your-key]
```

## After Setup

Once you've added all environment variables:

1. Trigger a new deployment in Netlify (or push a commit)
2. Wait for the deployment to complete
3. Test the authentication by trying to sign up or log in
4. Check the browser console for any remaining errors

## Need Help?

If you're still experiencing issues:

1. Check the Netlify build logs for any errors
2. Verify all environment variables are properly set in Netlify
3. Ensure your Supabase project is properly configured with authentication enabled
4. Check that Row Level Security (RLS) policies are set up in Supabase

Remember: The key issue was that `NEXT_PUBLIC_DEMO_MODE` was not explicitly set to `false`, causing the app to run in demo mode where authentication is disabled.
