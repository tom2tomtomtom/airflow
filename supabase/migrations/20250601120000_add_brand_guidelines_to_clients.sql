-- BRAND GUIDELINES MIGRATION
-- Add brand_guidelines JSONB column to clients table

-- Step 1: Drop any existing brand guidelines column and index
DROP INDEX IF EXISTS idx_clients_brand_guidelines;
DROP INDEX IF EXISTS idx_clients_brandGuidelines;

-- Remove any existing columns (both snake_case and camelCase variants)
ALTER TABLE clients DROP COLUMN IF EXISTS brand_guidelines;
ALTER TABLE clients DROP COLUMN IF EXISTS "brandGuidelines";

-- Step 2: Add the brand_guidelines column with proper structure
ALTER TABLE clients 
ADD COLUMN brand_guidelines JSONB DEFAULT '{
  "voiceTone": "",
  "targetAudience": "",
  "keyMessages": [],
  "colors": {
    "primary": "",
    "secondary": "",
    "accent": ""
  },
  "typography": {
    "headingFont": "",
    "bodyFont": ""
  },
  "logoUsage": "",
  "dosDonts": {
    "dos": [],
    "donts": []
  }
}' NOT NULL;

-- Step 3: Add proper documentation
COMMENT ON COLUMN clients.brand_guidelines IS 'JSONB object containing comprehensive brand guidelines including voice & tone, target audience, key messages, colors, typography, logo usage, and brand dos/donts';

-- Step 4: Create optimized index for brand guidelines queries
CREATE INDEX idx_clients_brand_guidelines_gin ON clients USING GIN (brand_guidelines);

-- Step 5: Add additional indexes for common brand guideline searches
CREATE INDEX idx_clients_brand_guidelines_voice ON clients USING GIN ((brand_guidelines->'voiceTone'));
CREATE INDEX idx_clients_brand_guidelines_audience ON clients USING GIN ((brand_guidelines->'targetAudience'));