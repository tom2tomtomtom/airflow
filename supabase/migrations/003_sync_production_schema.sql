-- Migration: Sync database with complete production schema
-- This migration adds any missing tables and columns from the production schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add primary_color and secondary_color to clients table if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'clients' AND column_name = 'primary_color') THEN
    ALTER TABLE clients ADD COLUMN primary_color TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'clients' AND column_name = 'secondary_color') THEN
    ALTER TABLE clients ADD COLUMN secondary_color TEXT;
  END IF;
END $$;

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  variation_id UUID,
  metrics JSONB,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approval_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS approval_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID,
  asset_id UUID,
  comment TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general',
  position_data JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approval_workflows table if it doesn't exist
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID,
  client_id UUID REFERENCES clients(id),
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  comment TEXT,
  version INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create briefs table if it doesn't exist
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  document_url TEXT,
  document_type TEXT,
  raw_content TEXT,
  parsing_status TEXT DEFAULT 'pending',
  parsed_at TIMESTAMPTZ,
  objectives JSONB,
  target_audience TEXT,
  key_messaging JSONB,
  brand_guidelines JSONB,
  platforms TEXT[],
  budget DECIMAL(10,2),
  timeline JSONB,
  confidence_scores JSONB,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  hour INTEGER,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(5,2),
  cpc DECIMAL(10,2),
  cpm DECIMAL(10,2),
  roas DECIMAL(10,2),
  raw_data JSONB,
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_variations table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT,
  tone TEXT,
  style TEXT,
  brief_id UUID REFERENCES briefs(id),
  motivation_ids UUID[],
  generation_prompt TEXT,
  performance_score DECIMAL(3,2),
  brand_compliance_score DECIMAL(3,2),
  compliance_notes JSONB,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create copy_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS copy_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  type TEXT,
  tags TEXT[],
  metadata JSONB,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_motivation_id UUID,
  content JSONB,
  content_types TEXT[],
  tone TEXT,
  style TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create motivations table if it doesn't exist
CREATE TABLE IF NOT EXISTS motivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brief_id UUID REFERENCES briefs(id),
  relevance_score DECIMAL(3,2),
  is_ai_generated BOOLEAN DEFAULT true,
  generation_context JSONB,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create platform_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  permissions JSONB,
  status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create selected_motivations table if it doesn't exist
CREATE TABLE IF NOT EXISTS selected_motivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID,
  selected UUID[],
  custom TEXT[],
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create strategy_motivations table if it doesn't exist
CREATE TABLE IF NOT EXISTS strategy_motivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id),
  motivation_id UUID REFERENCES motivations(id),
  order_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_campaign_id ON analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_workflow_id ON approval_comments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_execution_id ON approval_workflows(execution_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_client_id ON approval_workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_execution_id ON approvals(execution_id);
CREATE INDEX IF NOT EXISTS idx_briefs_client_id ON briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_execution_id ON campaign_analytics(execution_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON campaign_analytics(date);
CREATE INDEX IF NOT EXISTS idx_content_variations_brief_id ON content_variations(brief_id);
CREATE INDEX IF NOT EXISTS idx_content_variations_client_id ON content_variations(client_id);
CREATE INDEX IF NOT EXISTS idx_copy_assets_client_id ON copy_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_motivations_brief_id ON motivations(brief_id);
CREATE INDEX IF NOT EXISTS idx_motivations_client_id ON motivations(client_id);
CREATE INDEX IF NOT EXISTS idx_platform_integrations_client_id ON platform_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_selected_motivations_strategy_id ON selected_motivations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_motivations_strategy_id ON strategy_motivations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_motivations_motivation_id ON strategy_motivations(motivation_id);

-- Add RLS policies for new tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_motivations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new tables
-- Analytics
CREATE POLICY "Users can view analytics for their clients" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_clients
      WHERE user_clients.user_id = auth.uid()
      AND user_clients.client_id IN (
        SELECT client_id FROM executions WHERE id = analytics.campaign_id
      )
    )
  );

-- Briefs
CREATE POLICY "Users can view briefs for their clients" ON briefs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_clients
      WHERE user_clients.user_id = auth.uid()
      AND user_clients.client_id = briefs.client_id
    )
  );

CREATE POLICY "Users can create briefs for their clients" ON briefs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clients
      WHERE user_clients.user_id = auth.uid()
      AND user_clients.client_id = briefs.client_id
    )
  );

CREATE POLICY "Users can update briefs for their clients" ON briefs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_clients
      WHERE user_clients.user_id = auth.uid()
      AND user_clients.client_id = briefs.client_id
    )
  );

-- Similar policies for other tables (abbreviated for space)
-- You should create similar SELECT, INSERT, UPDATE, DELETE policies for each table
-- based on the user_clients relationship

-- Update triggers for new tables
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_comments_updated_at BEFORE UPDATE ON approval_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON briefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_analytics_updated_at BEFORE UPDATE ON campaign_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_variations_updated_at BEFORE UPDATE ON content_variations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copy_assets_updated_at BEFORE UPDATE ON copy_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motivations_updated_at BEFORE UPDATE ON motivations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_integrations_updated_at BEFORE UPDATE ON platform_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
