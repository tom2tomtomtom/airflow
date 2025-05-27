// types/index.ts
// Central export file for all types

// Export from supabase types
export * from './supabase';

// Export from api types
export * from './api';

// Re-export from src/types if they exist
export * from '../src/types/models';
export * from '../src/types/database';
export * from '../src/types/auth';

// Common types that might be needed
export interface Campaign {
  id: string;
  name: string;
  client_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  budget: number | {
    total: number;
    spent: number;
    currency: string;
  };
  schedule?: {
    start_date: string;
    end_date: string;
  };
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'text' | 'graphics' | 'copy';
  url: string;
  thumbnail_url?: string;
  client_id: string;
  metadata?: Record<string, any>;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Matrix {
  id: string;
  name: string;
  client_id: string;
  template_id?: string;
  structure: any;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspect_ratio: string;
  structure: any;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FieldValue {
  fieldId: string;
  variationId: string;
  value?: string;
  assetId?: string;
  asset?: Asset;
}

export interface ExecutionTask {
  id: string;
  campaignId: string;
  campaignName: string;
  platforms: string[];
  scheduledDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    platform: string;
    status: string;
  }>;
}

export interface UICampaign extends Campaign {
  // UI-specific properties
  isEditing?: boolean;
  isLoading?: boolean;
}
