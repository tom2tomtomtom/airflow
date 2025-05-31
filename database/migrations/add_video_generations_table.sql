-- Add video_generations table for tracking AI video generation jobs
CREATE TABLE IF NOT EXISTS video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES briefs(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  matrix_id UUID REFERENCES matrices(id) ON DELETE SET NULL,
  variation_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  config JSONB NOT NULL DEFAULT '{}',
  render_job_id TEXT,
  output_url TEXT,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_generations_generation_id ON video_generations(generation_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_client_id ON video_generations(client_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_status ON video_generations(status);
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON video_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_video_generations_brief_id ON video_generations(brief_id) WHERE brief_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_generations_campaign_id ON video_generations(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_generations_matrix_id ON video_generations(matrix_id) WHERE matrix_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Policy for reading video generations
CREATE POLICY "Users can read video generations for their clients" ON video_generations
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Policy for creating video generations
CREATE POLICY "Users can create video generations for their clients" ON video_generations
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- Policy for updating video generations
CREATE POLICY "Users can update video generations for their clients" ON video_generations
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Policy for deleting video generations
CREATE POLICY "Users can delete video generations for their clients" ON video_generations
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_video_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_generations_updated_at
  BEFORE UPDATE ON video_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_video_generations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE video_generations IS 'Tracks AI video generation jobs and their status';
COMMENT ON COLUMN video_generations.generation_id IS 'Groups multiple variations of the same generation request';
COMMENT ON COLUMN video_generations.variation_index IS 'Index of this variation within the generation (1, 2, 3, etc.)';
COMMENT ON COLUMN video_generations.config IS 'JSON configuration used for video generation';
COMMENT ON COLUMN video_generations.render_job_id IS 'External render service job ID (e.g., Creatomate render ID)';
COMMENT ON COLUMN video_generations.metadata IS 'Additional metadata about the generation process';