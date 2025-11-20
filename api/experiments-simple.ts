import express from 'express';
import { supabase } from '../server-simple';

export const experimentsRouter = express.Router();

// Get all organizations (for testing)
experimentsRouter.get('/organizations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error fetching organizations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create organization (for testing)
experimentsRouter.post('/organizations', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        metadata: description ? { description } : {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Unexpected error creating organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all experiments
experimentsRouter.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiments:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error fetching experiments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific experiment
experimentsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching experiment:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error fetching experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new experiment
experimentsRouter.post('/', async (req, res) => {
  try {
    const { name, description, organizationId, config } = req.body;

    if (!name || !organizationId) {
      return res.status(400).json({ error: 'Name and organizationId are required' });
    }

    const { data, error } = await supabase
      .from('experiments')
      .insert([{
        name,
        description,
        organization_id: organizationId,
        config: config || {},
        status: 'DRAFT'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating experiment:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Unexpected error creating experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update experiment status
experimentsRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('experiments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating experiment status:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error updating experiment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get experiment runs
experimentsRouter.get('/:id/runs', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('experiment_runs')
      .select('*')
      .eq('experiment_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiment runs:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error fetching experiment runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create experiment run
experimentsRouter.post('/:id/runs', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('experiment_runs')
      .insert([{
        experiment_id: id,
        status: 'SCHEDULED'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating experiment run:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Unexpected error creating experiment run:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trials for experiment
experimentsRouter.get('/:id/trials', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('trials')
      .select('*')
      .eq('experiment_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trials:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error fetching trials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create trial for experiment
experimentsRouter.post('/:id/trials', async (req, res) => {
  try {
    const { id } = req.params;
    const { run_id, variant_id, slot_id, input, output } = req.body;

    if (!run_id || !variant_id || slot_id === undefined) {
      return res.status(400).json({ error: 'run_id, variant_id, and slot_id are required' });
    }

    const { data, error } = await supabase
      .from('trials')
      .insert([{
        experiment_id: id,
        run_id,
        variant_id,
        slot_id,
        input: input || {},
        output: output || {},
        integrity_hash: 'temp-hash-' + Date.now()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating trial:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Unexpected error creating trial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get evaluations for experiment
experimentsRouter.get('/:id/evaluations', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('experiment_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error fetching evaluations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create evaluation for experiment
experimentsRouter.post('/:id/evaluations', async (req, res) => {
  try {
    const { id } = req.params;
    const { trial_id, evaluator_agent_id, scores, dimensions, feedback, confidence } = req.body;

    if (!trial_id || !evaluator_agent_id) {
      return res.status(400).json({ error: 'Trial ID and evaluator agent ID are required' });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert([{
        experiment_id: id,
        trial_id,
        evaluator_agent_id,
        scores: scores || {},
        dimensions: dimensions || {},
        feedback,
        confidence: confidence || 1.0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating evaluation:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Unexpected error creating evaluation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});