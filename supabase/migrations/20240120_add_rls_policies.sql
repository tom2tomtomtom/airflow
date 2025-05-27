-- Row Level Security (RLS) policies for AIrWAVE
-- Ensures data isolation between clients and proper access control

-- Enable RLS on all tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has access to a client
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

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION user_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = $1 
        AND profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assets policies
CREATE POLICY "Users can view assets for their clients"
    ON assets FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can create assets for their clients"
    ON assets FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can update their own assets"
    ON assets FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can delete their own assets"
    ON assets FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

-- Executions policies
CREATE POLICY "Users can view executions for their clients"
    ON executions FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can create executions for their clients"
    ON executions FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can update their own executions"
    ON executions FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

-- Matrices policies
CREATE POLICY "Users can view matrices for their clients"
    ON matrices FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can create matrices for their clients"
    ON matrices FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can update their own matrices"
    ON matrices FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can delete their own matrices"
    ON matrices FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

-- Clients policies
CREATE POLICY "Users can view their assigned clients"
    ON clients FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Only admins can create clients"
    ON clients FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_is_admin(auth.uid())
    );

CREATE POLICY "Only admins can update clients"
    ON clients FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        user_is_admin(auth.uid())
    );

CREATE POLICY "Only admins can delete clients"
    ON clients FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        user_is_admin(auth.uid())
    );

-- User clients policies
CREATE POLICY "Users can view their own client assignments"
    ON user_clients FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Only admins can manage client assignments"
    ON user_clients FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        user_is_admin(auth.uid())
    );

-- Briefs policies
CREATE POLICY "Users can view briefs for their clients"
    ON briefs FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can create briefs for their clients"
    ON briefs FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can update their own briefs"
    ON briefs FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

-- Templates policies (global access for reading, restricted for writing)
CREATE POLICY "Anyone can view public templates"
    ON templates FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            client_id IS NULL OR
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can create templates for their clients"
    ON templates FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            client_id IS NULL OR
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

-- Webhook subscriptions policies
CREATE POLICY "Users can view webhook subscriptions for their clients"
    ON webhook_subscriptions FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            client_id IS NULL OR
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can create webhook subscriptions"
    ON webhook_subscriptions FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            client_id IS NULL OR
            user_has_client_access(auth.uid(), client_id) OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can update their own webhook subscriptions"
    ON webhook_subscriptions FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            (metadata->>'created_by')::UUID = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

CREATE POLICY "Users can delete their own webhook subscriptions"
    ON webhook_subscriptions FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            (metadata->>'created_by')::UUID = auth.uid() OR
            user_is_admin(auth.uid())
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_client_access TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_admin TO authenticated;
