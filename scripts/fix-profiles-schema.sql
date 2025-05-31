-- Fix Profiles Table Schema Inconsistencies
-- This script adds missing columns that the authentication code expects

-- Add missing email column (unique constraint)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add missing full_name column (optional, for backwards compatibility)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create unique constraint on email if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- Update existing profiles to populate email from auth.users
UPDATE public.profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id 
AND profiles.email IS NULL;

-- Update existing profiles to populate full_name from first_name + last_name
UPDATE public.profiles 
SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE full_name IS NULL 
AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Create missing storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('templates', 'templates', false, 104857600, ARRAY['application/json', 'image/jpeg', 'image/png']),
    ('renders', 'renders', false, 209715200, ARRAY['video/mp4', 'image/jpeg', 'image/png']),
    ('campaigns', 'campaigns', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for new buckets if they don't exist
DO $$
BEGIN
    -- Avatars bucket policies (public read, authenticated upload)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access for avatars') THEN
        CREATE POLICY "Public Access for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated upload for avatars') THEN
        CREATE POLICY "Authenticated upload for avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    END IF;
    
    -- Templates bucket policies (authenticated access)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated access for templates') THEN
        CREATE POLICY "Authenticated access for templates" ON storage.objects FOR ALL USING (bucket_id = 'templates' AND auth.role() = 'authenticated');
    END IF;
    
    -- Renders bucket policies (authenticated access)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated access for renders') THEN
        CREATE POLICY "Authenticated access for renders" ON storage.objects FOR ALL USING (bucket_id = 'renders' AND auth.role() = 'authenticated');
    END IF;
    
    -- Campaigns bucket policies (authenticated access)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated access for campaigns') THEN
        CREATE POLICY "Authenticated access for campaigns" ON storage.objects FOR ALL USING (bucket_id = 'campaigns' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Verify the changes
SELECT 
    'Profiles table verification' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('email', 'full_name', 'first_name', 'last_name', 'role')
ORDER BY column_name;