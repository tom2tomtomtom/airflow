-- Add brand guidelines column to clients table
ALTER TABLE clients 
ADD COLUMN brand_guidelines JSONB DEFAULT '{}' NOT NULL;

-- Add comment to describe the column
COMMENT ON COLUMN clients.brand_guidelines IS 'JSON object containing brand guidelines including colors, fonts, logos, and style preferences';

-- Create an index for better query performance on brand guidelines
CREATE INDEX idx_clients_brand_guidelines ON clients USING GIN (brand_guidelines);

-- Update RLS policy to include brand_guidelines in client access
DROP POLICY IF EXISTS "Users can view their clients" ON clients;
CREATE POLICY "Users can view their clients" ON clients 
FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their clients" ON clients;
CREATE POLICY "Users can update their clients" ON clients 
FOR UPDATE USING (created_by = auth.uid());

-- Example of brand guidelines structure (for documentation):
-- {
--   "primaryColor": "#2196F3",
--   "secondaryColor": "#21CBF3", 
--   "accentColor": "#FF5722",
--   "fonts": {
--     "primary": "Inter",
--     "secondary": "Roboto"
--   },
--   "logoUsage": {
--     "minimumSize": "24px",
--     "clearSpace": "2x logo height",
--     "backgrounds": ["white", "dark"]
--   },
--   "voiceAndTone": {
--     "voice": "professional",
--     "tone": "friendly",
--     "personality": ["innovative", "trustworthy", "approachable"]
--   },
--   "imagery": {
--     "style": "modern",
--     "filters": ["bright", "high-contrast"],
--     "composition": ["rule-of-thirds", "centered"]
--   }
-- }