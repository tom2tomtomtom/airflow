// Generated from Supabase schema
// This file contains all database types for AIrFLOW

export interface Database {
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string;
          campaign_id: string;
          variation_id: string | null;
          metrics: Record<string, unknown> | null;
          insights: Record<string, unknown> | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          variation_id?: string | null;
          metrics?: Record<string, unknown> | null;
          insights?: Record<string, unknown> | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          variation_id?: string | null;
          metrics?: Record<string, unknown> | null;
          insights?: Record<string, unknown> | null;
          created_at?: string | null;
        };
      };
      approval_comments: {
        Row: {
          id: string;
          workflow_id: string | null;
          asset_id: string | null;
          comment: string;
          comment_type: string | null;
          position_data: Record<string, unknown> | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          workflow_id?: string | null;
          asset_id?: string | null;
          comment: string;
          comment_type?: string | null;
          position_data?: Record<string, unknown> | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          workflow_id?: string | null;
          asset_id?: string | null;
          comment?: string;
          comment_type?: string | null;
          position_data?: Record<string, unknown> | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      approval_workflows: {
        Row: {
          id: string;
          execution_id: string | null;
          client_id: string | null;
          status: string | null;
          submitted_at: string | null;
          submitted_by: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          approved_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          execution_id?: string | null;
          client_id?: string | null;
          status?: string | null;
          submitted_at?: string | null;
          submitted_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          execution_id?: string | null;
          client_id?: string | null;
          status?: string | null;
          submitted_at?: string | null;
          submitted_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      approvals: {
        Row: {
          id: string;
          execution_id: string | null;
          user_id: string | null;
          action: string;
          comment: string | null;
          version: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          execution_id?: string | null;
          user_id?: string | null;
          action: string;
          comment?: string | null;
          version?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          execution_id?: string | null;
          user_id?: string | null;
          action?: string;
          comment?: string | null;
          version?: number | null;
          created_at?: string | null;
        };
      };
      assets: {
        Row: {
          id: string;
          name: string;
          type: string;
          url: string;
          thumbnail_url: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          tags: string[] | null;
          metadata: Record<string, unknown> | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          url: string;
          thumbnail_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          tags?: string[] | null;
          metadata?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          url?: string;
          thumbnail_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          tags?: string[] | null;
          metadata?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      briefs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          document_url: string | null;
          document_type: string | null;
          raw_content: string | null;
          parsing_status: string | null;
          parsed_at: string | null;
          objectives: Record<string, unknown> | null;
          target_audience: string | null;
          key_messaging: Record<string, unknown> | null;
          brand_guidelines: Record<string, unknown> | null;
          platforms: string[] | null;
          budget: number | null;
          timeline: Record<string, unknown> | null;
          confidence_scores: Record<string, unknown> | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          document_url?: string | null;
          document_type?: string | null;
          raw_content?: string | null;
          parsing_status?: string | null;
          parsed_at?: string | null;
          objectives?: Record<string, unknown> | null;
          target_audience?: string | null;
          key_messaging?: Record<string, unknown> | null;
          brand_guidelines?: Record<string, unknown> | null;
          platforms?: string[] | null;
          budget?: number | null;
          timeline?: Record<string, unknown> | null;
          confidence_scores?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          document_url?: string | null;
          document_type?: string | null;
          raw_content?: string | null;
          parsing_status?: string | null;
          parsed_at?: string | null;
          objectives?: Record<string, unknown> | null;
          target_audience?: string | null;
          key_messaging?: Record<string, unknown> | null;
          brand_guidelines?: Record<string, unknown> | null;
          platforms?: string[] | null;
          budget?: number | null;
          timeline?: Record<string, unknown> | null;
          confidence_scores?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      campaign_analytics: {
        Row: {
          id: string;
          execution_id: string | null;
          platform: string;
          date: string;
          hour: number | null;
          impressions: number | null;
          clicks: number | null;
          conversions: number | null;
          spend: number | null;
          ctr: number | null;
          cpc: number | null;
          cpm: number | null;
          roas: number | null;
          raw_data: Record<string, unknown> | null;
          client_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          execution_id?: string | null;
          platform: string;
          date: string;
          hour?: number | null;
          impressions?: number | null;
          clicks?: number | null;
          conversions?: number | null;
          spend?: number | null;
          ctr?: number | null;
          cpc?: number | null;
          cpm?: number | null;
          roas?: number | null;
          raw_data?: Record<string, unknown> | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          execution_id?: string | null;
          platform?: string;
          date?: string;
          hour?: number | null;
          impressions?: number | null;
          clicks?: number | null;
          conversions?: number | null;
          spend?: number | null;
          ctr?: number | null;
          cpc?: number | null;
          cpm?: number | null;
          roas?: number | null;
          raw_data?: Record<string, unknown> | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          industry: string | null;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          website: string | null;
          social_media: Record<string, unknown> | null;
          brand_guidelines: Record<string, unknown> | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          website?: string | null;
          social_media?: Record<string, unknown> | null;
          brand_guidelines?: Record<string, unknown> | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          website?: string | null;
          social_media?: Record<string, unknown> | null;
          brand_guidelines?: Record<string, unknown> | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      client_contacts: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          is_primary: boolean;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          is_primary?: boolean;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          is_primary?: boolean;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      content_variations: {
        Row: {
          id: string;
          content: string;
          content_type: string;
          platform: string | null;
          tone: string | null;
          style: string | null;
          brief_id: string | null;
          motivation_ids: string[] | null;
          generation_prompt: string | null;
          performance_score: number | null;
          brand_compliance_score: number | null;
          compliance_notes: Record<string, unknown> | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          content_type: string;
          platform?: string | null;
          tone?: string | null;
          style?: string | null;
          brief_id?: string | null;
          motivation_ids?: string[] | null;
          generation_prompt?: string | null;
          performance_score?: number | null;
          brand_compliance_score?: number | null;
          compliance_notes?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          content_type?: string;
          platform?: string | null;
          tone?: string | null;
          style?: string | null;
          brief_id?: string | null;
          motivation_ids?: string[] | null;
          generation_prompt?: string | null;
          performance_score?: number | null;
          brand_compliance_score?: number | null;
          compliance_notes?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      copy_assets: {
        Row: {
          id: string;
          content: string | null;
          type: string | null;
          tags: string[] | null;
          metadata: Record<string, unknown> | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          content?: string | null;
          type?: string | null;
          tags?: string[] | null;
          metadata?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          content?: string | null;
          type?: string | null;
          tags?: string[] | null;
          metadata?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      copy_texts: {
        Row: {
          id: string;
          type: string;
          content: string;
          metadata: Record<string, unknown> | null;
          tags: string[] | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          content: string;
          metadata?: Record<string, unknown> | null;
          tags?: string[] | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          content?: string;
          metadata?: Record<string, unknown> | null;
          tags?: string[] | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      executions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string;
          matrix_id: string | null;
          output_url: string | null;
          metadata: Record<string, unknown> | null;
          client_id: string | null;
          created_by: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status: string;
          matrix_id?: string | null;
          output_url?: string | null;
          metadata?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          matrix_id?: string | null;
          output_url?: string | null;
          metadata?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      generated_content: {
        Row: {
          id: string;
          selected_motivation_id: string | null;
          content: Record<string, unknown> | null;
          content_types: string[] | null;
          tone: string | null;
          style: string | null;
          user_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          selected_motivation_id?: string | null;
          content?: Record<string, unknown> | null;
          content_types?: string[] | null;
          tone?: string | null;
          style?: string | null;
          user_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          selected_motivation_id?: string | null;
          content?: Record<string, unknown> | null;
          content_types?: string[] | null;
          tone?: string | null;
          style?: string | null;
          user_id?: string | null;
          created_at?: string | null;
        };
      };
      matrices: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          structure: Record<string, unknown>;
          template_id: string | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          structure: Record<string, unknown>;
          template_id?: string | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          structure?: Record<string, unknown>;
          template_id?: string | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      motivations: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          brief_id: string | null;
          relevance_score: number | null;
          is_ai_generated: boolean | null;
          generation_context: Record<string, unknown> | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          brief_id?: string | null;
          relevance_score?: number | null;
          is_ai_generated?: boolean | null;
          generation_context?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          brief_id?: string | null;
          relevance_score?: number | null;
          is_ai_generated?: boolean | null;
          generation_context?: Record<string, unknown> | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      platform_integrations: {
        Row: {
          id: string;
          platform: string;
          account_id: string | null;
          account_name: string | null;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          permissions: Record<string, unknown> | null;
          status: string | null;
          last_sync_at: string | null;
          client_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          platform: string;
          account_id?: string | null;
          account_name?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          permissions?: Record<string, unknown> | null;
          status?: string | null;
          last_sync_at?: string | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          platform?: string;
          account_id?: string | null;
          account_name?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          permissions?: Record<string, unknown> | null;
          status?: string | null;
          last_sync_at?: string | null;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: string;
          permissions: Record<string, unknown> | null;
          preferences: Record<string, unknown> | null;
          metadata: Record<string, unknown> | null;
          tenant_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          permissions?: Record<string, unknown> | null;
          preferences?: Record<string, unknown> | null;
          metadata?: Record<string, unknown> | null;
          tenant_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          permissions?: Record<string, unknown> | null;
          preferences?: Record<string, unknown> | null;
          metadata?: Record<string, unknown> | null;
          tenant_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      selected_motivations: {
        Row: {
          id: string;
          strategy_id: string | null;
          selected: string[] | null;
          custom: string[] | null;
          user_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          strategy_id?: string | null;
          selected?: string[] | null;
          custom?: string[] | null;
          user_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          strategy_id?: string | null;
          selected?: string[] | null;
          custom?: string[] | null;
          user_id?: string | null;
          created_at?: string | null;
        };
      };
      strategies: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          target_audience: string | null;
          goals: Record<string, unknown> | null;
          key_messages: Record<string, unknown> | null;
          created_by: string | null;
          client_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          target_audience?: string | null;
          goals?: Record<string, unknown> | null;
          key_messages?: Record<string, unknown> | null;
          created_by?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          target_audience?: string | null;
          goals?: Record<string, unknown> | null;
          key_messages?: Record<string, unknown> | null;
          created_by?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      strategy_motivations: {
        Row: {
          id: string;
          strategy_id: string | null;
          motivation_id: string | null;
          order_position: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          strategy_id?: string | null;
          motivation_id?: string | null;
          order_position?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          strategy_id?: string | null;
          motivation_id?: string | null;
          order_position?: number | null;
          created_at?: string | null;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          aspect_ratio: string;
          platform: string;
          description: string | null;
          height: number;
          width: number;
          structure: Record<string, unknown>;
          thumbnail_url: string | null;
          created_by: string | null;
          client_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          aspect_ratio: string;
          platform: string;
          description?: string | null;
          height: number;
          width: number;
          structure: Record<string, unknown>;
          thumbnail_url?: string | null;
          created_by?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          aspect_ratio?: string;
          platform?: string;
          description?: string | null;
          height?: number;
          width?: number;
          structure?: Record<string, unknown>;
          thumbnail_url?: string | null;
          created_by?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_clients: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Convenience types
export type Analytics = Tables<'analytics'>;
export type ApprovalComment = Tables<'approval_comments'>;
export type ApprovalWorkflow = Tables<'approval_workflows'>;
export type Approval = Tables<'approvals'>;
export type Asset = Tables<'assets'>;
export type Brief = Tables<'briefs'>;
export type CampaignAnalytics = Tables<'campaign_analytics'>;
export type Client = Tables<'clients'>;
export type ClientContact = Tables<'client_contacts'>;
export type ContentVariation = Tables<'content_variations'>;
export type CopyAsset = Tables<'copy_assets'>;
export type CopyText = Tables<'copy_texts'>;
export type Execution = Tables<'executions'>;
export type GeneratedContent = Tables<'generated_content'>;
export type Matrix = Tables<'matrices'>;
export type Motivation = Tables<'motivations'>;
export type PlatformIntegration = Tables<'platform_integrations'>;
export type Profile = Tables<'profiles'>;
export type SelectedMotivation = Tables<'selected_motivations'>;
export type Strategy = Tables<'strategies'>;
export type StrategyMotivation = Tables<'strategy_motivations'>;
export type Template = Tables<'templates'>;
export type UserClient = Tables<'user_clients'>;
