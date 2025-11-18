import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env'

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)

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
