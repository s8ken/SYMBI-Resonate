-- Migration: Unified Schema for SYMBI Resonate
-- Description: Creates unified data model connecting Resonance Lab and Analytics Dashboard
-- Version: 1.0.0
-- Date: 2024-11-21

BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Import the complete schema
\i ../schema.sql

-- Insert sample data for testing (optional)
INSERT INTO experiments (name, description, status, sample_size, confidence_level, budget) VALUES
  ('GPT-4 vs Claude 3 Comparison', 'Testing response quality for customer support scenarios', 'completed', 100, 0.95, 500.00),
  ('Prompt Engineering Experiment', 'Comparing different prompt strategies', 'running', 50, 0.90, 250.00);

COMMIT;