# Environment Variables Configuration

This document outlines all environment variables required for the AIRWAVE application.

## 🔒 Security Notice

**NEVER commit real API keys or secrets to version control.** All sensitive values should be configured in your deployment environment (Netlify UI, Vercel dashboard, etc.).

## Required Environment Variables

### Authentication & Security
```bash
# JWT Secret for session management (generate with: openssl rand -base64 32)
JWT_SECRET="your-secure-jwt-secret-here"

# NextAuth configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### Database (Supabase)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
```

### AI Services
```bash
# OpenAI API for content generation
OPENAI_API_KEY="sk-your-openai-api-key"

# ElevenLabs for voice synthesis (optional)
ELEVENLABS_API_KEY="your-elevenlabs-key"

# Runway for AI video features (optional)
RUNWAY_API_KEY="your-runway-key"
```

### Video Generation
```bash
# Creatomate for video generation
CREATOMATE_API_KEY="your-creatomate-key"
```

### Application Features
```bash
# Feature flags
ENABLE_AI_FEATURES="true"
ENABLE_VIDEO_GENERATION="true"
ENABLE_SOCIAL_PUBLISHING="true"

# Environment
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
```

## Development Setup

### 1. Create Local Environment File
```bash
cp .env.example .env.local
```

### 2. Fill in Required Values
Edit `.env.local` with your actual API keys and configuration.

### 3. Verify Configuration
```bash
npm run dev
```

## Production Deployment (Netlify)

### 1. Set Environment Variables in Netlify UI
1. Go to your Netlify site dashboard
2. Navigate to Site settings → Environment variables
3. Add each required variable with its production value

### 2. Required Production Variables
- `JWT_SECRET` - Generate a secure secret
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Generate a secure secret

### 3. Optional Production Variables
- `CREATOMATE_API_KEY` - For video generation features
- `ELEVENLABS_API_KEY` - For voice synthesis features
- `RUNWAY_API_KEY` - For AI video features

## Security Best Practices

1. **Rotate Keys Regularly** - Change API keys periodically
2. **Use Different Keys** - Separate keys for development/staging/production
3. **Monitor Usage** - Track API key usage for unusual activity
4. **Restrict Permissions** - Use least-privilege principle for service keys
5. **Environment Isolation** - Never use production keys in development

## Troubleshooting

### Common Issues

1. **Build Fails with "Missing Environment Variable"**
   - Ensure all required variables are set in Netlify UI
   - Check variable names match exactly (case-sensitive)

2. **Supabase Connection Errors**
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
   - Check Supabase project is active and accessible

3. **OpenAI API Errors**
   - Verify OPENAI_API_KEY is valid and has sufficient credits
   - Check API key permissions and rate limits

### Validation Script
Run this command to validate your environment setup:
```bash
npm run validate:env
```

## Support

For environment configuration issues:
1. Check this documentation
2. Verify all required variables are set
3. Test with minimal configuration first
4. Contact support with specific error messages
