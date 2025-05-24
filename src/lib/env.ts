import { z } from 'zod';

// Helper to check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Define the schema for our environment variables
const envSchema = z.object({
  // Public environment variables (accessible in browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().refine(
    (val) => isDemoMode || val,
    'Supabase URL is required in production mode'
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().refine(
    (val) => isDemoMode || val,
    'Supabase anon key is required in production mode'
  ),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000').describe('API base URL'),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  
  // Server-only environment variables - all optional for demo mode
  SUPABASE_SERVICE_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional().refine(
    (val) => isDemoMode || (val && val.length >= 32),
    'JWT secret must be at least 32 characters in production mode'
  ),
  JWT_EXPIRY: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),
  
  // AI Services - optional for demo mode
  OPENAI_API_KEY: z.string().optional().refine(
    (val) => !val || val.startsWith('sk-'),
    'OpenAI API key must start with sk-'
  ),
  ELEVENLABS_API_KEY: z.string().optional(),
  RUNWAY_API_KEY: z.string().optional(),
  CREATOMATE_API_KEY: z.string().optional(),

  // Email configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),

  // Storage
  STORAGE_BUCKET: z.string().default('airwave-assets'),
  MAX_FILE_SIZE: z.string().transform(Number).default('52428800'), // 50MB default

  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    
    // If we're in demo mode or missing critical env vars, set defaults
    if (isDemoMode) {
      console.log('🎮 Running in demo mode - some features may be limited');
      return {
        ...parsed,
        NEXT_PUBLIC_SUPABASE_URL: parsed.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key',
        JWT_SECRET: parsed.JWT_SECRET || 'demo-jwt-secret-that-is-at-least-32-characters-long',
        NEXT_PUBLIC_DEMO_MODE: 'true',
      };
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = ['❌ Invalid environment variables:'];
      error.errors.forEach((err) => {
        errorMessage.push(`   ${err.path.join('.')}: ${err.message}`);
      });
      errorMessage.push('\n💡 Please check your .env file against .env.example');
      errorMessage.push('\n🎮 Or set NEXT_PUBLIC_DEMO_MODE=true to run in demo mode');
      
      console.error(errorMessage.join('\n'));
      
      // In production, we still want to throw the error
      if (process.env.NODE_ENV === 'production' && !isDemoMode) {
        throw new Error(errorMessage.join('\n'));
      }
      
      // In development or demo mode, return safe defaults
      return {
        NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'demo-anon-key',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        NEXT_PUBLIC_DEMO_MODE: 'true',
        JWT_SECRET: 'demo-jwt-secret-that-is-at-least-32-characters-long',
        JWT_EXPIRY: '7d',
        REFRESH_TOKEN_EXPIRY: '30d',
        STORAGE_BUCKET: 'airwave-assets',
        MAX_FILE_SIZE: 52428800,
        NODE_ENV: 'development',
      } as any;
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>;

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development';

// Helper to check if we're in demo mode
export const isDemo = env.NEXT_PUBLIC_DEMO_MODE === 'true' || isDemoMode;

// Helper to check if email is configured
export const isEmailConfigured = Boolean(
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS
);

// Helper to check if AI features are available
export const hasOpenAI = Boolean(env.OPENAI_API_KEY);
export const hasElevenLabs = Boolean(env.ELEVENLABS_API_KEY);
export const hasRunway = Boolean(env.RUNWAY_API_KEY);
export const hasCreatomate = Boolean(env.CREATOMATE_API_KEY);
