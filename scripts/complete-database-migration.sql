-- Update profiles table with additional columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'default';

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document', 'other')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  duration_seconds FLOAT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up Row Level Security for assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policy for assets
CREATE POLICY "Users can view assets they have access to" 
  ON assets FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_clients WHERE client_id = assets.client_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  thumbnail_url TEXT,
  structure JSONB NOT NULL,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up Row Level Security for templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policy for templates
CREATE POLICY "Users can view templates they have access to" 
  ON templates FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_clients WHERE client_id = templates.client_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create copy_texts table
CREATE TABLE IF NOT EXISTS copy_texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('headline', 'subheadline', 'body', 'cta', 'other')),
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up Row Level Security for copy_texts
ALTER TABLE copy_texts ENABLE ROW LEVEL SECURITY;

-- Create policy for copy_texts
CREATE POLICY "Users can view copy_texts they have access to" 
  ON copy_texts FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_clients WHERE client_id = copy_texts.client_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create matrices table
CREATE TABLE IF NOT EXISTS matrices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES templates(id),
  structure JSONB NOT NULL,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up Row Level Security for matrices
ALTER TABLE matrices ENABLE ROW LEVEL SECURITY;

-- Create policy for matrices
CREATE POLICY "Users can view matrices they have access to" 
  ON matrices FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_clients WHERE client_id = matrices.client_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create executions table
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  matrix_id UUID REFERENCES matrices(id),
  output_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Set up Row Level Security for executions
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

-- Create policy for executions
CREATE POLICY "Users can view executions they have access to" 
  ON executions FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_clients WHERE client_id = executions.client_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  key_messages JSONB,
  goals JSONB,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up Row Level Security for strategies
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Create policy for strategies
CREATE POLICY "Users can view strategies they have access to" 
  ON strategies FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_clients WHERE client_id = strategies.client_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
