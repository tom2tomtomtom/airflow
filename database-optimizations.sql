-- Database Optimization Script for AIRFLOW Project
-- This script contains optimizations for improved query performance

-- ========================================
-- SECTION 1: MISSING INDEXES
-- ========================================

-- Text search optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_description_trgm ON clients USING gin(description gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_name_trgm ON assets USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_description_trgm ON assets USING gin(description gin_trgm_ops);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_fts ON clients USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(industry, ''))
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_fts ON assets USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Date range query optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generations_client_date ON ai_generations(client_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_date ON analytics_events(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_analytics_client_date ON campaign_analytics(client_id, date DESC);

-- Status and workflow optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_client_status ON workflows(client_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_executions_client_status ON executions(client_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_posts_platform_status ON social_posts(platform, status);

-- User access patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_clients_composite ON user_clients(user_id, client_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- JSONB metadata optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_metadata_gin ON assets USING gin(metadata);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_briefs_brand_guidelines_gin ON briefs USING gin(brand_guidelines);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generations_metadata_gin ON ai_generations USING gin(metadata);

-- Campaign and content optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_client_status ON campaigns(client_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_variations_brief_status ON content_variations(brief_id, status);

-- ========================================
-- SECTION 2: MATERIALIZED VIEWS
-- ========================================

-- Daily client analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_client_analytics AS
SELECT 
  c.id as client_id,
  c.name as client_name,
  DATE(COALESCE(camp.created_at, a.created_at, ai.created_at)) as date,
  COUNT(DISTINCT camp.id) as campaigns_count,
  COUNT(DISTINCT a.id) as assets_count,
  COUNT(DISTINCT ai.id) as ai_generations_count,
  COALESCE(SUM(ai.cost_usd), 0) as total_ai_cost,
  COUNT(DISTINCT e.id) as executions_count
FROM clients c
LEFT JOIN campaigns camp ON camp.client_id = c.id
LEFT JOIN assets a ON a.client_id = c.id
LEFT JOIN ai_generations ai ON ai.client_id = c.id
LEFT JOIN executions e ON e.client_id = c.id
WHERE COALESCE(camp.created_at, a.created_at, ai.created_at) IS NOT NULL
GROUP BY c.id, c.name, DATE(COALESCE(camp.created_at, a.created_at, ai.created_at));

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_client_analytics_unique ON daily_client_analytics(client_id, date);

-- Client statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS client_statistics AS
SELECT 
  c.id as client_id,
  c.name,
  c.industry,
  COUNT(DISTINCT camp.id) as total_campaigns,
  COUNT(DISTINCT a.id) as total_assets,
  COUNT(DISTINCT m.id) as total_matrices,
  COUNT(DISTINCT w.id) as total_workflows,
  COUNT(DISTINCT e.id) as total_executions,
  COALESCE(SUM(ai.cost_usd), 0) as total_ai_cost,
  MAX(COALESCE(camp.updated_at, a.updated_at, m.updated_at)) as last_activity,
  AVG(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as success_rate
FROM clients c
LEFT JOIN campaigns camp ON camp.client_id = c.id
LEFT JOIN assets a ON a.client_id = c.id
LEFT JOIN matrices m ON m.client_id = c.id
LEFT JOIN workflows w ON w.client_id = c.id
LEFT JOIN executions e ON e.client_id = c.id
LEFT JOIN ai_generations ai ON ai.client_id = c.id
GROUP BY c.id, c.name, c.industry;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_statistics_unique ON client_statistics(client_id);

-- ========================================
-- SECTION 3: OPTIMIZED FUNCTIONS
-- ========================================

-- Function to get user's accessible client IDs
CREATE OR REPLACE FUNCTION get_user_client_ids(user_uuid UUID)
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT client_id 
    FROM user_clients 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get client statistics efficiently
CREATE OR REPLACE FUNCTION get_client_stats(client_uuid UUID)
RETURNS TABLE(
  campaign_count BIGINT,
  asset_count BIGINT,
  matrix_count BIGINT,
  workflow_count BIGINT,
  execution_count BIGINT,
  ai_cost DECIMAL,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    total_campaigns,
    total_assets,
    total_matrices,
    total_workflows,
    total_executions,
    total_ai_cost,
    last_activity
  FROM client_statistics
  WHERE client_id = client_uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function for optimized search across multiple tables
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  user_uuid UUID,
  content_type TEXT DEFAULT 'all',
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  table_name TEXT,
  client_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  client_ids UUID[];
BEGIN
  -- Get user's accessible clients
  client_ids := get_user_client_ids(user_uuid);
  
  RETURN QUERY
  (
    SELECT 
      c.id,
      c.name,
      c.description,
      'clients'::TEXT as table_name,
      c.id as client_id,
      c.created_at,
      c.updated_at
    FROM clients c
    WHERE c.id = ANY(client_ids)
      AND (content_type = 'all' OR content_type = 'clients')
      AND to_tsvector('english', c.name || ' ' || COALESCE(c.description, '') || ' ' || COALESCE(c.industry, ''))
          @@ plainto_tsquery('english', search_query)
    ORDER BY c.updated_at DESC
    LIMIT limit_count
  )
  UNION ALL
  (
    SELECT 
      a.id,
      a.name,
      a.description,
      'assets'::TEXT as table_name,
      a.client_id,
      a.created_at,
      a.updated_at
    FROM assets a
    WHERE a.client_id = ANY(client_ids)
      AND (content_type = 'all' OR content_type = 'assets')
      AND to_tsvector('english', a.name || ' ' || COALESCE(a.description, ''))
          @@ plainto_tsquery('english', search_query)
    ORDER BY a.updated_at DESC
    LIMIT limit_count
  )
  UNION ALL
  (
    SELECT 
      camp.id,
      camp.name,
      camp.description,
      'campaigns'::TEXT as table_name,
      camp.client_id,
      camp.created_at,
      camp.updated_at
    FROM campaigns camp
    WHERE camp.client_id = ANY(client_ids)
      AND (content_type = 'all' OR content_type = 'campaigns')
      AND to_tsvector('english', camp.name || ' ' || COALESCE(camp.description, ''))
          @@ plainto_tsquery('english', search_query)
    ORDER BY camp.updated_at DESC
    LIMIT limit_count
  )
  ORDER BY updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function for optimized analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  client_id_param UUID DEFAULT NULL
)
RETURNS TABLE(
  campaign_count BIGINT,
  video_count BIGINT,
  total_views BIGINT,
  avg_engagement DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH campaign_stats AS (
    SELECT COUNT(*) as count
    FROM campaigns 
    WHERE created_at BETWEEN start_date AND end_date
      AND (client_id_param IS NULL OR client_id = client_id_param)
  ),
  video_stats AS (
    SELECT COUNT(*) as count
    FROM videos 
    WHERE created_at BETWEEN start_date AND end_date
      AND (client_id_param IS NULL OR client_id = client_id_param)
  ),
  view_stats AS (
    SELECT 
      COALESCE(SUM(views), 0) as total_views,
      COALESCE(AVG(CASE WHEN views > 0 THEN engagement_rate ELSE NULL END), 0) as avg_engagement
    FROM video_analytics va
    LEFT JOIN videos v ON v.id = va.video_id
    WHERE va.date BETWEEN start_date AND end_date
      AND (client_id_param IS NULL OR v.client_id = client_id_param)
  )
  SELECT 
    cs.count as campaign_count,
    vs.count as video_count,
    vws.total_views,
    vws.avg_engagement
  FROM campaign_stats cs, video_stats vs, view_stats vws;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function for batch client statistics update
CREATE OR REPLACE FUNCTION update_client_statistics_batch(
  client_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  client_id UUID;
BEGIN
  FOREACH client_id IN ARRAY client_ids LOOP
    WITH stats AS (
      SELECT 
        COUNT(DISTINCT camp.id) as campaign_count,
        COUNT(DISTINCT a.id) as asset_count,
        COUNT(DISTINCT m.id) as matrix_count,
        COUNT(DISTINCT w.id) as workflow_count,
        COUNT(DISTINCT e.id) as execution_count,
        COALESCE(SUM(ai.cost_usd), 0) as ai_cost,
        MAX(GREATEST(
          COALESCE(camp.updated_at, '1970-01-01'::timestamptz),
          COALESCE(a.updated_at, '1970-01-01'::timestamptz),
          COALESCE(m.updated_at, '1970-01-01'::timestamptz)
        )) as last_activity,
        COALESCE(AVG(CASE WHEN e.status = 'completed' THEN 1.0 ELSE 0.0 END), 0) as success_rate
      FROM clients c
      LEFT JOIN campaigns camp ON camp.client_id = c.id
      LEFT JOIN assets a ON a.client_id = c.id
      LEFT JOIN matrices m ON m.client_id = c.id
      LEFT JOIN workflows w ON w.client_id = c.id
      LEFT JOIN executions e ON e.client_id = c.id
      LEFT JOIN ai_generations ai ON ai.client_id = c.id
      WHERE c.id = client_id
      GROUP BY c.id
    )
    INSERT INTO client_statistics (
      client_id,
      name,
      industry,
      total_campaigns,
      total_assets,
      total_matrices,
      total_workflows,
      total_executions,
      total_ai_cost,
      last_activity,
      success_rate
    )
    SELECT 
      c.id,
      c.name,
      c.industry,
      s.campaign_count,
      s.asset_count,
      s.matrix_count,
      s.workflow_count,
      s.execution_count,
      s.ai_cost,
      s.last_activity,
      s.success_rate
    FROM clients c, stats s
    WHERE c.id = client_id
    ON CONFLICT (client_id) DO UPDATE SET
      name = EXCLUDED.name,
      industry = EXCLUDED.industry,
      total_campaigns = EXCLUDED.total_campaigns,
      total_assets = EXCLUDED.total_assets,
      total_matrices = EXCLUDED.total_matrices,
      total_workflows = EXCLUDED.total_workflows,
      total_executions = EXCLUDED.total_executions,
      total_ai_cost = EXCLUDED.total_ai_cost,
      last_activity = EXCLUDED.last_activity,
      success_rate = EXCLUDED.success_rate;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SECTION 4: PERFORMANCE VIEWS
-- ========================================

-- View for efficient client listing with stats
CREATE OR REPLACE VIEW client_list_view AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.industry,
  c.description,
  c.created_at,
  c.updated_at,
  cs.total_campaigns,
  cs.total_assets,
  cs.total_matrices,
  cs.total_workflows,
  cs.total_executions,
  cs.total_ai_cost,
  cs.last_activity,
  cs.success_rate
FROM clients c
LEFT JOIN client_statistics cs ON cs.client_id = c.id;

-- View for asset collections with counts
CREATE OR REPLACE VIEW asset_collection_view AS
SELECT 
  ac.id,
  ac.name,
  ac.description,
  ac.brief_id,
  ac.client_id,
  ac.created_at,
  ac.updated_at,
  COUNT(ca.asset_id) as asset_count,
  ARRAY_AGG(ca.asset_id) FILTER (WHERE ca.asset_id IS NOT NULL) as asset_ids
FROM asset_collections ac
LEFT JOIN collection_assets ca ON ca.collection_id = ac.id
GROUP BY ac.id, ac.name, ac.description, ac.brief_id, ac.client_id, ac.created_at, ac.updated_at;

-- ========================================
-- SECTION 5: REFRESH PROCEDURES
-- ========================================

-- Procedure to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_client_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY client_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SECTION 6: PERFORMANCE MONITORING
-- ========================================

-- Create table for query performance logging
CREATE TABLE IF NOT EXISTS query_performance_log (
  id SERIAL PRIMARY KEY,
  query_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  rows_returned INTEGER,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_name_time ON query_performance_log(query_name, created_at DESC);

-- Function to log query performance
CREATE OR REPLACE FUNCTION log_query_performance(
  query_name TEXT,
  execution_time_ms INTEGER,
  rows_returned INTEGER DEFAULT NULL,
  parameters JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO query_performance_log (query_name, execution_time_ms, rows_returned, parameters)
  VALUES (query_name, execution_time_ms, rows_returned, parameters);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SECTION 7: CLEANUP AND MAINTENANCE
-- ========================================

-- Function to cleanup old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also cleanup query performance logs
  DELETE FROM query_performance_log 
  WHERE created_at < NOW() - INTERVAL '1 day' * 30; -- Keep 30 days of query logs
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SECTION 8: ENABLE EXTENSIONS
-- ========================================

-- Enable required extensions for optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text similarity search
CREATE EXTENSION IF NOT EXISTS btree_gin; -- For composite indexes
CREATE EXTENSION IF NOT EXISTS pg_stat_statements; -- For query performance monitoring

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON MATERIALIZED VIEW daily_client_analytics IS 'Daily aggregated statistics for client activity';
COMMENT ON MATERIALIZED VIEW client_statistics IS 'Overall statistics for each client';
COMMENT ON FUNCTION get_user_client_ids IS 'Returns array of client IDs accessible to a user';
COMMENT ON FUNCTION get_client_stats IS 'Returns aggregated statistics for a specific client';
COMMENT ON FUNCTION search_content IS 'Performs full-text search across multiple content types';
COMMENT ON FUNCTION refresh_analytics_views IS 'Refreshes all materialized views for analytics';
COMMENT ON FUNCTION log_query_performance IS 'Logs query execution time for performance monitoring';
COMMENT ON FUNCTION cleanup_old_analytics IS 'Removes old analytics data to manage storage';