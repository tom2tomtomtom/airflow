import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      latency?: number;
      error?: string;
    };
    storage?: {
      status: 'available' | 'unavailable' | 'error';
      error?: string;
    };
  };
  uptime: number;
}

// Track app start time
const appStartTime = Date.now();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: env.NODE_ENV,
      services: {
        database: {
          status: 'error',
          error: 'Method not allowed',
        },
      },
      uptime: Math.floor((Date.now() - appStartTime) / 1000),
    });
  }

  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: env.NODE_ENV,
    services: {
      database: {
        status: 'connected',
      },
    },
    uptime: Math.floor((Date.now() - appStartTime) / 1000),
  };

  try {
    // Check database connectivity
    const startTime = Date.now();
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    const latency = Date.now() - startTime;

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for health check
      healthStatus.services.database = {
        status: 'error',
        error: dbError.message,
        latency,
      };
      healthStatus.status = 'unhealthy';
    } else {
      healthStatus.services.database = {
        status: 'connected',
        latency,
      };
    }

    // Check storage if configured
    if (env.STORAGE_BUCKET) {
      try {
        const { error: storageError } = await supabase.storage
          .from(env.STORAGE_BUCKET)
          .list('', { limit: 1 });

        if (storageError) {
          healthStatus.services.storage = {
            status: 'error',
            error: storageError.message,
          };
          healthStatus.status = healthStatus.status === 'unhealthy' ? 'unhealthy' : 'degraded';
        } else {
          healthStatus.services.storage = {
            status: 'available',
          };
        }
      } catch (error) {
        healthStatus.services.storage = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown storage error',
        };
        healthStatus.status = healthStatus.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      }
    }

    // Set appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    return res.status(statusCode).json(healthStatus);
  } catch (error) {
    // Catastrophic failure
    return res.status(503).json({
      ...healthStatus,
      status: 'unhealthy',
      services: {
        database: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    });
  }
}
