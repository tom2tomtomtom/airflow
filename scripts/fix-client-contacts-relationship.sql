-- Script to ensure the foreign key relationship between clients and client_contacts is properly established

-- First, check if the foreign key constraint exists
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'client_contacts'
            AND kcu.column_name = 'client_id'
            AND tc.table_schema = 'public'
    ) THEN
        -- If not, create it
        ALTER TABLE public.client_contacts
        ADD CONSTRAINT fk_client_contacts_client_id
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Ensure indexes are in place for better performance
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON public.client_contacts(client_id);

-- Grant necessary permissions
GRANT SELECT ON public.client_contacts TO authenticated;
GRANT ALL ON public.client_contacts TO service_role;

-- Refresh the PostgREST schema cache by updating a comment
COMMENT ON TABLE public.client_contacts IS 'Contact information for clients - refreshed schema';

-- Verify the relationship exists
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'client_contacts'
    AND tc.table_schema = 'public';