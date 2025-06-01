-- Migration: Add brand_guidelines column to clients table
-- Run this in your Supabase SQL Editor

-- Add brand guidelines column to clients table
ALTER TABLE clients 
ADD COLUMN brand_guidelines JSONB DEFAULT '{}' NOT NULL;

-- Add comment to describe the column
COMMENT ON COLUMN clients.brand_guidelines IS 'JSON object containing brand guidelines including colors, fonts, logos, and style preferences';

-- Create an index for better query performance on brand guidelines
CREATE INDEX idx_clients_brand_guidelines ON clients USING GIN (brand_guidelines);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'brand_guidelines';

-- Show the updated table structure
\d clients;