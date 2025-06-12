# 🚀 Vercel Deployment Guide for AIrWAVE

## 🎯 **Quick Deployment (2 methods)**

### **Method 1: Web Interface (No CLI needed)**

1. **Visit**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import** your `tom2tomtomtom/AIRWAVE_0525_CODEX` repository
5. **Configure** (Vercel auto-detects Next.js):
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. **Add Environment Variables** (see below)
7. **Click Deploy**

### **Method 2: CLI (If you have it)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX
vercel --prod
```

## 🔑 **Required Environment Variables**

Copy these to Vercel Dashboard → Settings → Environment Variables:

```bash
# Essential (Required for app to work)
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://fdsjlutmfaatslznjxiv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg

# Security (Generate a secure 32+ character string)
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum

# AI Features (Add your actual API keys)
OPENAI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key
CREATOMATE_API_KEY=your-creatomate-key

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_VIDEO_GENERATION=true
ENABLE_SOCIAL_PUBLISHING=true
NEXT_TELEMETRY_DISABLED=1
```

## 📋 **Step-by-Step Web Deployment**

### **Step 1: Vercel Setup**
1. Go to https://vercel.com
2. Click "Sign up" and choose "Continue with GitHub"
3. Authorize Vercel to access your repositories

### **Step 2: Import Project**
1. Click "Add New Project"
2. Find `tom2tomtomtom/AIRWAVE_0525_CODEX` in the list
3. Click "Import"

### **Step 3: Configure Build**
Vercel will auto-detect:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm ci`

### **Step 4: Environment Variables**
1. Click "Environment Variables" section
2. Add each variable from the list above:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: All (Production, Preview, Development)
3. Repeat for all variables

### **Step 5: Deploy**
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Get your URL: `https://airwave-complete-xyz.vercel.app`

## 🔧 **After Deployment**

### **Test Your Fixes**
1. Visit your new Vercel URL
2. Login: `tomh@redbaez.com` / `Wijlre2010`
3. Test Templates page (should not crash)
4. Test Templates → Matrix workflow (should work)

### **Custom Domain (Optional)**
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 🚨 **Troubleshooting**

### **Build Fails?**
- Check environment variables are set
- Ensure JWT_SECRET is 32+ characters
- Check build logs in Vercel dashboard

### **App Crashes?**
- Verify Supabase keys are correct
- Check OpenAI API key is valid
- Review function logs in Vercel

### **Templates Still Crash?**
- This shouldn't happen - all fixes are committed
- Check browser console for errors
- Verify latest code is deployed

## 🎯 **Expected Result**

After deployment, you'll have:
- ✅ Working AIrWAVE application
- ✅ Templates page without crashes
- ✅ Matrix workflow functioning
- ✅ All production fixes active
- ✅ Professional deployment URL

## 🆘 **Need Help?**

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first: http://localhost:3001
4. Ensure latest code is committed to GitHub

Your Templates → Matrix workflow fixes are ready - Vercel deployment will make them live!