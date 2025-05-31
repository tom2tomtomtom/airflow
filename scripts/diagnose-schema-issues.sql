-- ====================================================================
-- AIRWAVE SCHEMA DIAGNOSTIC QUERIES
-- Run these queries in your Supabase SQL Editor to diagnose issues
-- ====================================================================

-- 1. Check current profiles table schema
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

-- 2. Check if profiles table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 3. Check RLS status on profiles table
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- 4. Check existing RLS policies on profiles
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- 5. Check clients table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check user_clients table (if it exists)
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_clients'
) as user_clients_table_exists;

-- 7. List all public tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 8. Check auth trigger for profile creation
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 9. Check storage buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 10. Sample profiles data (if any exists)
SELECT 
    id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    created_at
FROM public.profiles
LIMIT 5;

-- ====================================================================
-- EXPECTED RESULTS:
-- ====================================================================
-- 
-- 1. profiles table should have columns:
--    - id (uuid, primary key)
--    - email (text, unique)
--    - first_name (text)
--    - last_name (text) 
--    - role (text, default 'user')
--    - full_name (text, optional legacy)
--    - avatar_url (text, nullable)
--    - company (text, nullable)
--    - phone (text, nullable)
--    - created_at (timestamptz)
--    - updated_at (timestamptz)
--
-- 2. RLS should be enabled
--
-- 3. Should have policies for SELECT, INSERT, UPDATE
--
-- 4. Storage buckets should exist: assets, avatars, templates, renders, campaigns
--
-- 5. Auto-profile creation trigger should exist on auth.users
--
-- ====================================================================