-- AIrWAVE Complete Supabase Setup Script
-- Run this entire script in your Supabase SQL Editor
-- This will set up everything needed for production

-- =====================================================
-- STEP 1: Create all tables from migrations
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (BE CAREFUL IN PRODUCTION!)
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS approval_comments CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS briefs CASCADE;
DROP TABLE IF EXISTS campaign_analytics CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS content_variations CASCADE;
DROP TABLE IF EXISTS copy_assets CASCADE;
DROP TABLE IF EXISTS copy_texts CASCADE;
DROP TABLE IF EXISTS executions CASCADE;
DROP TABLE IF EXISTS generated_content CASCADE;
DROP TABLE IF EXISTS matrices CASCADE;
DROP TABLE IF EXISTS motivations CASCADE;
DROP TABLE IF EXISTS platform_integrations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS selected_motivations CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS strategy_motivations CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS user_clients CASCADE;

-- Create profiles table (links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{"theme": "system", "notifications": {"email": true, "inApp": true, "exports": true, "comments": true, "approvals": true}}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    tenant_id TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create user_clients table (many-to-many relationship)
CREATE TABLE user_clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, client_id)
);

-- Create assets table
CREATE TABLE assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text', 'voice')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    duration_seconds DOUBLE PRECISION,
    width INTEGER,
    height INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create templates table
CREATE TABLE templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    platform TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    structure JSONB NOT NULL,
    thumbnail_url TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create strategies table
CREATE TABLE strategies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT,
    goals JSONB,
    key_messages JSONB,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create briefs table
CREATE TABLE briefs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    document_url TEXT,
    document_type TEXT,
    raw_content TEXT,
    parsing_status TEXT DEFAULT 'pending',
    parsed_at TIMESTAMPTZ,
    target_audience TEXT,
    objectives JSONB,
    key_messaging JSONB,
    brand_guidelines JSONB,
    platforms TEXT[],
    budget NUMERIC(10,2),
    timeline JSONB,
    confidence_scores JSONB,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create motivations table
CREATE TABLE motivations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    relevance_score NUMERIC(3,2),
    is_ai_generated BOOLEAN DEFAULT true,
    generation_context JSONB,
    brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create matrices table
CREATE TABLE matrices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    structure JSONB NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create executions table
CREATE TABLE executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    output_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    matrix_id UUID REFERENCES matrices(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create copy_texts table
CREATE TABLE copy_texts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create remaining tables
CREATE TABLE analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    variation_id UUID,
    metrics JSONB,
    insights JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE approval_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE approval_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    comment_type TEXT DEFAULT 'general',
    position_data JSONB,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    comment TEXT,
    version INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE campaign_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID,
    date DATE NOT NULL,
    hour INTEGER,
    platform TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend NUMERIC(10,2) DEFAULT 0,
    ctr NUMERIC(5,2),
    cpc NUMERIC(10,2),
    cpm NUMERIC(10,2),
    roas NUMERIC(10,2),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    platform TEXT,
    tone TEXT,
    style TEXT,
    performance_score NUMERIC(3,2),
    brand_compliance_score NUMERIC(3,2),
    compliance_notes JSONB,
    generation_prompt TEXT,
    brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
    motivation_ids UUID[],
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE copy_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT,
    type TEXT,
    tags TEXT[],
    metadata JSONB,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    selected_motivation_id UUID,
    content JSONB,
    content_types TEXT[],
    tone TEXT,
    style TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE platform_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    account_id TEXT,
    account_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    permissions JSONB,
    last_sync_at TIMESTAMPTZ,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE selected_motivations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID,
    selected UUID[],
    custom TEXT[],
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE strategy_motivations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    motivation_id UUID REFERENCES motivations(id) ON DELETE CASCADE,
    order_position INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- STEP 2: Create indexes for performance
-- =====================================================

CREATE INDEX idx_assets_client_id ON assets(client_id);
CREATE INDEX idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX idx_assets_created_by ON assets(created_by);
CREATE INDEX idx_assets_type ON assets(type);

CREATE INDEX idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX idx_user_clients_client_id ON user_clients(client_id);

CREATE INDEX idx_templates_platform ON templates(platform);
CREATE INDEX idx_templates_client_id ON templates(client_id);

CREATE INDEX idx_executions_matrix_id ON executions(matrix_id);
CREATE INDEX idx_executions_client_id ON executions(client_id);
CREATE INDEX idx_executions_status ON executions(status);

CREATE INDEX idx_briefs_client_id ON briefs(client_id);
CREATE INDEX idx_motivations_brief_id ON motivations(brief_id);
CREATE INDEX idx_motivations_client_id ON motivations(client_id);

-- =====================================================
-- STEP 3: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_motivations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS Policies
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Clients policies (users can only see clients they have access to)
CREATE POLICY "Users can view clients they have access to" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = clients.id
            AND user_clients.user_id = auth.uid()
        )
    );

-- User_clients policies
CREATE POLICY "Users can view their own client associations" ON user_clients
    FOR SELECT USING (user_id = auth.uid());

-- Assets policies (users can only see assets from their clients)
CREATE POLICY "Users can view assets from their clients" ON assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = assets.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create assets for their clients" ON assets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = assets.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update assets from their clients" ON assets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = assets.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete assets from their clients" ON assets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = assets.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- Apply similar policies to other tables
-- Templates
CREATE POLICY "Users can view templates" ON templates
    FOR SELECT USING (
        client_id IS NULL OR EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = templates.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create templates" ON templates
    FOR INSERT WITH CHECK (
        client_id IS NULL OR EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = templates.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- Strategies
CREATE POLICY "Users can view strategies from their clients" ON strategies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = strategies.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create strategies for their clients" ON strategies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = strategies.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update strategies from their clients" ON strategies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = strategies.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- Briefs
CREATE POLICY "Users can view briefs from their clients" ON briefs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = briefs.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create briefs for their clients" ON briefs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = briefs.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update briefs from their clients" ON briefs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = briefs.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- Motivations
CREATE POLICY "Users can view motivations from their clients" ON motivations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = motivations.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create motivations for their clients" ON motivations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = motivations.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- Matrices
CREATE POLICY "Users can view matrices from their clients" ON matrices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = matrices.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create matrices for their clients" ON matrices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = matrices.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update matrices from their clients" ON matrices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = matrices.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- Executions
CREATE POLICY "Users can view executions from their clients" ON executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = executions.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create executions for their clients" ON executions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = executions.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update executions from their clients" ON executions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clients
            WHERE user_clients.client_id = executions.client_id
            AND user_clients.user_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 5: Create helper functions
-- =====================================================

-- Function to check if user has access to a client
CREATE OR REPLACE FUNCTION user_has_client_access(user_id UUID, client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_clients
        WHERE user_clients.user_id = $1
        AND user_clients.client_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 6: Storage bucket setup (run in Dashboard)
-- =====================================================
-- NOTE: Storage buckets must be created via Supabase Dashboard
-- Go to Storage section and create a bucket named 'assets'
-- Set it as PUBLIC for CDN access
-- Configure CORS policy as shown in the setup guide

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'AIrWAVE Supabase setup completed successfully!' as message;
