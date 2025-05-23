-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'client');
CREATE TYPE asset_type AS ENUM ('image', 'video', 'audio', 'document', 'copy');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (extends Supabase auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  company TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3a86ff',
  secondary_color TEXT DEFAULT '#8338ec',
  description TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  brand_guidelines JSONB DEFAULT '{
    "voiceTone": "",
    "targetAudience": "",
    "keyMessages": []
  }',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client contacts
CREATE TABLE public.client_contacts (
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

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  mime_type TEXT,
  dimensions JSONB, -- {width: 1920, height: 1080}
  duration INTEGER, -- in seconds for video/audio
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'instagram', 'facebook', 'twitter', etc.
  aspect_ratio TEXT NOT NULL, -- '16:9', '1:1', '9:16'
  dimensions TEXT NOT NULL, -- '1920x1080'
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  content_type TEXT, -- 'post', 'story', 'reel', 'ad'
  dynamic_fields JSONB DEFAULT '[]',
  is_creatomate BOOLEAN DEFAULT false,
  creatomate_id TEXT,
  usage_count INTEGER DEFAULT 0,
  performance_score DECIMAL(3,2) DEFAULT 0.00,
  created_by UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status campaign_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0.00,
  objective TEXT,
  targeting JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  approval_status approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approval_date TIMESTAMPTZ,
  approval_comments TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matrix table
CREATE TABLE public.matrices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  name TEXT NOT NULL,
  description TEXT,
  variations JSONB DEFAULT '[]',
  combinations JSONB DEFAULT '[]',
  field_assignments JSONB DEFAULT '{}',
  status approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approval_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content
CREATE TABLE public.executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matrix_id UUID REFERENCES public.matrices(id) ON DELETE CASCADE,
  combination_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  render_url TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_clients_slug ON public.clients(slug);
CREATE INDEX idx_assets_client_id ON public.assets(client_id);
CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_assets_tags ON public.assets USING GIN(tags);
CREATE INDEX idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_templates_platform ON public.templates(platform);
CREATE INDEX idx_templates_content_type ON public.templates(content_type);
CREATE INDEX idx_matrices_campaign_id ON public.matrices(campaign_id);
CREATE INDEX idx_executions_matrix_id ON public.executions(matrix_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "Users can view their clients" ON public.clients
  FOR SELECT USING (auth.uid() = created_by OR is_active = true);

CREATE POLICY "Users can create clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their clients" ON public.clients
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their clients" ON public.clients
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for client_contacts
CREATE POLICY "Users can manage contacts of their clients" ON public.client_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_contacts.client_id 
      AND clients.created_by = auth.uid()
    )
  );

-- RLS Policies for assets
CREATE POLICY "Users can manage assets of their clients" ON public.assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = assets.client_id 
      AND clients.created_by = auth.uid()
    )
  );

-- RLS Policies for templates
CREATE POLICY "Users can view public templates or their own" ON public.templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their templates" ON public.templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their templates" ON public.templates
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for campaigns
CREATE POLICY "Users can manage campaigns of their clients" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = campaigns.client_id 
      AND clients.created_by = auth.uid()
    )
  );

-- RLS Policies for matrices
CREATE POLICY "Users can manage matrices of their campaigns" ON public.matrices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.clients ON clients.id = campaigns.client_id
      WHERE campaigns.id = matrices.campaign_id 
      AND clients.created_by = auth.uid()
    )
  );

-- RLS Policies for executions
CREATE POLICY "Users can manage executions of their matrices" ON public.executions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matrices
      JOIN public.campaigns ON campaigns.id = matrices.campaign_id
      JOIN public.clients ON clients.id = campaigns.client_id
      WHERE matrices.id = executions.matrix_id 
      AND clients.created_by = auth.uid()
    )
  );

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets'
  );

CREATE POLICY "Users can update their assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matrices_updated_at BEFORE UPDATE ON public.matrices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executions_updated_at BEFORE UPDATE ON public.executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
