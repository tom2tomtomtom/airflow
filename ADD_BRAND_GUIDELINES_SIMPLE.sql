-- Simple brand guidelines column addition
-- Run this in your Supabase SQL Editor

ALTER TABLE clients 
ADD COLUMN brand_guidelines JSONB DEFAULT '{}' NOT NULL;

-- Add index for performance
CREATE INDEX idx_clients_brand_guidelines ON clients USING GIN (brand_guidelines);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'brand_guidelines';