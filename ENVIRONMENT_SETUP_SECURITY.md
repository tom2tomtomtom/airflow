# 🔒 Environment Setup & Security Guide

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit hardcoded credentials to version control!** This application now requires proper environment variable configuration for security.

## 🚀 Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy your Project URL and anon key

3. **Update `.env.local` with your actual values:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## 🛡️ Security Best Practices

### Environment Variables
- ✅ Use `.env.local` for local development
- ✅ Use deployment platform environment settings for production
- ❌ Never commit `.env.local` or `.env` files
- ❌ Never hardcode credentials in source code

### Supabase Configuration
- **Project URL**: Safe to expose (starts with `NEXT_PUBLIC_`)
- **Anon Key**: Safe to expose (public key with limited permissions)
- **Service Role Key**: 🔥 **KEEP SECRET** (has admin permissions)

### File Security
```bash
# Add to .gitignore (already included)
.env.local
.env
.env.*.local
```

## 🔧 Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Deploy: `vercel --prod`

### Netlify
1. Add environment variables in Netlify dashboard
2. Deploy: `netlify deploy --prod`

### Docker
```dockerfile
# Use build args for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🔍 Troubleshooting

### Common Errors

**Error: "NEXT_PUBLIC_SUPABASE_URL is required"**
- Solution: Set the environment variable in `.env.local`

**Error: "Invalid Supabase URL format"**
- Solution: Ensure URL format is `https://[project-id].supabase.co`

**Error: "Invalid Supabase anon key format"**
- Solution: Ensure you're using the JWT token from Supabase dashboard

### Validation
The application now validates:
- ✅ Environment variables are set
- ✅ URL format is correct
- ✅ JWT token format is valid
- ✅ No hardcoded fallbacks

## 📋 Environment Variables Checklist

### Required for Basic Functionality
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Required for Full Functionality
- [ ] `OPENAI_API_KEY`
- [ ] `CREATOMATE_API_KEY`
- [ ] `RESEND_API_KEY`

### Optional (Enhanced Features)
- [ ] `SENTRY_DSN`
- [ ] `MIXPANEL_TOKEN`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`

## 🆘 Need Help?

1. Check the `.env.example` file for all available options
2. Verify your Supabase project is active
3. Ensure all required environment variables are set
4. Check the browser console for specific error messages

---

**Remember: Security is not optional. Always use environment variables for sensitive configuration!**
