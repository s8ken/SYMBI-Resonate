-- SYMBI Resonate Experiments Core Tables
-- This migration creates the complete experiment system database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (if not exists)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiments table
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    config JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    CONSTRAINT experiments_status_check CHECK (status IN ('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Experiment runs table
CREATE TABLE experiment_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    total_trials INTEGER NOT NULL DEFAULT 0,
    completed_trials INTEGER DEFAULT 0,
    failed_trials INTEGER DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT experiment_runs_status_check CHECK (status IN ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Trials table
CREATE TABLE trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES experiment_runs(id) ON DELETE CASCADE,
    variant_id VARCHAR(100) NOT NULL,
    slot_id INTEGER NOT NULL,
    input JSONB NOT NULL DEFAULT '{}',
    output JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    integrity_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT trials_slot_check CHECK (slot_id >= 0)
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    evaluator_agent_id VARCHAR(100) NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}',
    dimensions JSONB DEFAULT '{}',
    feedback TEXT,
    confidence DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence >= 0 AND confidence <= 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resonance measurements table
CREATE TABLE resonance_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES experiment_runs(id) ON DELETE CASCADE,
    variant_id VARCHAR(100) NOT NULL,
    dimension VARCHAR(50) NOT NULL,
    score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
    confidence DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence >= 0 AND confidence <= 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT resonance_measurements_dimension_check CHECK (dimension IN ('REALITY_INDEX', 'TRUST_PROTOCOL', 'ETHICAL_ALIGNMENT', 'RESONANCE_QUALITY', 'CANVAS_PARITY'))
);

-- Audit logs table
CREATE TABLE experiment_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data retention policies table
CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    experiment_retention_days INTEGER DEFAULT 365,
    trial_retention_days INTEGER DEFAULT 180,
    evaluation_retention_days INTEGER DEFAULT 180,
    auto_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_experiments_organization_id ON experiments(organization_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_created_at ON experiments(created_at);

CREATE INDEX idx_experiment_runs_experiment_id ON experiment_runs(experiment_id);
CREATE INDEX idx_experiment_runs_status ON experiment_runs(status);
CREATE INDEX idx_experiment_runs_created_at ON experiment_runs(created_at);

CREATE INDEX idx_trials_experiment_id ON trials(experiment_id);
CREATE INDEX idx_trials_run_id ON trials(run_id);
CREATE INDEX idx_trials_variant_id ON trials(variant_id);
CREATE INDEX idx_trials_slot_id ON trials(slot_id);
CREATE INDEX idx_trials_created_at ON trials(created_at);

CREATE INDEX idx_evaluations_trial_id ON evaluations(trial_id);
CREATE INDEX idx_evaluations_experiment_id ON evaluations(experiment_id);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at);

CREATE INDEX idx_resonance_measurements_experiment_id ON resonance_measurements(experiment_id);
CREATE INDEX idx_resonance_measurements_run_id ON resonance_measurements(run_id);
CREATE INDEX idx_resonance_measurements_variant_id ON resonance_measurements(variant_id);
CREATE INDEX idx_resonance_measurements_dimension ON resonance_measurements(dimension);

CREATE INDEX idx_experiment_audit_logs_experiment_id ON experiment_audit_logs(experiment_id);
CREATE INDEX idx_experiment_audit_logs_created_at ON experiment_audit_logs(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resonance_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for experiments
CREATE POLICY "Users can view experiments in their organization" ON experiments
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create experiments in their organization" ON experiments
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update experiments in their organization" ON experiments
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete experiments in their organization" ON experiments
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- RLS Policies for experiment runs
CREATE POLICY "Users can view experiment runs in their organization" ON experiment_runs
    FOR SELECT USING (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Users can create experiment runs in their organization" ON experiment_runs
    FOR INSERT WITH CHECK (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

-- RLS Policies for trials
CREATE POLICY "Users can view trials in their organization" ON trials
    FOR SELECT USING (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Users can create trials in their organization" ON trials
    FOR INSERT WITH CHECK (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

-- RLS Policies for evaluations
CREATE POLICY "Users can view evaluations in their organization" ON evaluations
    FOR SELECT USING (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Users can create evaluations in their organization" ON evaluations
    FOR INSERT WITH CHECK (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

-- RLS Policies for resonance measurements
CREATE POLICY "Users can view resonance measurements in their organization" ON resonance_measurements
    FOR SELECT USING (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Users can create resonance measurements in their organization" ON resonance_measurements
    FOR INSERT WITH CHECK (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

-- RLS Policies for audit logs
CREATE POLICY "Users can view audit logs in their organization" ON experiment_audit_logs
    FOR SELECT USING (
        experiment_id IN (SELECT id FROM experiments WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    );

-- RLS Policies for data retention policies
CREATE POLICY "Users can view data retention policies in their organization" ON data_retention_policies
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update data retention policies in their organization" ON data_retention_policies
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON experiments TO anon, authenticated;
GRANT INSERT ON experiments TO authenticated;
GRANT UPDATE ON experiments TO authenticated;
GRANT DELETE ON experiments TO authenticated;

GRANT SELECT ON experiment_runs TO anon, authenticated;
GRANT INSERT ON experiment_runs TO authenticated;
GRANT UPDATE ON experiment_runs TO authenticated;

GRANT SELECT ON trials TO anon, authenticated;
GRANT INSERT ON trials TO authenticated;

GRANT SELECT ON evaluations TO anon, authenticated;
GRANT INSERT ON evaluations TO authenticated;

GRANT SELECT ON resonance_measurements TO anon, authenticated;
GRANT INSERT ON resonance_measurements TO authenticated;

GRANT SELECT ON experiment_audit_logs TO anon, authenticated;
GRANT INSERT ON experiment_audit_logs TO authenticated;

GRANT SELECT ON data_retention_policies TO anon, authenticated;
GRANT INSERT ON data_retention_policies TO authenticated;
GRANT UPDATE ON data_retention_policies TO authenticated;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiment_runs_updated_at BEFORE UPDATE ON experiment_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION log_experiment_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO experiment_audit_logs (experiment_id, action, details)
    VALUES (NEW.id, TG_OP, jsonb_build_object(
        'table', TG_TABLE_NAME,
        'timestamp', NOW(),
        'user_id', auth.uid()
    ));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create audit log triggers
CREATE TRIGGER audit_experiment_changes AFTER INSERT OR UPDATE OR DELETE ON experiments
    FOR EACH ROW EXECUTE FUNCTION log_experiment_action();