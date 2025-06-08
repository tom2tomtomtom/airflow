-- Fix storage policy for AI-generated assets
-- This allows users to upload AI-generated content to clients they have access to

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can upload to assets bucket" ON storage.objects;

-- Create a more flexible policy that allows uploads to clients the user has access to
CREATE POLICY "Users can upload to assets bucket" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL AND
    -- Path should be: client_id/*/filename (where * can be user_id, ai-generated, etc.)
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        JOIN public.user_clients uc ON uc.client_id = c.id
        WHERE uc.user_id = auth.uid()
        UNION
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- Also update the update policy to be more flexible
DROP POLICY IF EXISTS "Users can update their assets" ON storage.objects;

CREATE POLICY "Users can update their assets" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        JOIN public.user_clients uc ON uc.client_id = c.id
        WHERE uc.user_id = auth.uid()
        UNION
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- And update the delete policy too
DROP POLICY IF EXISTS "Users can delete their assets" ON storage.objects;

CREATE POLICY "Users can delete their assets" ON storage.objects
FOR DELETE USING (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        JOIN public.user_clients uc ON uc.client_id = c.id
        WHERE uc.user_id = auth.uid()
        UNION
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);