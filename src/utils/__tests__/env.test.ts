import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateEnv, getEnvVar, checkProductionReadiness, getValidatedEnv, logEnvironmentStatus } from '../env';

describe('env utilities', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should validate a complete valid environment', () => {
      const validEnv = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        JWT_SECRET: 'a'.repeat(32), // 32 character secret
        JWT_EXPIRY: '7d',
        REFRESH_TOKEN_EXPIRY: '30d',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      const result = validateEnv(validEnv);
      expect(result.NODE_ENV).toBe('development');
      expect(result.JWT_SECRET).toBe(validEnv.JWT_SECRET);
    });

    it('should throw error for invalid NODE_ENV', () => {
      const invalidEnv = {
        NODE_ENV: 'invalid',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        JWT_SECRET: 'a'.repeat(32),
      };

      expect(() => validateEnv(invalidEnv)).toThrow('Environment validation failed');
    });

    it('should throw error for short JWT_SECRET', () => {
      const invalidEnv = {
        NODE_ENV: 'development',
        JWT_SECRET: 'too-short',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      };

      expect(() => validateEnv(invalidEnv)).toThrow('JWT_SECRET must be at least 32 characters long');
    });

    it('should validate optional fields with defaults', () => {
      const minimalEnv = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        JWT_SECRET: 'a'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      const result = validateEnv(minimalEnv);
      expect(result.STORAGE_BUCKET).toBe('airwave-assets');
      expect(result.MAX_FILE_SIZE).toBe(52428800);
      expect(result.ENABLE_AI_GENERATION).toBe(true);
    });

    it('should transform string numbers to numbers', () => {
      const envWithNumbers = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        JWT_SECRET: 'a'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
        MAX_FILE_SIZE: '104857600', // 100MB as string
        RATE_LIMIT_MAX: '100',
      };

      const result = validateEnv(envWithNumbers);
      expect(result.MAX_FILE_SIZE).toBe(104857600);
      expect(result.RATE_LIMIT_MAX).toBe(100);
    });
  });

  describe('getEnvVar', () => {
    it('should return environment variable value', () => {
      process.env.JWT_SECRET = 'test-secret';
      const value = getEnvVar('JWT_SECRET');
      expect(value).toBe('test-secret');
    });

    it('should return default value if env var not set', () => {
      delete process.env.JWT_SECRET;
      const value = getEnvVar('JWT_SECRET', 'default-secret');
      expect(value).toBe('default-secret');
    });

    it('should throw error if no value and no default', () => {
      delete process.env.JWT_SECRET;
      expect(() => getEnvVar('JWT_SECRET')).toThrow('Environment variable JWT_SECRET is required but not set');
    });
  });

  describe('checkProductionReadiness', () => {
    it('should return ready when all required vars are set', () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      const result = checkProductionReadiness();
      expect(result.isReady).toBe(true);
      expect(result.missingVars).toHaveLength(0);
    });

    it('should identify missing required variables', () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
      };

      const result = checkProductionReadiness();
      expect(result.isReady).toBe(false);
      expect(result.missingVars).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(result.missingVars).toContain('OPENAI_API_KEY');
    });

    it('should warn about short JWT_SECRET', () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'short-secret',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      const result = checkProductionReadiness();
      expect(result.warnings).toContain('JWT_SECRET should be at least 32 characters for production');
    });

    it('should warn about missing recommended variables', () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      const result = checkProductionReadiness();
      expect(result.warnings.some(w => w.includes('SENTRY_DSN'))).toBe(true);
      expect(result.warnings.some(w => w.includes('SMTP_HOST'))).toBe(true);
    });
  });

  describe('getValidatedEnv', () => {
    it('should cache validated environment', () => {
      const validEnv = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        JWT_SECRET: 'a'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      process.env = { ...process.env, ...validEnv };

      const result1 = getValidatedEnv();
      const result2 = getValidatedEnv();
      
      // Should return the same cached object
      expect(result1).toBe(result2);
    });
  });

  describe('logEnvironmentStatus', () => {
    it('should log success for valid environment', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      process.env = {
        ...process.env,
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        JWT_SECRET: 'a'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_KEY: 'test-service-key',
        OPENAI_API_KEY: 'sk-test-key',
        ELEVENLABS_API_KEY: 'elevenlabs-test-key',
      };

      logEnvironmentStatus();
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ Environment validation passed');
      consoleSpy.mockRestore();
    });

    it('should exit process on validation failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });
      
      process.env = {
        ...process.env,
        NODE_ENV: 'invalid',
      };

      expect(() => logEnvironmentStatus()).toThrow('Process exit');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Environment validation failed'), expect.any(Error));
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});