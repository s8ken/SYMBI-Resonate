import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Conversation {
  id: string
  title: string
  model: string
  content: string
  messages_count: number
  status: 'processing' | 'analyzed' | 'failed'
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' | 'pending'
  created_at: string
  updated_at: string
  user_id?: string
}

export interface ConversationInsert {
  title: string
  model: string
  content: string
  messages_count?: number
  status?: 'processing' | 'analyzed' | 'failed'
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed' | 'pending'
  user_id?: string
}

export interface ConversationUpdate {
  title?: string
  model?: string
  content?: string
  messages_count?: number
  status?: 'processing' | 'analyzed' | 'failed'
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed' | 'pending'
}