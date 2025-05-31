-- Add Multi-Factor Authentication support
-- This migration adds tables and functions to support TOTP-based MFA

-- Create MFA table for storing user MFA configurations
CREATE TABLE public.user_mfa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes_encrypted TEXT NOT NULL,
  used_backup_codes TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one MFA config per user
  UNIQUE(user_id)
);

-- Create index for performance
CREATE INDEX idx_user_mfa_user_id ON public.user_mfa(user_id);
CREATE INDEX idx_user_mfa_enabled ON public.user_mfa(user_id, is_enabled);

-- Add MFA audit log for security monitoring
CREATE TABLE public.mfa_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'setup', 'verify', 'login', 'disable', 'backup_used'
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX idx_mfa_audit_user_id ON public.mfa_audit_log(user_id);
CREATE INDEX idx_mfa_audit_created_at ON public.mfa_audit_log(created_at);
CREATE INDEX idx_mfa_audit_action ON public.mfa_audit_log(action);
CREATE INDEX idx_mfa_audit_success ON public.mfa_audit_log(success);

-- Enable RLS for MFA tables
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_mfa table
CREATE POLICY "Users can manage their own MFA config" ON public.user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for mfa_audit_log table
CREATE POLICY "Users can view their own MFA audit log" ON public.mfa_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all MFA audit logs
CREATE POLICY "Admins can view all MFA audit logs" ON public.mfa_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to log MFA events
CREATE OR REPLACE FUNCTION log_mfa_event(
  p_user_id UUID,
  p_action TEXT,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.mfa_audit_log (
    user_id,
    action,
    success,
    ip_address,
    user_agent,
    error_message,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_success,
    p_ip_address,
    p_user_agent,
    p_error_message,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on user_mfa
CREATE TRIGGER update_user_mfa_updated_at 
  BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add MFA columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN mfa_enforced BOOLEAN DEFAULT false; -- For admin-enforced MFA

-- Create index for MFA status queries
CREATE INDEX idx_profiles_mfa_status ON public.profiles(mfa_enabled, mfa_enforced);

-- Create function to check if MFA is required for user
CREATE OR REPLACE FUNCTION is_mfa_required(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT mfa_enabled, mfa_enforced, role
  INTO user_profile
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- MFA is required if:
  -- 1. User has enabled it voluntarily, OR
  -- 2. Admin has enforced it for the user, OR
  -- 3. User has admin/manager role (enforce for privileged users)
  RETURN COALESCE(
    user_profile.mfa_enabled OR 
    user_profile.mfa_enforced OR 
    user_profile.role IN ('admin', 'manager'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get MFA status for user
CREATE OR REPLACE FUNCTION get_mfa_status(p_user_id UUID)
RETURNS TABLE (
  is_configured BOOLEAN,
  is_enabled BOOLEAN,
  is_required BOOLEAN,
  backup_codes_count INTEGER,
  last_used_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN mfa.user_id IS NOT NULL THEN true ELSE false END as is_configured,
    COALESCE(mfa.is_enabled, false) as is_enabled,
    is_mfa_required(p_user_id) as is_required,
    CASE 
      WHEN mfa.backup_codes_encrypted IS NOT NULL 
      THEN (
        array_length(
          COALESCE(mfa.used_backup_codes, '{}'), 1
        ) - 8
      ) * -1 -- Total backup codes (8) minus used codes
      ELSE 0 
    END as backup_codes_count,
    mfa.last_used_at
  FROM public.profiles p
  LEFT JOIN public.user_mfa mfa ON mfa.user_id = p.id
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old audit logs (for data retention)
CREATE OR REPLACE FUNCTION cleanup_mfa_audit_logs(
  retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.mfa_audit_log
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_mfa_event TO authenticated;
GRANT EXECUTE ON FUNCTION is_mfa_required TO authenticated;
GRANT EXECUTE ON FUNCTION get_mfa_status TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.user_mfa IS 'Stores MFA configuration for users including encrypted TOTP secrets and backup codes';
COMMENT ON TABLE public.mfa_audit_log IS 'Audit trail for all MFA-related activities for security monitoring';
COMMENT ON FUNCTION log_mfa_event IS 'Logs MFA events for security auditing and monitoring';
COMMENT ON FUNCTION is_mfa_required IS 'Determines if MFA is required for a specific user';
COMMENT ON FUNCTION get_mfa_status IS 'Returns comprehensive MFA status information for a user';
COMMENT ON FUNCTION cleanup_mfa_audit_logs IS 'Cleans up old MFA audit logs for data retention compliance';