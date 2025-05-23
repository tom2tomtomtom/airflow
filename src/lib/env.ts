import { z } from 'zod';

// Define the schema for our environment variables
const envSchema = z.object({
  // Public environment variables (accessible in browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().describe('Supabase project URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).describe('Supabase anonymous key'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000').describe('API base URL'),
  
  // Server-only environment variables
  SUPABASE_SERVICE_KEY: z.string().min(1).optional().describe('Supabase service role key - only for scripts'),
  JWT_SECRET: z.string().min(32).describe('JWT secret for token signing - minimum 32 characters'),
  JWT_EXPIRY: z.string().default('7d').describe('JWT token expiry duration'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d').describe('Refresh token expiry duration'),
  
  // AI Services
  OPENAI_API_KEY: z.string().startsWith('sk-').describe('OpenAI API key'),
  ELEVENLABS_API_KEY: z.string().min(1).describe('ElevenLabs API key'),
  
  // Optional services
  CREATOMATE_API_KEY: z.string().min(1).optional().describe('Creatomate API key for video rendering'),
  
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
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`   ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Please check your .env file against .env.example');
      process.exit(1);
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

// Helper to check if email is configured
export const isEmailConfigured = Boolean(
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS
);
