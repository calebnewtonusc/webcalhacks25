import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      connections: {
        Row: {
          id: string
          name: string
          avatar?: string
          relationship: 'family' | 'friend' | 'colleague' | 'mentor' | 'acquaintance'
          health_score: number
          last_contact: string
          contact_frequency: number
          phone?: string
          email?: string
          notes: string
          tags: string[]
          position_x?: number
          position_y?: number
          cluster?: string
          category?: string
          subcategory?: string
          communication_style?: 'text' | 'call' | 'email' | 'in-person'
          proximity?: 'same-city' | 'long-distance' | 'international'
          energy_level?: number
          shared_interests?: string[]
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          avatar?: string
          relationship: 'family' | 'friend' | 'colleague' | 'mentor' | 'acquaintance'
          health_score?: number
          last_contact?: string
          contact_frequency?: number
          phone?: string
          email?: string
          notes?: string
          tags?: string[]
          position_x?: number
          position_y?: number
          cluster?: string
          category?: string
          subcategory?: string
          communication_style?: 'text' | 'call' | 'email' | 'in-person'
          proximity?: 'same-city' | 'long-distance' | 'international'
          energy_level?: number
          shared_interests?: string[]
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string
          relationship?: 'family' | 'friend' | 'colleague' | 'mentor' | 'acquaintance'
          health_score?: number
          last_contact?: string
          contact_frequency?: number
          phone?: string
          email?: string
          notes?: string
          tags?: string[]
          position_x?: number
          position_y?: number
          cluster?: string
          category?: string
          subcategory?: string
          communication_style?: 'text' | 'call' | 'email' | 'in-person'
          proximity?: 'same-city' | 'long-distance' | 'international'
          energy_level?: number
          shared_interests?: string[]
          user_id?: string
        }
      }
      interactions: {
        Row: {
          id: string
          connection_id: string
          type: 'call' | 'text' | 'email' | 'meeting' | 'social'
          date: string
          notes?: string
          duration?: number
          quality?: number
          topics?: string[]
          mood?: 'great' | 'good' | 'neutral' | 'difficult'
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          connection_id: string
          type: 'call' | 'text' | 'email' | 'meeting' | 'social'
          date?: string
          notes?: string
          duration?: number
          quality?: number
          topics?: string[]
          mood?: 'great' | 'good' | 'neutral' | 'difficult'
          user_id?: string
        }
        Update: {
          id?: string
          connection_id?: string
          type?: 'call' | 'text' | 'email' | 'meeting' | 'social'
          date?: string
          notes?: string
          duration?: number
          quality?: number
          topics?: string[]
          mood?: 'great' | 'good' | 'neutral' | 'difficult'
          user_id?: string
        }
      }
      silk_memories: {
        Row: {
          id: string
          connection_id: string
          type: 'conversation' | 'interest' | 'life_event' | 'preference' | 'goal' | 'pattern'
          content: string
          timestamp: string
          importance: number
          tags: string[]
          context?: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          connection_id: string
          type: 'conversation' | 'interest' | 'life_event' | 'preference' | 'goal' | 'pattern'
          content: string
          timestamp?: string
          importance?: number
          tags?: string[]
          context?: string
          user_id?: string
        }
        Update: {
          id?: string
          connection_id?: string
          type?: 'conversation' | 'interest' | 'life_event' | 'preference' | 'goal' | 'pattern'
          content?: string
          timestamp?: string
          importance?: number
          tags?: string[]
          context?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}