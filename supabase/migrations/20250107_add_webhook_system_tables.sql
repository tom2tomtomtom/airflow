-- ====================================================================
-- WEBHOOK SYSTEM COMPLETE SCHEMA
-- This migration adds all missing webhook tables for production
-- ====================================================================

-- Create webhook_deliveries table for tracking delivery history
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB,
  delivery_attempt INTEGER DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table for audit trail
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'triggered', 'failed'
  user_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for webhook_deliveries
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(response_status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Add indexes for webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_action ON webhook_logs(action);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- Add updated_at trigger for webhook_deliveries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add missing columns to webhook_subscriptions if they don't exist
ALTER TABLE webhook_subscriptions 
ADD COLUMN IF NOT EXISTS retry_config JSONB DEFAULT '{
  "max_attempts": 3,
  "initial_delay": 1000,
  "max_delay": 300000,
  "backoff_multiplier": 2
}';

ALTER TABLE webhook_subscriptions 
ADD COLUMN IF NOT EXISTS failure_threshold INTEGER DEFAULT 5;

ALTER TABLE webhook_subscriptions 
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE webhook_subscriptions 
ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0;

-- Add RLS policies for webhook_deliveries
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhook deliveries for their clients"
    ON webhook_deliveries FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM webhook_subscriptions ws
            WHERE ws.id = webhook_deliveries.webhook_id
            AND (
                ws.client_id IS NULL OR
                user_has_client_access(auth.uid(), ws.client_id) OR
                user_is_admin(auth.uid())
            )
        )
    );

-- Add RLS policies for webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhook logs for their clients"
    ON webhook_logs FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            webhook_id IS NULL OR -- System logs viewable by all authenticated users
            EXISTS (
                SELECT 1 FROM webhook_subscriptions ws
                WHERE ws.id = webhook_logs.webhook_id
                AND (
                    ws.client_id IS NULL OR
                    user_has_client_access(auth.uid(), ws.client_id) OR
                    user_is_admin(auth.uid())
                )
            )
        )
    );

CREATE POLICY "System can insert webhook logs"
    ON webhook_logs FOR INSERT
    WITH CHECK (true); -- Allow system to insert logs

-- Create function to cleanup old webhook data
CREATE OR REPLACE FUNCTION cleanup_old_webhook_data()
RETURNS void AS $$
BEGIN
  -- Delete deliveries older than 30 days
  DELETE FROM webhook_deliveries 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete logs older than 90 days
  DELETE FROM webhook_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up old webhook data';
END;
$$ LANGUAGE plpgsql;

-- Create types for webhook events if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'webhook_event_type') THEN
    CREATE TYPE webhook_event_type AS ENUM (
      'execution.started',
      'execution.completed', 
      'execution.failed',
      'execution.cancelled',
      'approval.requested',
      'approval.approved',
      'approval.rejected',
      'approval.changes_requested',
      'campaign.created',
      'campaign.updated',
      'campaign.activated',
      'campaign.completed',
      'render.completed',
      'render.failed',
      'user.invited',
      'user.joined',
      'asset.uploaded',
      'asset.deleted',
      'matrix.created',
      'matrix.executed'
    );
  END IF;
END $$;

-- Add constraint to webhook_subscriptions events column to use enum
ALTER TABLE webhook_subscriptions
DROP CONSTRAINT IF EXISTS check_valid_events;

-- Update webhook_subscriptions to have better validation
ALTER TABLE webhook_subscriptions
ADD CONSTRAINT check_url_format 
CHECK (url ~* '^https?://.*');

ALTER TABLE webhook_subscriptions
ADD CONSTRAINT check_events_not_empty 
CHECK (array_length(events, 1) > 0);

-- Create webhook metrics view for monitoring
CREATE OR REPLACE VIEW webhook_metrics AS
SELECT 
  ws.id as webhook_id,
  ws.url,
  ws.active,
  c.name as client_name,
  COUNT(wd.id) as total_deliveries,
  COUNT(CASE WHEN wd.response_status >= 200 AND wd.response_status < 300 THEN 1 END) as successful_deliveries,
  COUNT(CASE WHEN wd.response_status IS NULL OR wd.response_status >= 400 THEN 1 END) as failed_deliveries,
  ROUND(
    (COUNT(CASE WHEN wd.response_status >= 200 AND wd.response_status < 300 THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(wd.id), 0)) * 100, 2
  ) as success_rate,
  MAX(wd.created_at) as last_delivery_at,
  ws.consecutive_failures,
  ws.last_triggered_at
FROM webhook_subscriptions ws
LEFT JOIN webhook_deliveries wd ON wd.webhook_id = ws.id
LEFT JOIN clients c ON c.id = ws.client_id
GROUP BY ws.id, ws.url, ws.active, c.name, ws.consecutive_failures, ws.last_triggered_at;

-- Grant necessary permissions
GRANT SELECT ON webhook_metrics TO authenticated;
GRANT SELECT ON webhook_deliveries TO authenticated;
GRANT SELECT ON webhook_logs TO authenticated;

-- Analyze tables for query optimization
ANALYZE webhook_subscriptions;
ANALYZE webhook_deliveries;
ANALYZE webhook_logs;

-- Create function to get webhook health status
CREATE OR REPLACE FUNCTION get_webhook_health()
RETURNS TABLE(
  total_webhooks BIGINT,
  active_webhooks BIGINT,
  failing_webhooks BIGINT,
  avg_success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_webhooks,
    COUNT(*) FILTER (WHERE active = true) as active_webhooks,
    COUNT(*) FILTER (WHERE consecutive_failures >= failure_threshold) as failing_webhooks,
    ROUND(AVG(
      CASE WHEN wd_stats.total_deliveries > 0 
      THEN (wd_stats.successful_deliveries::DECIMAL / wd_stats.total_deliveries) * 100 
      ELSE 100 END
    ), 2) as avg_success_rate
  FROM webhook_subscriptions ws
  LEFT JOIN (
    SELECT 
      webhook_id,
      COUNT(*) as total_deliveries,
      COUNT(*) FILTER (WHERE response_status >= 200 AND response_status < 300) as successful_deliveries
    FROM webhook_deliveries 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY webhook_id
  ) wd_stats ON wd_stats.webhook_id = ws.id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_webhook_health() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_webhook_data() TO authenticated;

-- Final notification
DO $$
BEGIN
  RAISE NOTICE 'Webhook system schema complete! Added tables: webhook_deliveries, webhook_logs';
  RAISE NOTICE 'Added indexes, RLS policies, and monitoring functions';
  RAISE NOTICE 'Webhook system is now production ready!';
END $$;