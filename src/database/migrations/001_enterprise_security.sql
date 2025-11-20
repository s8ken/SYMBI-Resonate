-- Enterprise Security Enhancements Migration
-- This migration adds tables and functions for MFA, RBAC, and enhanced audit logging

-- ============================================================================
-- MFA (Multi-Factor Authentication) Tables
-- ============================================================================

-- Table for storing MFA secrets
CREATE TABLE IF NOT EXISTS mfa_secrets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes_encrypted TEXT[], -- Array of encrypted backup codes
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for tracking MFA usage
CREATE TABLE IF NOT EXISTS mfa_usage_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('totp', 'backup_code')),
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for MFA tables
CREATE INDEX IF NOT EXISTS idx_mfa_secrets_user_id ON mfa_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_usage_log_user_id ON mfa_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_usage_log_created_at ON mfa_usage_log(created_at DESC);

-- ============================================================================
-- RBAC (Role-Based Access Control) Tables
-- ============================================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, role_id, organization_id)
);

-- Indexes for RBAC tables
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON user_roles(organization_id);

-- ============================================================================
-- Enhanced Audit Logging Tables
-- ============================================================================

-- Comprehensive audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  resource TEXT,
  resource_id TEXT,
  action TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'partial')),
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  correlation_id TEXT,
  parent_event_id UUID REFERENCES audit_logs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_result ON audit_logs(result);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);

-- ============================================================================
-- API Keys Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- ============================================================================
-- Rate Limiting Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier TEXT NOT NULL, -- user_id, ip_address, or api_key
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('user', 'ip', 'api_key')),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, identifier_type, endpoint, window_start)
);

-- Indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits(blocked_until);

-- ============================================================================
-- Security Events Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_mfa_secrets_updated_at
  BEFORE UPDATE ON mfa_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id)
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND p_permission = ANY(r.permissions)
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID, p_organization_id UUID DEFAULT NULL)
RETURNS TABLE (
  role_name TEXT,
  role_description TEXT,
  permissions TEXT[],
  organization_id UUID,
  granted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.name,
    r.description,
    r.permissions,
    ur.organization_id,
    ur.granted_at
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id)
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND severity NOT IN ('critical', 'error');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE window_end < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE mfa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- MFA Secrets policies
CREATE POLICY "Users can view their own MFA secrets" ON mfa_secrets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA secrets" ON mfa_secrets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA secrets" ON mfa_secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs policies (read-only for users, admins can see all)
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_has_permission(auth.uid(), 'audit:read')
  );

-- API keys policies
CREATE POLICY "Users can view their own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.organization_id = organizations.id
    )
  );

-- User roles policies
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- Insert Default Roles
-- ============================================================================

INSERT INTO roles (name, description, permissions, is_system_role) VALUES
  ('super_admin', 'Full system access with all permissions', ARRAY[
    'user:create', 'user:read', 'user:update', 'user:delete',
    'org:create', 'org:read', 'org:update', 'org:delete',
    'analytics:read', 'analytics:write', 'analytics:delete', 'analytics:export',
    'conversation:read', 'conversation:write', 'conversation:delete',
    'symbi:assess', 'symbi:validate', 'symbi:export',
    'audit:read', 'audit:export',
    'api_key:create', 'api_key:read', 'api_key:revoke',
    'settings:read', 'settings:write',
    'compliance:read', 'compliance:manage',
    'system:admin', 'system:monitor'
  ], true),
  
  ('admin', 'Organization administrator with management capabilities', ARRAY[
    'user:create', 'user:read', 'user:update', 'user:delete',
    'org:read', 'org:update',
    'analytics:read', 'analytics:write', 'analytics:delete', 'analytics:export',
    'conversation:read', 'conversation:write', 'conversation:delete',
    'symbi:assess', 'symbi:validate', 'symbi:export',
    'audit:read', 'audit:export',
    'api_key:create', 'api_key:read', 'api_key:revoke',
    'settings:read', 'settings:write',
    'compliance:read',
    'system:monitor'
  ], true),
  
  ('analyst', 'Analytics professional with read/write access', ARRAY[
    'user:read',
    'org:read',
    'analytics:read', 'analytics:write', 'analytics:export',
    'conversation:read', 'conversation:write',
    'symbi:assess', 'symbi:validate', 'symbi:export',
    'settings:read'
  ], true),
  
  ('viewer', 'Read-only access to analytics and reports', ARRAY[
    'user:read',
    'org:read',
    'analytics:read',
    'conversation:read',
    'settings:read'
  ], true),
  
  ('api_user', 'Programmatic API access', ARRAY[
    'analytics:read', 'analytics:write',
    'conversation:read', 'conversation:write',
    'symbi:assess'
  ], true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE mfa_secrets IS 'Stores encrypted MFA secrets and backup codes for users';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security, compliance, and debugging';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access with granular permissions';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for API endpoints and users';
COMMENT ON TABLE security_events IS 'Security incidents and suspicious activities';
COMMENT ON TABLE roles IS 'Role definitions with associated permissions';
COMMENT ON TABLE user_roles IS 'User role assignments with optional organization scope';

COMMENT ON FUNCTION user_has_permission IS 'Check if a user has a specific permission';
COMMENT ON FUNCTION get_user_roles IS 'Get all roles for a user with optional organization filter';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Remove audit logs older than retention period';
COMMENT ON FUNCTION cleanup_old_rate_limits IS 'Remove expired rate limit records';