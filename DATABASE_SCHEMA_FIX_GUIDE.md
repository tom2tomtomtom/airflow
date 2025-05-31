# 🔧 AIrWAVE Database Schema Fix Guide

## Overview

Based on my analysis of your AIrWAVE application code, I've identified the key database schema issues preventing authentication from working properly. Since the Supabase MCP is not available in my current environment, I've created comprehensive SQL scripts to fix these issues.

## ⚠️ Current Issues Identified

1. **Profiles Table Column Mismatch**: The signup code expects `first_name` and `last_name` columns, but the initial schema may have `full_name`
2. **Missing Required Columns**: Several columns used by the application are not in the base schema
3. **RLS Policy Gaps**: Row Level Security policies may not cover all authentication scenarios
4. **Missing Auto-Profile Creation**: No trigger to automatically create profiles when users sign up

## 🛠️ Step-by-Step Fix Process

### Step 1: Connect to Your Supabase Project

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your AIrWAVE project
3. Navigate to **SQL Editor**

### Step 2: Diagnose Current Schema

Run the diagnostic queries from `/scripts/diagnose-schema-issues.sql`:

```sql
-- Check current profiles table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Step 3: Run the Complete Fix

Execute the complete fix script `/scripts/fix-authentication-schema.sql` in your Supabase SQL Editor. This script will:

- ✅ Add missing columns (`first_name`, `last_name`, `role`, etc.)
- ✅ Migrate data from `full_name` to `first_name`/`last_name` if needed
- ✅ Fix Row Level Security policies
- ✅ Create automatic profile creation trigger
- ✅ Ensure proper indexes for performance
- ✅ Set up user-client relationship table

### Step 4: Verify the Fix

After running the fix script, use the verification script:

```bash
cd /path/to/your/project
node scripts/verify-authentication-schema.js
```

**Note**: You'll need to set up your environment variables first (see Step 5).

### Step 5: Environment Configuration

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_DEMO_MODE=false
```

Get these values from:
- Supabase Dashboard → Settings → API

## 📋 Expected Schema After Fix

### Profiles Table Structure
```sql
Column Name     | Type        | Nullable | Default
----------------|-------------|----------|----------
id              | uuid        | NO       | (PK, refs auth.users)
email           | text        | NO       | (unique)
first_name      | text        | YES      | 
last_name       | text        | YES      | 
role            | text        | YES      | 'user'
full_name       | text        | YES      | (legacy, optional)
avatar_url      | text        | YES      | 
company         | text        | YES      | 
phone           | text        | YES      | 
permissions     | jsonb       | YES      | '[]'
metadata        | jsonb       | YES      | '{}'
preferences     | jsonb       | YES      | (default prefs)
tenant_id       | text        | YES      | 'default'
created_at      | timestamptz | YES      | NOW()
updated_at      | timestamptz | YES      | NOW()
```

### Required Tables
- ✅ `profiles` - User profiles
- ✅ `clients` - Client organizations  
- ✅ `user_clients` - User-client relationships
- ✅ `assets` - Media assets
- ✅ `campaigns` - Marketing campaigns
- ✅ `templates` - Design templates
- ✅ `matrices` - Campaign matrices
- ✅ `executions` - Generated content

### Storage Buckets
- ✅ `assets` - User-uploaded files
- ✅ `avatars` - User profile pictures
- ✅ `templates` - Template files
- ✅ `renders` - Generated outputs
- ✅ `campaigns` - Campaign files (private)

## 🔍 Testing Authentication

After applying the fixes, test the authentication flow:

### 1. Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Manual Testing
1. Visit your deployed site
2. Try to sign up with a new email
3. Check if user profile is created automatically
4. Test login with the same credentials
5. Verify dashboard access works

## 🚨 Troubleshooting

### Common Issues & Solutions

#### "Column does not exist" errors
- **Cause**: Missing columns in profiles table
- **Fix**: Run the schema fix script completely

#### "Row Level Security policy violation"
- **Cause**: Missing or incorrect RLS policies
- **Fix**: Ensure RLS policies are applied for INSERT, SELECT, UPDATE

#### "Profile not created" during signup
- **Cause**: Missing auto-profile creation trigger
- **Fix**: Verify the `handle_new_user()` function and trigger exist

#### "No clients found" errors
- **Cause**: User not associated with any clients
- **Fix**: Create a client through the UI or API after signup

### Debug Steps

1. **Check Supabase Logs**:
   - Dashboard → Logs → Postgres Logs
   - Look for authentication-related errors

2. **Verify Environment Variables**:
   ```bash
   node scripts/validate-env.js
   ```

3. **Check Network Connectivity**:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

4. **Test Database Connection**:
   ```bash
   node scripts/test-supabase.js
   ```

## 📁 Created Files

I've created these files to help you fix the authentication issues:

1. **`scripts/fix-authentication-schema.sql`** - Complete schema fix script
2. **`scripts/diagnose-schema-issues.sql`** - Diagnostic queries
3. **`scripts/verify-authentication-schema.js`** - Verification script
4. **`DATABASE_SCHEMA_FIX_GUIDE.md`** - This guide

## 🎯 Next Steps

1. **Run the diagnostic queries** to understand current schema state
2. **Execute the fix script** in your Supabase SQL Editor
3. **Set up environment variables** with your Supabase credentials
4. **Test authentication flow** with signup/login
5. **Verify all features work** including client creation and dashboard access

## 📞 Support

If you encounter issues after following this guide:

1. Check the browser console for JavaScript errors
2. Check Supabase dashboard logs for database errors
3. Verify all environment variables are correctly set
4. Ensure your Supabase project has the correct settings (email auth enabled, etc.)

The authentication system should work properly once these schema fixes are applied and your environment is configured correctly.