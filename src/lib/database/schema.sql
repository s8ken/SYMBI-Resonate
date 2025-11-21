-- Unified Schema for SYMBI Resonate
-- Connects Resonance Lab experiments with Analytics Dashboard

-- ============================================================================
-- EXPERIMENTS & VARIANTS
-- ============================================================================

-- Experiments table (from Resonance Lab)
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  sample_size INTEGER NOT NULL,
  confidence_level DECIMAL(3,2) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'running', 'completed', 'failed', 'cancelled')),
  CONSTRAINT valid_confidence CHECK (confidence_level >= 0.8 AND confidence_level <= 0.999),
  CONSTRAINT valid_budget CHECK (budget >= 0)
);

-- Variants table
CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  system_prompt TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_provider CHECK (provider IN ('openai', 'anthropic', 'google', 'custom')),
  CONSTRAINT valid_temperature CHECK (temperature >= 0 AND temperature <= 2)
);

-- Evaluation criteria for experiments
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  criterion VARCHAR(100) NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  description TEXT,
  
  CONSTRAINT valid_weight CHECK (weight >= 0 AND weight <= 1)
);

-- ============================================================================
-- TRIALS & RESULTS
-- ============================================================================

-- Individual trial executions
CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  trial_number INTEGER NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  response_time_ms INTEGER,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_trial_status CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  UNIQUE(experiment_id, variant_id, trial_number)
);

-- Trial scores for each evaluation criterion
CREATE TABLE IF NOT EXISTS trial_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  criterion VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  evaluator_type VARCHAR(50) NOT NULL,
  confidence DECIMAL(3,2),
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100),
  CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  CONSTRAINT valid_evaluator CHECK (evaluator_type IN ('ai', 'human', 'automated'))
);

-- ============================================================================
-- ANALYTICS & ASSESSMENTS (from existing Dashboard)
-- ============================================================================

-- SYMBI Framework assessments
CREATE TABLE IF NOT EXISTS symbi_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
  trial_id UUID REFERENCES trials(id) ON DELETE SET NULL,
  content_text TEXT NOT NULL,
  
  -- SYMBI Framework scores (0-100)
  self_organization_score DECIMAL(5,2),
  meta_reflection_score DECIMAL(5,2),
  boundary_awareness_score DECIMAL(5,2),
  integration_score DECIMAL(5,2),
  
  -- Overall SYMBI score
  overall_score DECIMAL(5,2),
  
  -- Analysis metadata
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzer_version VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_scores CHECK (
    self_organization_score >= 0 AND self_organization_score <= 100 AND
    meta_reflection_score >= 0 AND meta_reflection_score <= 100 AND
    boundary_awareness_score >= 0 AND boundary_awareness_score <= 100 AND
    integration_score >= 0 AND integration_score <= 100 AND
    overall_score >= 0 AND overall_score <= 100
  )
);

-- Conversation analytics
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
  trial_id UUID REFERENCES trials(id) ON DELETE SET NULL,
  user_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- ============================================================================
-- CROSS-REFERENCES & RELATIONSHIPS
-- ============================================================================

-- Link experiments to analytics data
CREATE TABLE IF NOT EXISTS experiment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_metric_type CHECK (metric_type IN ('performance', 'cost', 'quality', 'engagement'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_created_at ON experiments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_variants_experiment ON variants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_trials_experiment ON trials(experiment_id);
CREATE INDEX IF NOT EXISTS idx_trials_variant ON trials(variant_id);
CREATE INDEX IF NOT EXISTS idx_trials_status ON trials(status);
CREATE INDEX IF NOT EXISTS idx_trial_scores_trial ON trial_scores(trial_id);
CREATE INDEX IF NOT EXISTS idx_symbi_assessments_experiment ON symbi_assessments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_symbi_assessments_trial ON symbi_assessments(trial_id);
CREATE INDEX IF NOT EXISTS idx_conversations_experiment ON conversations(experiment_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_experiment_analytics_experiment ON experiment_analytics(experiment_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Aggregated experiment results
CREATE OR REPLACE VIEW experiment_results_summary AS
SELECT 
  e.id,
  e.name,
  e.status,
  e.created_at,
  e.completed_at,
  COUNT(DISTINCT v.id) as variant_count,
  COUNT(DISTINCT t.id) as trial_count,
  AVG(ts.score) as avg_score,
  SUM(t.cost) as total_cost,
  AVG(t.response_time_ms) as avg_response_time,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0) * 100 as success_rate
FROM experiments e
LEFT JOIN variants v ON e.id = v.experiment_id
LEFT JOIN trials t ON e.id = t.experiment_id
LEFT JOIN trial_scores ts ON t.id = ts.trial_id
GROUP BY e.id, e.name, e.status, e.created_at, e.completed_at;

-- Variant performance comparison
CREATE OR REPLACE VIEW variant_performance AS
SELECT 
  v.id,
  v.experiment_id,
  v.name,
  v.provider,
  v.model,
  COUNT(t.id) as trial_count,
  AVG(ts.score) as avg_score,
  AVG(t.response_time_ms) as avg_response_time,
  SUM(t.cost) as total_cost,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0) * 100 as success_rate
FROM variants v
LEFT JOIN trials t ON v.id = t.variant_id
LEFT JOIN trial_scores ts ON t.id = ts.trial_id
GROUP BY v.id, v.experiment_id, v.name, v.provider, v.model;

-- SYMBI Framework trends
CREATE OR REPLACE VIEW symbi_trends AS
SELECT 
  DATE_TRUNC('day', analyzed_at) as date,
  AVG(overall_score) as avg_overall_score,
  AVG(self_organization_score) as avg_self_organization,
  AVG(meta_reflection_score) as avg_meta_reflection,
  AVG(boundary_awareness_score) as avg_boundary_awareness,
  AVG(integration_score) as avg_integration,
  COUNT(*) as assessment_count
FROM symbi_assessments
GROUP BY DATE_TRUNC('day', analyzed_at)
ORDER BY date DESC;

-- ============================================================================
-- FUNCTIONS FOR DATA INTEGRITY
-- ============================================================================

-- Update experiment total cost when trials complete
CREATE OR REPLACE FUNCTION update_experiment_cost()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE experiments
  SET total_cost = (
    SELECT COALESCE(SUM(cost), 0)
    FROM trials
    WHERE experiment_id = NEW.experiment_id
  )
  WHERE id = NEW.experiment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trial_cost_update
AFTER INSERT OR UPDATE OF cost ON trials
FOR EACH ROW
EXECUTE FUNCTION update_experiment_cost();

-- Update experiment status based on trials
CREATE OR REPLACE FUNCTION update_experiment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_trials INTEGER;
  completed_trials INTEGER;
  failed_trials INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    COUNT(CASE WHEN status = 'failed' THEN 1 END)
  INTO total_trials, completed_trials, failed_trials
  FROM trials
  WHERE experiment_id = NEW.experiment_id;
  
  IF total_trials > 0 AND completed_trials = total_trials THEN
    UPDATE experiments SET status = 'completed', completed_at = NOW()
    WHERE id = NEW.experiment_id AND status != 'completed';
  ELSIF failed_trials > total_trials * 0.5 THEN
    UPDATE experiments SET status = 'failed'
    WHERE id = NEW.experiment_id AND status NOT IN ('completed', 'failed');
  ELSIF completed_trials > 0 THEN
    UPDATE experiments SET status = 'running'
    WHERE id = NEW.experiment_id AND status = 'draft';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trial_status_update
AFTER INSERT OR UPDATE OF status ON trials
FOR EACH ROW
EXECUTE FUNCTION update_experiment_status();