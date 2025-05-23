-- Add permissions column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Add metadata column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add preferences column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "theme": "system",
  "notifications": {
    "email": true,
    "inApp": true,
    "approvals": true,
    "comments": true,
    "exports": true
  }
}'::jsonb;

-- Add tenant_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'default';

-- Update existing profiles with default values
UPDATE profiles SET 
  permissions = '[]'::jsonb,
  metadata = '{}'::jsonb,
  preferences = '{
    "theme": "system",
    "notifications": {
      "email": true,
      "inApp": true,
      "approvals": true,
      "comments": true,
      "exports": true
    }
  }'::jsonb,
  tenant_id = 'default'
WHERE permissions IS NULL OR metadata IS NULL OR preferences IS NULL OR tenant_id IS NULL;
