-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  objective TEXT,
  target_audience TEXT,
  key_messages TEXT,
  channels TEXT[],
  timeline TEXT,
  budget TEXT,
  kpis TEXT,
  additional_notes TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view strategies for clients they have access to
CREATE POLICY strategy_select_policy ON strategies
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert strategies for clients they have access to
CREATE POLICY strategy_insert_policy ON strategies
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update strategies for clients they have access to
CREATE POLICY strategy_update_policy ON strategies
  FOR UPDATE
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete strategies for clients they have access to
CREATE POLICY strategy_delete_policy ON strategies
  FOR DELETE
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS strategies_client_id_idx ON strategies(client_id);
CREATE INDEX IF NOT EXISTS strategies_created_by_idx ON strategies(created_by);
