import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { experimentsRouter } from './api/experiments-simple.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client (service role required; fail fast if missing)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use experiments router
app.use('/api/experiments', experimentsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 SYMBI Resonate API Server running on port ${PORT}`);
  console.log(`📊 Experiments API: http://localhost:${PORT}/api/experiments`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;