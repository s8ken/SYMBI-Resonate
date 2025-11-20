import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { experimentsRouter } from './api/experiments';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hxmwyvkzunsinubwzrhy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bXd5dmt6dW5zaW51Ynd6cmh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYyNjU0MiwiZXhwIjoyMDc5MjAyNTQyfQ.WWoub--1SVXTLYKlaR7kNqLOTTjbAzTZblfiEcMW94Q';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/experiments', experimentsRouter);

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