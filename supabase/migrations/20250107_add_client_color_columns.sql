-- Add missing color columns to clients table
-- These columns were in the initial schema but missing from production

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1976d2',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#dc004e',
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Update any existing clients to have default colors if they don't already
UPDATE public.clients 
SET 
  primary_color = COALESCE(primary_color, '#1976d2'),
  secondary_color = COALESCE(secondary_color, '#dc004e')
WHERE primary_color IS NULL OR secondary_color IS NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.clients.primary_color IS 'Primary brand color in hex format';
COMMENT ON COLUMN public.clients.secondary_color IS 'Secondary brand color in hex format';
COMMENT ON COLUMN public.clients.website IS 'Client website URL';
COMMENT ON COLUMN public.clients.created_by IS 'User who created the client record';