-- BRAND GUIDELINES MIGRATION
-- Copy and paste this SQL into your Supabase SQL Editor to fix the missing column error

DO $$ 
BEGIN 
  -- Check if column exists and add if it doesn't
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'brand_guidelines'
  ) THEN
    -- Add the brand_guidelines column
    ALTER TABLE clients ADD COLUMN brand_guidelines JSONB DEFAULT '{}' NOT NULL;
    
    -- Add comment to describe the column
    COMMENT ON COLUMN clients.brand_guidelines IS 'JSON object containing brand guidelines including colors, fonts, logos, and style preferences';
    
    -- Create an index for better query performance
    CREATE INDEX idx_clients_brand_guidelines ON clients USING GIN (brand_guidelines);
    
    RAISE NOTICE 'Added brand_guidelines column successfully';
  ELSE
    RAISE NOTICE 'brand_guidelines column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'brand_guidelines';