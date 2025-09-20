-- Enable the uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  content TEXT NOT NULL,
  messages_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'analyzed', 'failed')),
  sentiment TEXT DEFAULT 'pending' CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_sentiment ON conversations(sentiment);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_search ON conversations USING gin(to_tsvector('english', title || ' ' || model));

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create a function to get conversation statistics
CREATE OR REPLACE FUNCTION get_conversation_stats()
RETURNS TABLE (
  total_conversations BIGINT,
  analyzed_conversations BIGINT,
  processing_conversations BIGINT,
  failed_conversations BIGINT,
  positive_sentiment BIGINT,
  negative_sentiment BIGINT,
  neutral_sentiment BIGINT,
  mixed_sentiment BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE status = 'analyzed') as analyzed_conversations,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_conversations,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_conversations,
    COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_sentiment,
    COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_sentiment,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_sentiment,
    COUNT(*) FILTER (WHERE sentiment = 'mixed') as mixed_sentiment
  FROM conversations
  WHERE (auth.uid() = user_id OR user_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;