-- Performance indexes for AIrWAVE production
-- Run this migration to optimize database queries

-- Assets table indexes
CREATE INDEX IF NOT EXISTS idx_assets_client_id ON assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_client_type ON assets(client_id, type);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING gin(tags);

-- Full text search on assets
CREATE INDEX IF NOT EXISTS idx_assets_search ON assets 
USING gin(to_tsvector('english', name || ' ' || COALESCE((metadata->>'description')::text, '')));

-- Executions table indexes
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_matrix_id ON executions(matrix_id);
CREATE INDEX IF NOT EXISTS idx_executions_client_id ON executions(client_id);
CREATE INDEX IF NOT EXISTS idx_executions_created_by ON executions(created_by);
CREATE INDEX IF NOT EXISTS idx_executions_client_status ON executions(client_id, status);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON executions(created_at DESC);

-- Matrices table indexes
CREATE INDEX IF NOT EXISTS idx_matrices_client_id ON matrices(client_id);
CREATE INDEX IF NOT EXISTS idx_matrices_template_id ON matrices(template_id);
CREATE INDEX IF NOT EXISTS idx_matrices_created_by ON matrices(created_by);
CREATE INDEX IF NOT EXISTS idx_matrices_created_at ON matrices(created_at DESC);

-- Approval workflows indexes
CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_client_id ON approval_workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_execution_id ON approval_workflows(execution_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_submitted_at ON approval_workflows(submitted_at DESC);

-- Briefs table indexes
CREATE INDEX IF NOT EXISTS idx_briefs_client_id ON briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_briefs_parsing_status ON briefs(parsing_status);
CREATE INDEX IF NOT EXISTS idx_briefs_created_by ON briefs(created_by);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);

-- Motivations table indexes
CREATE INDEX IF NOT EXISTS idx_motivations_client_id ON motivations(client_id);
CREATE INDEX IF NOT EXISTS idx_motivations_brief_id ON motivations(brief_id);
CREATE INDEX IF NOT EXISTS idx_motivations_created_by ON motivations(created_by);
CREATE INDEX IF NOT EXISTS idx_motivations_is_ai_generated ON motivations(is_ai_generated);

-- Templates table indexes
CREATE INDEX IF NOT EXISTS idx_templates_platform ON templates(platform);
CREATE INDEX IF NOT EXISTS idx_templates_aspect_ratio ON templates(aspect_ratio);
CREATE INDEX IF NOT EXISTS idx_templates_client_id ON templates(client_id);
CREATE INDEX IF NOT EXISTS idx_templates_platform_aspect ON templates(platform, aspect_ratio);

-- Campaign analytics indexes
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_execution_id ON campaign_analytics(execution_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_client_id ON campaign_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON campaign_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_platform ON campaign_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_client_date ON campaign_analytics(client_id, date DESC);

-- User clients relationship
CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client_id ON user_clients(client_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_clients_unique ON user_clients(user_id, client_id);

-- Content variations indexes
CREATE INDEX IF NOT EXISTS idx_content_variations_client_id ON content_variations(client_id);
CREATE INDEX IF NOT EXISTS idx_content_variations_brief_id ON content_variations(brief_id);
CREATE INDEX IF NOT EXISTS idx_content_variations_platform ON content_variations(platform);
CREATE INDEX IF NOT EXISTS idx_content_variations_content_type ON content_variations(content_type);

-- Add webhook subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_client_id ON webhook_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_events ON webhook_subscriptions USING gin(events);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assets_client_created ON assets(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_client_created ON executions(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matrices_client_created ON matrices(client_id, created_at DESC);

-- Add partial indexes for status fields
CREATE INDEX IF NOT EXISTS idx_executions_pending ON executions(created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_executions_processing ON executions(created_at DESC) WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_approval_workflows_pending ON approval_workflows(submitted_at DESC) WHERE status = 'pending';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables that need them
DO $$ 
BEGIN
    -- Assets table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_updated_at') THEN
        CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Executions table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_executions_updated_at') THEN
        CREATE TRIGGER update_executions_updated_at BEFORE UPDATE ON executions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Matrices table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matrices_updated_at') THEN
        CREATE TRIGGER update_matrices_updated_at BEFORE UPDATE ON matrices
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Webhook subscriptions table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_webhook_subscriptions_updated_at') THEN
        CREATE TRIGGER update_webhook_subscriptions_updated_at BEFORE UPDATE ON webhook_subscriptions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Analyze tables to update statistics
ANALYZE assets;
ANALYZE executions;
ANALYZE matrices;
ANALYZE approval_workflows;
ANALYZE briefs;
ANALYZE motivations;
ANALYZE templates;
ANALYZE campaign_analytics;
ANALYZE user_clients;
ANALYZE content_variations;
ANALYZE webhook_subscriptions;
