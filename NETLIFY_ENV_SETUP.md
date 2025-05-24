# Netlify Environment Variables

Add these environment variables in your Netlify dashboard:
**Site settings → Environment variables**

## Required Variables

```bash
# Authentication
NEXTAUTH_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=generate-a-32-char-secret-here
JWT_SECRET=same-as-nextauth-secret-or-different

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
RUNWAY_API_KEY=your-runway-key

# Optional
CREATOMATE_API_KEY=your-creatomate-key
SENTRY_DSN=your-sentry-dsn
```

## Generate Secrets

```bash
# Generate NEXTAUTH_SECRET/JWT_SECRET
openssl rand -base64 32
```

## Important Notes

1. **NEXTAUTH_URL** must match your Netlify URL exactly
2. **JWT_SECRET** must be at least 32 characters
3. Don't use the example values - generate your own
4. All NEXT_PUBLIC_* variables are exposed to the browser
