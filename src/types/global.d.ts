// Global type definitions for AIRWAVE

// Extend window object
declare global {
  interface Window {
    // Add any window properties used in the app
    gtag?: (...args: unknown[]) => void;
    analytics?: unknown;
    __REDUX_DEVTOOLS_EXTENSION__?: unknown;
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY?: string;
      JWT_SECRET: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      OPENAI_API_KEY?: string;
      ELEVENLABS_API_KEY?: string;
      CREATOMATE_API_KEY?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      AWS_S3_BUCKET?: string;
      SENTRY_DSN?: string;
      SENTRY_AUTH_TOKEN?: string;
    }
  }
}

// Common types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// API types
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: number;
    duration: number;
    requestId: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

// Database types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user' | 'viewer';
  avatar_url?: string;
  is_active: boolean;
}

export interface Client extends BaseEntity {
  name: string;
  description?: string;
  industry?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface Campaign extends BaseEntity {
  client_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  budget?: number;
  goals?: Record<string, unknown>;
}

export {};
