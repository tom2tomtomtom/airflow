-- Row Level Security (RLS) Policies for AIrWAVE
-- This file sets up security policies to control data access

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has access to a client
CREATE OR REPLACE FUNCTION has_client_access(user_id UUID, client_id UUID)
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
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = $1 
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- Service role can manage profiles
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- CLIENTS POLICIES
-- Users can view clients they have access to
CREATE POLICY "Users can view assigned clients" ON clients
  FOR SELECT USING (
    has_client_access(auth.uid(), id) OR 
    is_admin(auth.uid())
  );

-- Only admins can create/update/delete clients
CREATE POLICY "Admins can manage clients" ON clients
  FOR ALL USING (is_admin(auth.uid()));

-- USER_CLIENTS POLICIES
-- Users can see their own assignments
CREATE POLICY "Users can view own client assignments" ON user_clients
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all assignments
CREATE POLICY "Admins can manage client assignments" ON user_clients
  FOR ALL USING (is_admin(auth.uid()));

-- ASSETS POLICIES
-- Users can view assets from their clients
CREATE POLICY "Users can view client assets" ON assets
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create assets for their clients
CREATE POLICY "Users can create client assets" ON assets
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update their own assets
CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- Users can delete their own assets
CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- TEMPLATES POLICIES
-- Users can view templates from their clients or global templates
CREATE POLICY "Users can view accessible templates" ON templates
  FOR SELECT USING (
    client_id IS NULL OR 
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create templates for their clients
CREATE POLICY "Users can create client templates" ON templates
  FOR INSERT WITH CHECK (
    (client_id IS NULL OR has_client_access(auth.uid(), client_id)) AND 
    auth.uid() = created_by
  );

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- BRIEFS POLICIES
-- Users can view briefs from their clients
CREATE POLICY "Users can view client briefs" ON briefs
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create briefs for their clients
CREATE POLICY "Users can create client briefs" ON briefs
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update briefs they created
CREATE POLICY "Users can update own briefs" ON briefs
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- STRATEGIES POLICIES
-- Users can view strategies from their clients
CREATE POLICY "Users can view client strategies" ON strategies
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create strategies for their clients
CREATE POLICY "Users can create client strategies" ON strategies
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update strategies they created
CREATE POLICY "Users can update own strategies" ON strategies
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- MOTIVATIONS POLICIES
-- Users can view motivations from their clients
CREATE POLICY "Users can view client motivations" ON motivations
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create motivations for their clients
CREATE POLICY "Users can create client motivations" ON motivations
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update motivations they created
CREATE POLICY "Users can update own motivations" ON motivations
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- CONTENT_VARIATIONS POLICIES
-- Users can view content from their clients
CREATE POLICY "Users can view client content" ON content_variations
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create content for their clients
CREATE POLICY "Users can create client content" ON content_variations
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update content they created
CREATE POLICY "Users can update own content" ON content_variations
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- MATRICES POLICIES
-- Users can view matrices from their clients
CREATE POLICY "Users can view client matrices" ON matrices
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create matrices for their clients
CREATE POLICY "Users can create client matrices" ON matrices
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update matrices they created
CREATE POLICY "Users can update own matrices" ON matrices
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- EXECUTIONS POLICIES
-- Users can view executions from their clients
CREATE POLICY "Users can view client executions" ON executions
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create executions for their clients
CREATE POLICY "Users can create client executions" ON executions
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = created_by
  );

-- Users can update executions they created
CREATE POLICY "Users can update own executions" ON executions
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    is_admin(auth.uid())
  );

-- APPROVAL_WORKFLOWS POLICIES
-- Users can view approval workflows from their clients
CREATE POLICY "Users can view client approval workflows" ON approval_workflows
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Users can create approval workflows for their clients
CREATE POLICY "Users can create client approval workflows" ON approval_workflows
  FOR INSERT WITH CHECK (
    has_client_access(auth.uid(), client_id) AND 
    auth.uid() = submitted_by
  );

-- Users can update workflows they submitted or are reviewing
CREATE POLICY "Users can update relevant workflows" ON approval_workflows
  FOR UPDATE USING (
    auth.uid() = submitted_by OR 
    auth.uid() = reviewed_by OR
    is_admin(auth.uid())
  );

-- APPROVALS POLICIES
-- Users can view approvals for executions they have access to
CREATE POLICY "Users can view relevant approvals" ON approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM executions 
      WHERE executions.id = approvals.execution_id 
      AND (has_client_access(auth.uid(), executions.client_id) OR is_admin(auth.uid()))
    )
  );

-- Users can create approvals for executions they have access to
CREATE POLICY "Users can create approvals" ON approvals
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM executions 
      WHERE executions.id = execution_id 
      AND has_client_access(auth.uid(), executions.client_id)
    )
  );

-- ANALYTICS POLICIES
-- Users can view analytics for their clients' campaigns
CREATE POLICY "Users can view client analytics" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM executions 
      WHERE executions.id = analytics.campaign_id 
      AND (has_client_access(auth.uid(), executions.client_id) OR is_admin(auth.uid()))
    )
  );

-- CAMPAIGN_ANALYTICS POLICIES
-- Users can view campaign analytics for their clients
CREATE POLICY "Users can view client campaign analytics" ON campaign_analytics
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- PLATFORM_INTEGRATIONS POLICIES
-- Users can view integrations for their clients
CREATE POLICY "Users can view client integrations" ON platform_integrations
  FOR SELECT USING (
    has_client_access(auth.uid(), client_id) OR 
    is_admin(auth.uid())
  );

-- Only admins can manage integrations
CREATE POLICY "Admins can manage integrations" ON platform_integrations
  FOR ALL USING (is_admin(auth.uid()));

-- Service role bypass for all tables (for server-side operations)
CREATE POLICY "Service role bypass" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON clients FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON user_clients FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON assets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON briefs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON strategies FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON motivations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON content_variations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON matrices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON executions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON campaign_analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role bypass" ON platform_integrations FOR ALL USING (auth.role() = 'service_role');