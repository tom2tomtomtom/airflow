-- BRAND GUIDELINES MIGRATION (CAMELCASE)
-- Copy and paste this SQL into your Supabase SQL Editor to fix the column naming

DO $$ 
BEGIN 
  -- Drop the existing snake_case column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'brand_guidelines'
  ) THEN
    DROP INDEX IF EXISTS idx_clients_brand_guidelines;
    ALTER TABLE clients DROP COLUMN brand_guidelines;
    RAISE NOTICE 'Dropped existing brand_guidelines column';
  END IF;

  -- Check if camelCase column exists and add if it doesn't
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'brandGuidelines'
  ) THEN
    -- Add the brandGuidelines column (camelCase to match TypeScript)
    ALTER TABLE clients ADD COLUMN "brandGuidelines" JSONB DEFAULT '{}' NOT NULL;
    
    -- Add comment to describe the column
    COMMENT ON COLUMN clients."brandGuidelines" IS 'JSON object containing brand guidelines including colors, fonts, logos, and style preferences';
    
    -- Create an index for better query performance
    CREATE INDEX idx_clients_brandGuidelines ON clients USING GIN ("brandGuidelines");
    
    RAISE NOTICE 'Added brandGuidelines column successfully (camelCase)';
  ELSE
    RAISE NOTICE 'brandGuidelines column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'brandGuidelines';