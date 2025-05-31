-- ====================================================================
-- AIRWAVE AUTHENTICATION SCHEMA FIX
-- This script fixes database schema issues preventing authentication
-- ====================================================================

-- First, let's check the current profiles table schema
-- Run this query first to see what fields exist:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- ====================================================================
-- 1. FIX PROFILES TABLE SCHEMA
-- ====================================================================

-- Add missing columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add email column if it doesn't exist (should already be there)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Make email unique if not already
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- If you have existing profiles with full_name, split them into first_name and last_name
UPDATE public.profiles 
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN split_part(full_name, ' ', 1)
        WHEN full_name IS NOT NULL 
        THEN full_name
        ELSE first_name
    END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN substring(full_name from position(' ' in full_name) + 1)
        ELSE last_name
    END
WHERE 
    (first_name IS NULL OR last_name IS NULL) 
    AND full_name IS NOT NULL;

-- Add additional profile columns used by the application
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "theme": "system",
  "notifications": {
    "email": true,
    "inApp": true,
    "approvals": true,
    "comments": true,
    "exports": true
  }
}'::jsonb,
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'default';

-- ====================================================================
-- 2. ENSURE USER_CLIENTS TABLE EXISTS (if using multi-tenant structure)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.user_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user',
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Enable RLS on user_clients if it doesn't have it
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_clients
DROP POLICY IF EXISTS "Users can manage their client relationships" ON public.user_clients;
CREATE POLICY "Users can manage their client relationships" ON public.user_clients
FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- 3. VERIFY AND FIX ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- Drop and recreate profiles policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 4. CREATE MISSING TRIGGERS
-- ====================================================================

-- Ensure updated_at trigger exists for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user_clients if it doesn't exist
DROP TRIGGER IF EXISTS update_user_clients_updated_at ON public.user_clients;
CREATE TRIGGER update_user_clients_updated_at 
    BEFORE UPDATE ON public.user_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 5. ENSURE CLIENTS TABLE HAS PROPER STRUCTURE
-- ====================================================================

-- Verify clients table exists with all necessary columns
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3a86ff',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#8338ec',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand_guidelines JSONB DEFAULT '{
    "voiceTone": "",
    "targetAudience": "",
    "keyMessages": []
}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Make slug unique if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'slug') THEN
        -- Update null slugs first
        UPDATE public.clients SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
        
        -- Add unique constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_slug_key') THEN
            ALTER TABLE public.clients ADD CONSTRAINT clients_slug_key UNIQUE (slug);
        END IF;
    END IF;
END $$;

-- ====================================================================
-- 6. VERIFY AUTHENTICATION FUNCTION FOR PROFILE CREATION
-- ====================================================================

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        '',
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 7. GRANT NECESSARY PERMISSIONS
-- ====================================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant access to anonymous users for public data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.templates TO anon WHERE is_public = true;

-- ====================================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ====================================================================

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON public.user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client_id ON public.user_clients(client_id);

-- ====================================================================
-- 9. VERIFICATION QUERIES
-- ====================================================================

-- Run these queries to verify the schema is correct:

-- Check profiles table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'profiles';

-- Test profile creation (replace with actual user ID)
-- INSERT INTO public.profiles (id, email, first_name, last_name, role)
-- VALUES ('test-user-id', 'test@example.com', 'Test', 'User', 'user')
-- ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Authentication schema fixes completed successfully!';
    RAISE NOTICE '✅ Profiles table updated with first_name, last_name, role columns';
    RAISE NOTICE '✅ RLS policies configured for proper authentication';
    RAISE NOTICE '✅ Automatic profile creation trigger installed';
    RAISE NOTICE '✅ User-client relationship table verified';
    RAISE NOTICE '✅ Performance indexes added';
    RAISE NOTICE '🚀 Authentication should now work properly!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Test user signup at your application';
    RAISE NOTICE '2. Verify profile creation works automatically';
    RAISE NOTICE '3. Check that login/logout functions properly';
    RAISE NOTICE '4. Confirm client creation and management works';
END $$;