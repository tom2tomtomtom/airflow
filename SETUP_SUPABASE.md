# Quick Supabase Setup for AIRWAVE

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up/login
3. Create new project
4. Choose region and database password

## 2. Get Credentials

From your Supabase dashboard → Settings → API:

- `Project URL` = NEXT_PUBLIC_SUPABASE_URL
- `anon public` = NEXT_PUBLIC_SUPABASE_ANON_KEY
- `service_role secret` = SUPABASE_SERVICE_ROLE_KEY

## 3. Setup Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 4. Configure Netlify Environment Variables

Add these to Netlify Site Settings → Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (generate random 32+ char string)

## 5. Redeploy

After adding environment variables, trigger a new deploy.
