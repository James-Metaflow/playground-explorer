import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      playgrounds: {
        Row: {
          id: string
          name: string
          location: string
          description: string | null
          age_range: string | null
          accessibility: string | null
          opening_hours: string | null
          equipment: string[] | null
          facilities: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          description?: string | null
          age_range?: string | null
          accessibility?: string | null
          opening_hours?: string | null
          equipment?: string[] | null
          facilities?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          description?: string | null
          age_range?: string | null
          accessibility?: string | null
          opening_hours?: string | null
          equipment?: string[] | null
          facilities?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}