// Environment variable validation utility
// Import this in your main app startup to fail fast on missing variables

interface RequiredEnvVars {
  // Database
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY?: string; // Optional for client-side

  // Authentication
  JWT_SECRET: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;

  // AI Services
  OPENAI_API_KEY: string;
  ELEVENLABS_API_KEY: string;

  // Other services
  CREATOMATE_API_KEY?: string;

  // App configuration
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL?: string;
}

function validateEnvVars(): RequiredEnvVars {
  const errors: string[] = [];

  // Required variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY'
  ];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate JWT_SECRET is not default
  if (process.env.JWT_SECRET === 'default_secret_key_change_in_production') {
    errors.push('JWT_SECRET cannot be the default value in production');
  }

  // Validate URLs
  if (process.env.SUPABASE_URL && !isValidUrl(process.env.SUPABASE_URL)) {
    errors.push('SUPABASE_URL must be a valid URL');
  }

  if (process.env.NEXT_PUBLIC_APP_URL && !isValidUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    errors.push('NEXT_PUBLIC_APP_URL must be a valid URL');
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      errors.push('NEXT_PUBLIC_APP_URL is required in production');
    }
  }

  if (errors.length > 0) {
    console.error('Environment variable validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Missing or invalid environment variables. Check the errors above.`);
  }

  return process.env as RequiredEnvVars;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Export the validated environment variables
export const env = validateEnvVars();

export default env;