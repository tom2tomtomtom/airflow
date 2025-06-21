-- Create workflow_sessions table for managing workflow state
-- This table stores the state of user workflow sessions for the UnifiedBriefWorkflow

CREATE TABLE IF NOT EXISTS workflow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Workflow state
  current_step INTEGER DEFAULT 0,
  processing BOOLEAN DEFAULT FALSE,
  last_error TEXT,
  
  -- Step data (stored as JSONB for flexibility)
  brief_data JSONB,
  motivations JSONB DEFAULT '[]'::jsonb,
  copy_variations JSONB DEFAULT '[]'::jsonb,
  selected_assets TEXT[] DEFAULT '{}',
  selected_template JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_user_id ON workflow_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_client_id ON workflow_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_created_at ON workflow_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_expires_at ON workflow_sessions(expires_at);

-- RLS (Row Level Security) policies
ALTER TABLE workflow_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own workflow sessions
CREATE POLICY "Users can view their own workflow sessions" ON workflow_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow sessions" ON workflow_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow sessions" ON workflow_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow sessions" ON workflow_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_workflow_sessions_updated_at
  BEFORE UPDATE ON workflow_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_sessions_updated_at();

-- Function to clean up expired workflow sessions
CREATE OR REPLACE FUNCTION cleanup_expired_workflow_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM workflow_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE workflow_sessions IS 'Stores workflow session state for the UnifiedBriefWorkflow component';
COMMENT ON COLUMN workflow_sessions.id IS 'Unique identifier for the workflow session';
COMMENT ON COLUMN workflow_sessions.user_id IS 'User who owns this workflow session';
COMMENT ON COLUMN workflow_sessions.client_id IS 'Associated client for the workflow';
COMMENT ON COLUMN workflow_sessions.current_step IS 'Current step in the workflow (0-based index)';
COMMENT ON COLUMN workflow_sessions.processing IS 'Whether the workflow is currently processing';
COMMENT ON COLUMN workflow_sessions.last_error IS 'Last error message if any';
COMMENT ON COLUMN workflow_sessions.brief_data IS 'Parsed brief data from upload step';
COMMENT ON COLUMN workflow_sessions.motivations IS 'Generated motivations with selection state';
COMMENT ON COLUMN workflow_sessions.copy_variations IS 'Generated copy variations with selection state';
COMMENT ON COLUMN workflow_sessions.selected_assets IS 'Array of selected asset IDs';
COMMENT ON COLUMN workflow_sessions.selected_template IS 'Selected template data';
COMMENT ON COLUMN workflow_sessions.metadata IS 'Additional metadata for the workflow session';
COMMENT ON COLUMN workflow_sessions.expires_at IS 'When this session expires and can be cleaned up';

-- Grant permissions (adjust based on your auth setup)
GRANT ALL ON workflow_sessions TO authenticated;
GRANT USAGE ON SEQUENCE workflow_sessions_id_seq TO authenticated;
