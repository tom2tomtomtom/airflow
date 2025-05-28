-- AIrWAVE Database Schema Migration
-- This creates all necessary tables for the AIrWAVE platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create user_clients junction table
CREATE TABLE IF NOT EXISTS user_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, client_id)
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    size_bytes INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    duration_seconds DOUBLE PRECISION,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'youtube', 'tiktok', 'linkedin', 'twitter')),
    aspect_ratio TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    thumbnail_url TEXT,
    structure JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create briefs table
CREATE TABLE IF NOT EXISTS briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    document_url TEXT,
    document_type TEXT,
    parsing_status TEXT DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
    parsed_at TIMESTAMPTZ,
    raw_content TEXT,
    platforms TEXT[],
    target_audience TEXT,
    budget NUMERIC(10, 2),
    timeline JSONB,
    objectives JSONB,
    key_messaging JSONB,
    brand_guidelines JSONB,
    confidence_scores JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT,
    goals JSONB,
    key_messages JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create motivations table
CREATE TABLE IF NOT EXISTS motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    relevance_score NUMERIC(3, 2),
    is_ai_generated BOOLEAN DEFAULT true,
    generation_context JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create strategy_motivations junction table
CREATE TABLE IF NOT EXISTS strategy_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    motivation_id UUID REFERENCES motivations(id) ON DELETE CASCADE,
    order_position INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(strategy_id, motivation_id)
);

-- Create content_variations table
CREATE TABLE IF NOT EXISTS content_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    content_type TEXT NOT NULL,
    content TEXT NOT NULL,
    motivation_ids UUID[],
    platform TEXT,
    tone TEXT,
    style TEXT,
    generation_prompt TEXT,
    performance_score NUMERIC(3, 2),
    brand_compliance_score NUMERIC(3, 2),
    compliance_notes JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create matrices table
CREATE TABLE IF NOT EXISTS matrices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    template_id UUID REFERENCES templates(id),
    name TEXT NOT NULL,
    description TEXT,
    structure JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create executions table
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    matrix_id UUID REFERENCES matrices(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'processing', 'completed', 'failed', 'approved')),
    output_url TEXT,
    metadata JSONB DEFAULT '{}',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create approval_workflows table
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
    submitted_by UUID REFERENCES profiles(id),
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes')),
    comment TEXT,
    version INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create approval_comments table
CREATE TABLE IF NOT EXISTS approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id),
    created_by UUID REFERENCES profiles(id),
    comment TEXT NOT NULL,
    comment_type TEXT DEFAULT 'general',
    position_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    variation_id UUID,
    metrics JSONB,
    insights JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    hour INTEGER,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend NUMERIC(10, 2) DEFAULT 0,
    ctr NUMERIC(5, 2),
    cpc NUMERIC(10, 2),
    cpm NUMERIC(10, 2),
    roas NUMERIC(10, 2),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create platform_integrations table
CREATE TABLE IF NOT EXISTS platform_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    platform TEXT NOT NULL,
    account_id TEXT,
    account_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    permissions JSONB,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create copy_assets table
CREATE TABLE IF NOT EXISTS copy_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    type TEXT,
    content TEXT,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create copy_texts table (legacy)
CREATE TABLE IF NOT EXISTS copy_texts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create selected_motivations table
CREATE TABLE IF NOT EXISTS selected_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    selected UUID[],
    custom TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selected_motivation_id UUID REFERENCES selected_motivations(id),
    user_id UUID REFERENCES profiles(id),
    content JSONB,
    content_types TEXT[],
    tone TEXT,
    style TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_assets_client_id ON assets(client_id);
CREATE INDEX idx_assets_created_by ON assets(created_by);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);

CREATE INDEX idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX idx_user_clients_client_id ON user_clients(client_id);

CREATE INDEX idx_briefs_client_id ON briefs(client_id);
CREATE INDEX idx_briefs_parsing_status ON briefs(parsing_status);

CREATE INDEX idx_executions_client_id ON executions(client_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_matrix_id ON executions(matrix_id);

CREATE INDEX idx_campaign_analytics_execution_id ON campaign_analytics(execution_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(date);
CREATE INDEX idx_campaign_analytics_platform ON campaign_analytics(platform);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON briefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matrices_updated_at BEFORE UPDATE ON matrices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executions_updated_at BEFORE UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();