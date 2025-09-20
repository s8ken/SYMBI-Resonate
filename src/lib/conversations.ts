import { supabase } from './supabase'
import type { Conversation, ConversationInsert, ConversationUpdate } from './supabase'

export class ConversationsService {
  // Get all conversations
  static async getConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }

    return data || []
  }

  // Create a new conversation
  static async createConversation(conversation: ConversationInsert): Promise<Conversation> {
    // Count messages in content
    const messagesCount = conversation.content
      ? conversation.content.split('\n').filter(line => line.trim()).length
      : 0

    const conversationData = {
      ...conversation,
      messages_count: messagesCount,
      status: 'processing' as const,
      sentiment: 'pending' as const
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      throw error
    }

    return data
  }

  // Update a conversation
  static async updateConversation(id: string, updates: ConversationUpdate): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating conversation:', error)
      throw error
    }

    return data
  }

  // Delete a conversation
  static async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }

  // Search conversations
  static async searchConversations(searchTerm: string, statusFilter?: string): Promise<Conversation[]> {
    let query = supabase
      .from('conversations')
      .select('*')

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error searching conversations:', error)
      throw error
    }

    return data || []
  }

  // Subscribe to real-time changes
  static subscribeToConversations(callback: (payload: any) => void) {
    return supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        callback
      )
      .subscribe()
  }

  // Simulate conversation analysis (in real app, this would be done by backend)
  static async analyzeConversation(id: string): Promise<void> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Random sentiment for demo
    const sentiments: Array<'positive' | 'negative' | 'neutral' | 'mixed'> = ['positive', 'negative', 'neutral', 'mixed']
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)]

    await this.updateConversation(id, {
      status: 'analyzed',
      sentiment: randomSentiment
    })
  }
}