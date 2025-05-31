# 🚀 AIrWAVE Complete Supabase Setup Guide

This comprehensive guide will walk you through setting up your AIrWAVE application with Supabase and deploying it to Netlify.

## 📋 Prerequisites

- A [Supabase](https://supabase.com) account and project
- A [Netlify](https://netlify.com) account
- Node.js 18+ installed locally
- Git repository connected to Netlify

## 🎯 Overview

AIrWAVE requires the following Supabase components:

### 🗄️ Database Tables
- **profiles** - User profiles and roles
- **clients** - Client organizations
- **assets** - Media assets (images, videos, documents)
- **campaigns** - Marketing campaigns
- **templates** - Design templates
- **matrices** - Campaign asset combinations
- **executions** - Rendered outputs
- **webhooks** - Integration webhooks
- **platform_integrations** - Social media integrations
- **analytics** - Performance tracking

### 📦 Storage Buckets
- **assets** - User-uploaded files (images, videos, documents)
- **templates** - Creatomate template files
- **renders** - Generated video/image outputs
- **avatars** - User profile pictures
- **campaigns** - Campaign-related files

## 🔧 Step 1: Supabase Project Setup

### 1.1 Create Database Schema

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Create a new query and run the complete setup script:

```sql
-- Copy and paste the contents of scripts/setup-supabase-complete.sql
-- This will create all tables, storage buckets, and security policies
```

The script will:
- ✅ Create all required database tables
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create storage buckets with proper permissions
- ✅ Add performance indexes
- ✅ Configure automated triggers

### 1.2 Get Your Supabase Credentials

1. In your Supabase Dashboard, go to **Settings > API**
2. Copy these values (you'll need them for environment setup):
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIs...`)
   - **Service role secret** (starts with `eyJhbGciOiJIUzI1NiIs...`)

⚠️ **Important**: Keep your service role key secure - it has admin access to your database.

## 🛠️ Step 2: Environment Configuration

### 2.1 Run the Environment Setup Script

```bash
# Make the script executable
chmod +x scripts/setup-netlify-env.sh

# Run the interactive setup
./scripts/setup-netlify-env.sh
```

This script will:
- 📋 Prompt you for all necessary configuration values
- 🔐 Generate a secure JWT secret
- 📄 Create environment files for both development and production
- 🚀 Generate Netlify CLI commands for easy deployment

### 2.2 Generated Files

The script creates several files:

- **`.env.local`** - Local development environment variables
- **`netlify-env-vars.txt`** - Production environment variables for Netlify
- **`netlify-setup-commands.sh`** - Netlify CLI commands

⚠️ **Security Note**: These files contain sensitive information and are automatically added to `.gitignore`.

## 🌐 Step 3: Netlify Deployment

### 3.1 Configure Environment Variables

#### Option A: Netlify Dashboard (Recommended)

1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site Settings > Environment Variables**
4. Copy each variable from `netlify-env-vars.txt` and add them individually

#### Option B: Netlify CLI

If you have Netlify CLI installed:

```bash
# Make sure you're logged in and linked to your site
netlify login
netlify link

# Run the generated commands
chmod +x netlify-setup-commands.sh
./netlify-setup-commands.sh
```

### 3.2 Required Environment Variables

Here are the essential variables you need to set:

```env
# Core Configuration
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-netlify-site.netlify.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Security
JWT_SECRET=your-32-character-secret
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Storage
STORAGE_BUCKET=airwave-assets
MAX_FILE_SIZE=52428800

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_VIDEO_GENERATION=true
ENABLE_SOCIAL_PUBLISHING=false
```

### 3.3 Optional API Keys

Configure these for full functionality:

```env
# AI Services
OPENAI_API_KEY=sk-your-openai-key
CREATOMATE_API_KEY=your-creatomate-key
ELEVENLABS_API_KEY=your-elevenlabs-key
RUNWAY_API_KEY=your-runway-key

# Email (for notifications)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

## ✅ Step 4: Verification

### 4.1 Run the Verification Script

```bash
# Install dependencies if not already done
npm install

# Run the verification script
node scripts/verify-supabase-setup.js
```

This script will check:
- ✅ Environment variables are properly configured
- ✅ Supabase connection is working
- ✅ All required database tables exist
- ✅ Storage buckets are created and accessible
- ✅ RLS policies are working correctly
- ✅ Optional services are configured

### 4.2 Test Local Development

```bash
# Start the development server
npm run dev

# Visit http://localhost:3000
# Try creating a test user and client
```

### 4.3 Deploy to Production

```bash
# Push your changes to trigger Netlify deployment
git add .
git commit -m "Configure Supabase integration"
git push origin main

# Or deploy manually with Netlify CLI
netlify deploy --prod
```

## 🔒 Security Configuration

### Database Security

- ✅ **Row Level Security (RLS)** is enabled on all tables
- ✅ **User isolation** - Users can only access their own clients' data
- ✅ **Role-based permissions** - Admin, user, and client roles
- ✅ **Audit trails** - Automatic timestamps on all records

### Storage Security

- ✅ **Bucket-level policies** - Users can only access appropriate files
- ✅ **Client isolation** - Files are organized by client ID
- ✅ **File type restrictions** - Only allowed MIME types can be uploaded
- ✅ **Size limits** - Configurable file size limits per bucket

### API Security

- ✅ **JWT authentication** - All API endpoints require valid tokens
- ✅ **Rate limiting** - Prevents abuse and DDoS attacks
- ✅ **CORS configuration** - Only allowed origins can access the API
- ✅ **Input validation** - All inputs are validated and sanitized

## 📊 Storage Bucket Structure

### Assets Bucket (`assets`)
```
assets/
├── {client_id}/
│   ├── {user_id}/
│   │   ├── images/
│   │   ├── videos/
│   │   └── documents/
```

### Templates Bucket (`templates`)
```
templates/
├── {user_id}/
│   ├── creatomate/
│   └── custom/
```

### Renders Bucket (`renders`)
```
renders/
├── {user_id}/
│   ├── {execution_id}/
│   │   ├── final.mp4
│   │   └── thumbnail.jpg
```

### Avatars Bucket (`avatars`)
```
avatars/
├── {user_id}/
│   └── profile.jpg
```

### Campaigns Bucket (`campaigns`) - Private
```
campaigns/
├── {client_id}/
│   ├── {campaign_id}/
│   │   ├── briefs/
│   │   └── assets/
```

## 🔧 Database Schema Overview

### Core Relationships

```
profiles (users)
├── clients (1:many)
│   ├── assets (1:many)
│   ├── campaigns (1:many)
│   │   └── matrices (1:many)
│   │       └── executions (1:many)
│   ├── webhooks (1:many)
│   └── platform_integrations (1:many)
└── templates (1:many)
```

### Key Tables

#### `profiles`
- User authentication and profile information
- Role-based access control (admin, user, client)
- Links to Supabase Auth users

#### `clients`
- Client organizations and brand information
- Brand guidelines and color schemes
- Social media account information

#### `assets`
- Media files (images, videos, audio, documents)
- Metadata including dimensions, file size, duration
- AI generation tracking
- Tag-based organization

#### `campaigns`
- Marketing campaigns with budgets and objectives
- Approval workflows
- Date ranges and targeting information

#### `templates`
- Design templates for various platforms
- Creatomate integration support
- Dynamic field definitions
- Performance tracking

#### `matrices`
- Campaign execution plans
- Asset combinations and variations
- Approval workflows

#### `executions`
- Individual render jobs
- Status tracking and metadata
- Links to generated content

## 🚨 Troubleshooting

### Common Issues

#### 1. "Authentication required" errors
- Ensure `NEXT_PUBLIC_DEMO_MODE=false`
- Check that JWT tokens are being sent in Authorization headers
- Verify Supabase credentials are correct

#### 2. "No clients found" errors
- Run the database migration script
- Check RLS policies are applied correctly
- Ensure user profiles exist

#### 3. Storage upload failures
- Verify storage buckets exist
- Check bucket permissions and RLS policies
- Ensure file types are allowed

#### 4. Build failures on Netlify
- Check all required environment variables are set
- Verify API keys are valid
- Check build logs for specific errors

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
DEBUG=supabase:*
```

### Getting Help

If you encounter issues:

1. 📖 Check this documentation
2. 🔍 Run the verification script: `node scripts/verify-supabase-setup.js`
3. 📋 Check Supabase Dashboard > Authentication and Database
4. 🔐 Verify all environment variables in Netlify
5. 📧 Check server logs in Netlify Functions

## 🎉 Next Steps

Once your setup is complete:

1. **Create Your First User**
   - Visit your deployed site
   - Sign up with an email address
   - Create your first client organization

2. **Upload Assets**
   - Navigate to the Assets section
   - Upload images, videos, or documents
   - Tag and organize your content

3. **Create Templates**
   - Browse available templates
   - Create custom templates for your needs
   - Connect Creatomate templates if available

4. **Launch Campaigns**
   - Create your first marketing campaign
   - Set up asset matrices
   - Generate and review content

5. **Monitor Performance**
   - Check the analytics dashboard
   - Monitor campaign performance
   - Review generated content quality

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [AIrWAVE API Documentation](./docs/API.md)

---

🎯 **Your AIrWAVE application is now ready for production use!**

For support or questions, please check the troubleshooting section or open an issue in the repository.