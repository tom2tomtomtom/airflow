import { z } from 'zod';

// Simple environment detection
const isClient = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// Environment schema with clear validation rules
const envSchema = z.object({
  // Core Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key required').optional(),

  // API configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default(isProd ? 'https://api.airflow.app' : 'http://localhost:3000'),
  NEXT_PUBLIC_DEMO_MODE: z.enum(['true', 'false']).default('false'),

  // Security
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  JWT_EXPIRY: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),

  // AI Services (optional)
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Invalid OpenAI API key').optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  RUNWAY_API_KEY: z.string().optional(),
  CREATOMATE_API_KEY: z.string().optional(),

  // Storage
  STORAGE_BUCKET: z.string().default('airflow-assets'),
  MAX_FILE_SIZE: z.coerce.number().default(52428800), // 50MB

  // Cache
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Database
  DB_POOL_SIZE: z.coerce.number().default(10),
  DB_TIMEOUT: z.coerce.number().default(5000),

  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Feature flags
  ENABLE_AI_FEATURES: z.enum(['true', 'false']).default('false'),
  ENABLE_VIDEO_GENERATION: z.enum(['true', 'false']).default('false'),
  ENABLE_SOCIAL_PUBLISHING: z.enum(['true', 'false']).default('false'),
});

// Parse environment with proper error handling  
function parseEnvironment(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = ['Environment validation failed:'];
      error.errors.forEach(err => {
        errorMessage.push(`  ${err.path.join('.')}: ${err.message}`);
      });

      if (isProd) {
        throw new Error(errorMessage.join('\n'));
      } else {
        console.warn(errorMessage.join('\n'));
        console.warn('Using fallback configuration for development...\n');

        // Return safe defaults for development
        return {
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
          NEXT_PUBLIC_API_URL: 'http://localhost:3000',
          NEXT_PUBLIC_DEMO_MODE: 'true' as const,
          JWT_EXPIRY: '7d',
          REFRESH_TOKEN_EXPIRY: '30d',
          STORAGE_BUCKET: 'airflow-assets',
          MAX_FILE_SIZE: 52428800,
          REDIS_URL: process.env.REDIS_URL,
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
          DB_POOL_SIZE: 10,
          DB_TIMEOUT: 5000,
          NODE_ENV: 'development' as const,
          ENABLE_AI_FEATURES: 'false' as const,
          ENABLE_VIDEO_GENERATION: 'false' as const,
          ENABLE_SOCIAL_PUBLISHING: 'false' as const,
        } as z.infer<typeof envSchema>;
      }
    }
    throw error;
  }
}

// Export validated environment
export const env = parseEnvironment() as z.infer<typeof envSchema>;

// Type exports
export type Env = z.infer<typeof envSchema>;

// Environment helpers
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isDemo = env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Feature availability checks
export const hasOpenAI = Boolean(env.OPENAI_API_KEY) && env.ENABLE_AI_FEATURES === 'true';
export const hasElevenLabs = Boolean(env.ELEVENLABS_API_KEY) && env.ENABLE_AI_FEATURES === 'true';
export const hasRunway = Boolean(env.RUNWAY_API_KEY) && env.ENABLE_AI_FEATURES === 'true';
export const hasCreatomate =
  Boolean(env.CREATOMATE_API_KEY) && env.ENABLE_VIDEO_GENERATION === 'true';

// CORS configuration
export const getAllowedOrigins = (): string[] => {
  const defaults = isProduction
    ? ['https://app.airflow.com', 'https://airflow.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  return defaults;
};

// Security headers
export const getSecurityHeaders = () => ({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(isProduction && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
});
