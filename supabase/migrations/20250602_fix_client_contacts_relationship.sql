-- Migration to ensure client_contacts relationship is properly established
-- This fixes the "Could not find a relationship between 'clients' and 'client_contacts'" error

-- First ensure the client_contacts table exists with proper structure
CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON public.client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_is_active ON public.client_contacts(is_active);

-- Enable RLS
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policy exists
DO $$
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Users can manage contacts of their clients" ON public.client_contacts;
    
    -- Create new policy
    CREATE POLICY "Users can manage contacts of their clients" ON public.client_contacts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.clients 
          WHERE clients.id = client_contacts.client_id 
          AND clients.created_by = auth.uid()
        )
      );
END $$;

-- Ensure trigger exists for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_client_contacts_updated_at ON public.client_contacts;
CREATE TRIGGER update_client_contacts_updated_at 
  BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_contacts TO authenticated;
GRANT ALL ON public.client_contacts TO service_role;

-- Add comment to refresh PostgREST schema cache
COMMENT ON TABLE public.client_contacts IS 'Contact information for clients - relationship fixed';
COMMENT ON CONSTRAINT client_contacts_client_id_fkey ON public.client_contacts IS 'Foreign key to clients table';

-- Verify the relationship
DO $$
DECLARE
    fk_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'client_contacts'
            AND kcu.column_name = 'client_id'
            AND tc.table_schema = 'public'
    ) INTO fk_exists;
    
    IF fk_exists THEN
        RAISE NOTICE 'Foreign key relationship between clients and client_contacts is properly established';
    ELSE
        RAISE EXCEPTION 'Foreign key relationship could not be established';
    END IF;
END $$;