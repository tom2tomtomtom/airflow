-- Production Database Optimization Migration
-- Performance indexes, security enhancements, and monitoring

-- =========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =========================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_client_type_created 
  ON public.assets(client_id, type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_client_status_dates 
  ON public.campaigns(client_id, status, start_date, end_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_executions_status_created 
  ON public.executions(status, created_at DESC);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_name_search 
  ON public.assets USING GIN(to_tsvector('english', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_name_desc_search 
  ON public.templates USING GIN(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  );

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_name_desc_search 
  ON public.campaigns USING GIN(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  );

-- JSON field indexes for metadata searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_metadata_tags 
  ON public.assets USING GIN(metadata);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_brand_guidelines 
  ON public.clients USING GIN(brand_guidelines);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_dynamic_fields 
  ON public.templates USING GIN(dynamic_fields);

-- Date-based partitioning support indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_created_at_month 
  ON public.assets(date_trunc('month', created_at));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_created_at_month 
  ON public.campaigns(date_trunc('month', created_at));

-- =========================================
-- ADVANCED SECURITY ENHANCEMENTS
-- =========================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_table_record 
  ON public.audit_log(table_name, record_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_created 
  ON public.audit_log(user_id, created_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email from auth.users or current session
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (
      table_name, record_id, action, old_values, 
      user_id, user_email, created_at
    ) VALUES (
      TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD)::jsonb,
      auth.uid(), user_email, NOW()
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (
      table_name, record_id, action, old_values, new_values,
      user_id, user_email, created_at
    ) VALUES (
      TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb,
      auth.uid(), user_email, NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (
      table_name, record_id, action, new_values,
      user_id, user_email, created_at
    ) VALUES (
      TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW)::jsonb,
      auth.uid(), user_email, NOW()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_campaigns_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_assets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =========================================
-- DATA VALIDATION FUNCTIONS
-- =========================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate URL format
CREATE OR REPLACE FUNCTION is_valid_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN url ~* '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add validation constraints
ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_email_format 
  CHECK (is_valid_email(email));

ALTER TABLE public.client_contacts 
  ADD CONSTRAINT valid_contact_email_format 
  CHECK (email IS NULL OR is_valid_email(email));

ALTER TABLE public.clients 
  ADD CONSTRAINT valid_website_format 
  CHECK (website IS NULL OR is_valid_url(website));

-- =========================================
-- PERFORMANCE MONITORING VIEWS
-- =========================================

-- View for database performance metrics
CREATE OR REPLACE VIEW public.db_performance_metrics AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public';

-- View for active connections monitoring
CREATE OR REPLACE VIEW public.db_connections AS
SELECT 
  state,
  count(*) as connection_count,
  max(now() - state_change) as longest_connection
FROM pg_stat_activity 
WHERE state IS NOT NULL
GROUP BY state;

-- View for slow query monitoring (requires pg_stat_statements extension)
CREATE OR REPLACE VIEW public.slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE calls > 100 
ORDER BY mean_time DESC 
LIMIT 20;

-- =========================================
-- DATA ARCHIVAL POLICIES
-- =========================================

-- Function to archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive audit logs older than 1 year to a separate table
  CREATE TABLE IF NOT EXISTS public.audit_log_archive (
    LIKE public.audit_log INCLUDING ALL
  );
  
  WITH archived AS (
    DELETE FROM public.audit_log 
    WHERE created_at < NOW() - INTERVAL '1 year'
    RETURNING *
  )
  INSERT INTO public.audit_log_archive 
  SELECT * FROM archived;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old executions
CREATE OR REPLACE FUNCTION cleanup_old_executions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete executions older than 6 months that are completed
  DELETE FROM public.executions 
  WHERE created_at < NOW() - INTERVAL '6 months'
    AND status IN ('completed', 'failed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- HEALTH CHECK FUNCTIONS
-- =========================================

-- Database health check function
CREATE OR REPLACE FUNCTION db_health_check()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  table_stats JSONB;
  connection_stats JSONB;
BEGIN
  -- Get table statistics
  SELECT jsonb_object_agg(tablename, jsonb_build_object(
    'live_rows', n_live_tup,
    'dead_rows', n_dead_tup,
    'last_vacuum', last_vacuum,
    'last_analyze', last_analyze
  )) INTO table_stats
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public';
  
  -- Get connection statistics
  SELECT jsonb_build_object(
    'total_connections', count(*),
    'active_connections', count(*) FILTER (WHERE state = 'active'),
    'idle_connections', count(*) FILTER (WHERE state = 'idle')
  ) INTO connection_stats
  FROM pg_stat_activity;
  
  -- Build result
  result := jsonb_build_object(
    'timestamp', NOW(),
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'table_stats', table_stats,
    'connection_stats', connection_stats,
    'extensions', (
      SELECT jsonb_agg(extname) 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- BACKUP VERIFICATION
-- =========================================

-- Function to verify data integrity
CREATE OR REPLACE FUNCTION verify_data_integrity()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  orphaned_assets INTEGER;
  orphaned_campaigns INTEGER;
  orphaned_matrices INTEGER;
BEGIN
  -- Check for orphaned records
  SELECT count(*) INTO orphaned_assets
  FROM public.assets a
  WHERE NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = a.client_id);
  
  SELECT count(*) INTO orphaned_campaigns
  FROM public.campaigns c
  WHERE NOT EXISTS (SELECT 1 FROM public.clients cl WHERE cl.id = c.client_id);
  
  SELECT count(*) INTO orphaned_matrices
  FROM public.matrices m
  WHERE NOT EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = m.campaign_id);
  
  result := jsonb_build_object(
    'timestamp', NOW(),
    'orphaned_assets', orphaned_assets,
    'orphaned_campaigns', orphaned_campaigns,
    'orphaned_matrices', orphaned_matrices,
    'integrity_check', CASE 
      WHEN orphaned_assets = 0 AND orphaned_campaigns = 0 AND orphaned_matrices = 0 
      THEN 'PASSED' 
      ELSE 'FAILED' 
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for monitoring functions to authenticated users
GRANT EXECUTE ON FUNCTION db_health_check() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_data_integrity() TO authenticated;

-- =========================================
-- AUTOMATIC MAINTENANCE
-- =========================================

-- Enable automatic statistics collection
SELECT cron.schedule('update-table-stats', '0 2 * * *', 'ANALYZE;');

-- Schedule periodic cleanup
SELECT cron.schedule('cleanup-audit-logs', '0 3 1 * *', 'SELECT archive_old_audit_logs();');
SELECT cron.schedule('cleanup-executions', '0 4 1 * *', 'SELECT cleanup_old_executions();');

COMMENT ON MIGRATION IS 'Production database optimization with performance indexes, security enhancements, monitoring, and maintenance procedures';
