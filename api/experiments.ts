import { Request, Response } from 'express';
import { supabase } from '../src/lib/supabase';
import { createSYMBIExperiments } from '../src/lib/experiments';
import { ExperimentStatus, ExperimentConfig } from '../src/lib/experiments/types';
import { ValidationHelpers, IdGenerator } from '../src/lib/experiments/utils';

const experiments = createSYMBIExperiments({
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  providerConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY
  }
});

// Get all experiments for the current organization
export const getExperiments = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID is required' });
    }

    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ experiments: data });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
};

// Get a specific experiment by ID
export const getExperiment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID is required' });
    }

    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ experiment: data });
  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
};

// Create a new experiment
export const createExperiment = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, description, config } = req.body;

    // Validate input
    ValidationHelpers.validateExperimentName(name);
    if (description) {
      ValidationHelpers.validateDescription(description);
    }

    // Validate experiment configuration
    if (!config || !config.variants || config.variants.length < 2) {
      return res.status(400).json({ error: 'At least 2 variants are required' });
    }

    ValidationHelpers.validateSampleSize(config.sampleSize);
    ValidationHelpers.validateBudget(config.budget);
    ValidationHelpers.validateConfidenceLevel(config.confidenceLevel);

    // Validate variants
    config.variants.forEach((variant: any) => {
      ValidationHelpers.validateProviderConfig(variant.provider, variant.model);
    });

    const experimentData = {
      name,
      description,
      organization_id: organizationId,
      status: ExperimentStatus.DRAFT,
      config,
      created_by: userId,
      metadata: {
        createdBy: userId,
        totalCost: 0,
        completedTrials: 0
      }
    };

    const { data, error } = await supabase
      .from('experiments')
      .insert(experimentData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ experiment: data });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create experiment' 
    });
  }
};

// Update experiment status
export const updateExperimentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!Object.values(ExperimentStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid experiment status' });
    }

    // Get current experiment
    const { data: currentExperiment, error: fetchError } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!currentExperiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Validate status transitions
    const validTransitions = {
      [ExperimentStatus.DRAFT]: [ExperimentStatus.SCHEDULED, ExperimentStatus.RUNNING],
      [ExperimentStatus.SCHEDULED]: [ExperimentStatus.RUNNING, ExperimentStatus.CANCELLED],
      [ExperimentStatus.RUNNING]: [ExperimentStatus.PAUSED, ExperimentStatus.COMPLETED, ExperimentStatus.FAILED],
      [ExperimentStatus.PAUSED]: [ExperimentStatus.RUNNING, ExperimentStatus.CANCELLED],
      [ExperimentStatus.COMPLETED]: [],
      [ExperimentStatus.FAILED]: [],
      [ExperimentStatus.CANCELLED]: []
    };

    const currentStatus = currentExperiment.status;
    const allowedTransitions = validTransitions[currentStatus as ExperimentStatus];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${currentStatus} to ${status}` 
      });
    }

    // Update experiment status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add timestamps for specific status changes
    if (status === ExperimentStatus.RUNNING) {
      updateData.started_at = new Date().toISOString();
    } else if (status === ExperimentStatus.COMPLETED || status === ExperimentStatus.FAILED) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('experiments')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create audit log entry
    await supabase.from('experiment_audit_logs').insert({
      experiment_id: id,
      user_id: userId,
      action: 'STATUS_CHANGE',
      details: {
        from_status: currentStatus,
        to_status: status,
        timestamp: new Date().toISOString()
      }
    });

    // If starting the experiment, trigger the orchestrator
    if (status === ExperimentStatus.RUNNING) {
      try {
        await experiments.experimentManager.startExperiment(id);
      } catch (orchestratorError) {
        console.error('Error starting experiment orchestration:', orchestratorError);
        // Don't fail the status update if orchestration fails
      }
    }

    res.json({ experiment: data });
  } catch (error) {
    console.error('Error updating experiment status:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update experiment status' 
    });
  }
};

// Get experiment runs
export const getExperimentRuns = async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID is required' });
    }

    const { data, error } = await supabase
      .from('experiment_runs')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ runs: data });
  } catch (error) {
    console.error('Error fetching experiment runs:', error);
    res.status(500).json({ error: 'Failed to fetch experiment runs' });
  }
};

// Get experiment trials
export const getExperimentTrials = async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const organizationId = req.user?.organizationId;
    const { limit = 100, offset = 0, variantId } = req.query;

    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID is required' });
    }

    let query = supabase
      .from('trials')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ trials: data });
  } catch (error) {
    console.error('Error fetching experiment trials:', error);
    res.status(500).json({ error: 'Failed to fetch experiment trials' });
  }
};

// Get experiment evaluations
export const getExperimentEvaluations = async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const organizationId = req.user?.organizationId;
    const { limit = 100, offset = 0 } = req.query;

    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID is required' });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({ evaluations: data });
  } catch (error) {
    console.error('Error fetching experiment evaluations:', error);
    res.status(500).json({ error: 'Failed to fetch experiment evaluations' });
  }
};

// Get experiment statistics
export const getExperimentStatistics = async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID is required' });
    }

    // Get experiment data
    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', experimentId)
      .eq('organization_id', organizationId)
      .single();

    if (expError) {
      throw expError;
    }

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Get trial statistics
    const { data: trials, error: trialError } = await supabase
      .from('trials')
      .select('*')
      .eq('experiment_id', experimentId);

    if (trialError) {
      throw trialError;
    }

    // Get evaluation statistics
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('experiment_id', experimentId);

    if (evalError) {
      throw evalError;
    }

    // Calculate statistics
    const statistics = await experiments.statistics.generateReport({
      experiment,
      trials: trials || [],
      evaluations: evaluations || []
    });

    res.json({ statistics });
  } catch (error) {
    console.error('Error fetching experiment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch experiment statistics' });
  }
};

// Delete experiment
export const deleteExperiment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if experiment exists and belongs to organization
    const { data: experiment, error: fetchError } = await supabase
      .from('experiments')
      .select('id, status')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Cannot delete running experiments
    if (experiment.status === ExperimentStatus.RUNNING) {
      return res.status(400).json({ error: 'Cannot delete running experiments' });
    }

    // Delete experiment (cascade will handle related data)
    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    // Create audit log entry
    await supabase.from('experiment_audit_logs').insert({
      experiment_id: id,
      user_id: userId,
      action: 'DELETE',
      details: {
        timestamp: new Date().toISOString()
      }
    });

    res.json({ message: 'Experiment deleted successfully' });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    res.status(500).json({ error: 'Failed to delete experiment' });
  }
};

export default {
  getExperiments,
  getExperiment,
  createExperiment,
  updateExperimentStatus,
  getExperimentRuns,
  getExperimentTrials,
  getExperimentEvaluations,
  getExperimentStatistics,
  deleteExperiment
};