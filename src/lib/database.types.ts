export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          client_code: string | null
          created_at: string | null
          domain: string | null
          id: string
          name: string
        }
        Insert: {
          client_code?: string | null
          created_at?: string | null
          domain?: string | null
          id: string
          name: string
        }
        Update: {
          client_code?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          client_id: string
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          linkedin_url: string | null
          name: string
          signal_id: string | null
          title: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          name: string
          signal_id?: string | null
          title?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          name?: string
          signal_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      icp_configs: {
        Row: {
          client_id: string
          client_name: string
          config: Json
          created_at: string | null
          domain: string | null
          id: string
          locked_at: string | null
          status: string
          updated_at: string | null
          version: number
        }
        Insert: {
          client_id: string
          client_name: string
          config?: Json
          created_at?: string | null
          domain?: string | null
          id?: string
          locked_at?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          client_id?: string
          client_name?: string
          config?: Json
          created_at?: string | null
          domain?: string | null
          id?: string
          locked_at?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      scan_runs: {
        Row: {
          approved_by: string | null
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          run_date: string
          signals_decayed: number | null
          signals_found: number | null
          signals_new: number | null
          signals_refreshed: number | null
          status: string
          triggered_by: string
        }
        Insert: {
          approved_by?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          run_date?: string
          signals_decayed?: number | null
          signals_found?: number | null
          signals_new?: number | null
          signals_refreshed?: number | null
          status?: string
          triggered_by?: string
        }
        Update: {
          approved_by?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          run_date?: string
          signals_decayed?: number | null
          signals_found?: number | null
          signals_new?: number | null
          signals_refreshed?: number | null
          status?: string
          triggered_by?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          archetype: string
          archetype_tier: string
          boost_flags: string[] | null
          client_id: string
          company: string
          company_domain: string | null
          company_domain_source: string | null
          created_at: string | null
          current_confidence: number
          decay_rate: number
          enriched_status: boolean | null
          expansion_flag: boolean | null
          first_seen: string
          id: string
          initial_confidence: number
          last_decay_applied: string | null
          last_seen: string
          next_step: string | null
          notes: string | null
          outreach_angle: string | null
          priority_tier: string | null
          scan_count: number
          signal_id: string
          source_url: string | null
          status: string
          summary: string | null
          surfaced: boolean | null
          surfaced_at: string | null
          target_persona: string | null
          title: string
          updated_at: string | null
          why_now: string | null
        }
        Insert: {
          archetype: string
          archetype_tier: string
          boost_flags?: string[] | null
          client_id: string
          company: string
          company_domain?: string | null
          company_domain_source?: string | null
          created_at?: string | null
          current_confidence: number
          decay_rate?: number
          enriched_status?: boolean | null
          expansion_flag?: boolean | null
          first_seen: string
          id?: string
          initial_confidence: number
          last_decay_applied?: string | null
          last_seen: string
          next_step?: string | null
          notes?: string | null
          outreach_angle?: string | null
          priority_tier?: string | null
          scan_count?: number
          signal_id: string
          source_url?: string | null
          status?: string
          summary?: string | null
          surfaced?: boolean | null
          surfaced_at?: string | null
          target_persona?: string | null
          title: string
          updated_at?: string | null
          why_now?: string | null
        }
        Update: {
          archetype?: string
          archetype_tier?: string
          boost_flags?: string[] | null
          client_id?: string
          company?: string
          company_domain?: string | null
          company_domain_source?: string | null
          created_at?: string | null
          current_confidence?: number
          decay_rate?: number
          enriched_status?: boolean | null
          expansion_flag?: boolean | null
          first_seen?: string
          id?: string
          initial_confidence?: number
          last_decay_applied?: string | null
          last_seen?: string
          next_step?: string | null
          notes?: string | null
          outreach_angle?: string | null
          priority_tier?: string | null
          scan_count?: number
          signal_id?: string
          source_url?: string | null
          status?: string
          summary?: string | null
          surfaced?: boolean | null
          surfaced_at?: string | null
          target_persona?: string | null
          title?: string
          updated_at?: string | null
          why_now?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          segment_count: number
          signal_cap: number
          started_at: string
          status: string
          tier: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          segment_count: number
          signal_cap: number
          started_at: string
          status?: string
          tier: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          segment_count?: number
          signal_cap?: number
          started_at?: string
          status?: string
          tier?: string
        }
        Relationships: []
      }
      user_clients: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      approach_windows: {
        Row: {
          approach_urgency: string | null
          archetype_tier: string | null
          client_id: string | null
          company: string | null
          current_confidence: number | null
          days_until_expired: number | null
          days_until_stale: number | null
          decay_rate: number | null
          last_seen: string | null
          optimal_outreach_date: string | null
          priority_tier: string | null
          signal_id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          approach_urgency?: never
          archetype_tier?: string | null
          client_id?: string | null
          company?: string | null
          current_confidence?: number | null
          days_until_expired?: never
          days_until_stale?: never
          decay_rate?: number | null
          last_seen?: string | null
          optimal_outreach_date?: never
          priority_tier?: string | null
          signal_id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          approach_urgency?: never
          archetype_tier?: string | null
          client_id?: string | null
          company?: string | null
          current_confidence?: number | null
          days_until_expired?: never
          days_until_stale?: never
          decay_rate?: number | null
          last_seen?: string | null
          optimal_outreach_date?: never
          priority_tier?: string | null
          signal_id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_signal_decay: {
        Args: never
        Returns: {
          client_id: string
          new_confidence: number
          new_status: string
          old_confidence: number
          old_status: string
          signal_id: string
          weeks_since_seen: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
