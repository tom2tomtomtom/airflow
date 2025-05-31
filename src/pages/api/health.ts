import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

// Health check statuses
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
type ServiceStatus = 'ok' | 'error' | 'timeout';

interface ServiceCheck {
  status: ServiceStatus;
  message?: string;
  latency?: number;
  details?: any;
}

interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: ServiceCheck;
    redis: ServiceCheck;
    storage: ServiceCheck;
    creatomate: ServiceCheck;
    email: ServiceCheck;
  };
}

// Service check functions
async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Simple query to check connection
    const { error } = await supabase
      .from('clients')
      .select('id')
      .limit(1)
      .single();
    
    const latency = Date.now() - start;
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return {
        status: 'error',
        message: error.message,
        latency,
      };
    }
    
    return {
      status: 'ok',
      latency,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function checkRedis(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
      return {
        status: 'error',
        message: 'Redis service not configured (optional)',
        latency: 0,
      };
    }
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
    
    await redis.ping();
    const latency = Date.now() - start;
    
    return {
      status: 'ok',
      latency,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function checkStorage(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    // Check S3 if configured
    if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      
      const command = new HeadBucketCommand({
        Bucket: process.env.AWS_S3_BUCKET,
      });
      
      await s3Client.send(command);
      
      return {
        status: 'ok',
        latency: Date.now() - start,
        details: { provider: 's3' },
      };
    }
    
    // Fall back to Supabase storage check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase.storage.listBuckets();
    
    if (error) {
      return {
        status: 'error',
        message: error.message,
        latency: Date.now() - start,
      };
    }
    
    return {
      status: 'ok',
      latency: Date.now() - start,
      details: { provider: 'supabase' },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function checkCreatomate(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    const response = await fetch('https://api.creatomate.com/v1/templates', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    const latency = Date.now() - start;
    
    if (!response.ok) {
      return {
        status: 'error',
        message: `HTTP ${response.status}`,
        latency,
      };
    }
    
    return {
      status: 'ok',
      latency,
    };
  } catch (error) {
    return {
      status: error.name === 'AbortError' ? 'timeout' : 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function checkEmail(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        status: 'ok',
        message: 'Email service using fallback logging (Resend not configured)',
        latency: Date.now() - start,
        details: { provider: 'fallback' },
      };
    }
    
    // We could make a test API call to Resend here
    // For now, just check if the key exists
    return {
      status: 'ok',
      latency: Date.now() - start,
      details: { provider: 'resend' },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

// Main health check handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method Not Allowed');
    return;
  }
  
  // Run all health checks in parallel
  const [database, redis, storage, creatomate, email] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
    checkCreatomate(),
    checkEmail(),
  ]);
  
  const checks = {
    database,
    redis,
    storage,
    creatomate,
    email,
  };
  
  // Determine overall health status
  const criticalServices = ['database', 'storage'];
  const allChecks = Object.entries(checks);
  const criticalChecks = allChecks.filter(([name]) => criticalServices.includes(name));
  const nonCriticalChecks = allChecks.filter(([name]) => !criticalServices.includes(name));
  
  const criticalFailures = criticalChecks.filter(([_, check]) => check.status === 'error').length;
  const nonCriticalFailures = nonCriticalChecks.filter(([_, check]) => 
    check.status === 'error' && !check.message?.includes('optional')
  ).length;
  
  let status: HealthStatus = 'healthy';
  if (criticalFailures > 0) {
    status = 'unhealthy';
  } else if (nonCriticalFailures > 0) {
    status = 'degraded';
  }
  
  const response: HealthCheckResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks,
  };
  
  // Set appropriate status code
  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  
  // Cache for 10 seconds to avoid hammering services
  res.setHeader('Cache-Control', 'public, max-age=10');
  res.status(statusCode).json(response);
}
