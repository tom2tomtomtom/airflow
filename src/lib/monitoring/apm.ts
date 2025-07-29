import * as Sentry from '@sentry/nextjs';
// Conditional import for node-statsd to avoid build errors when not available
let StatsD: any;

try {
  const nodeStatsd = require('node-statsd');
  StatsD = nodeStatsd.StatsD;
} catch (error) {
  // node-statsd module not available - provide fallback
  StatsD = class {
    constructor() {}
    increment() {}
    gauge() {}
    timing() {}
  } as any;
}
import { getConfig } from '@/lib/config';
import { getLogger } from '@/lib/logger';

const logger = getLogger('apm');

export interface APMConfig {
  sentry: {
    enabled: boolean;
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
  datadog: {
    enabled: boolean;
    host: string;
    port: number;
    prefix: string;
    globalTags: string[];
  };
}

export interface MetricData {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface TraceData {
  name: string;
  operation: string;
  duration: number;
  success: boolean;
  error?: Error;
  tags?: Record<string, string>;
  user?: {
    id: string;
    email: string;
    clientId?: string;
  };
}

export class APMManager {
  private config: APMConfig;
  private statsd?: any;
  private initialized = false;
  
  constructor() {
    this.config = this.getAPMConfig();
  }
  
  private getAPMConfig(): APMConfig {
    const config = getConfig();
    
    return {
      sentry: {
        enabled: !!config.SENTRY_DSN,
        dsn: config.SENTRY_DSN || '',
        environment: config.NODE_ENV || 'development',
        release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.APP_VERSION,
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1
      },
      datadog: {
        enabled: false,
        host: 'localhost',
        port: 8125,
        prefix: 'airwave.',
        globalTags: []
      }
    };
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize Sentry
      if (this.config.sentry.enabled && this.config.sentry.dsn) {
        Sentry.init({
          dsn: this.config.sentry.dsn,
          environment: this.config.sentry.environment,
          release: this.config.sentry.release,
          tracesSampleRate: this.config.sentry.tracesSampleRate,
          profilesSampleRate: this.config.sentry.profilesSampleRate,
          
          // Performance monitoring
          integrations: [
            Sentry.httpIntegration(),
            // Express integration removed in v8 - tracing handled by httpIntegration
          ],
          
          // Filter sensitive data
          beforeSend: (event) => {
            // Remove sensitive headers
            if (event.request?.headers) {
              delete event.request.headers.authorization;
              delete event.request.headers.cookie;
            }
            
            // Remove sensitive query params
            if (event.request?.query_string) {
              const queryString = typeof event.request.query_string === 'string' 
                ? event.request.query_string 
                : (event.request.query_string as [string, string][]).map(([key, value]) => `${key}=${value}`).join('&');
              event.request.query_string = this.sanitizeQueryString(queryString);
            }
            
            return event;
          },
          
          // Custom error filtering
          beforeSendTransaction: (event) => {
            // Don't send health check transactions
            if (event.transaction?.includes('/health')) {
              return null;
            }
            return event;
          }
        });
        
        logger.info('Sentry APM initialized', {
          environment: this.config.sentry.environment,
          release: this.config.sentry.release
        });
      }
      
      // Initialize DataDog StatsD
      if (this.config.datadog.enabled) {
        this.statsd = new StatsD({
          host: this.config.datadog.host,
          port: this.config.datadog.port,
          prefix: this.config.datadog.prefix,
          globalTags: this.config.datadog.globalTags,
          errorHandler: (error: any) => {
            logger.warn('DataDog StatsD error', error);
          }
        });
        
        logger.info('DataDog StatsD initialized', {
          host: this.config.datadog.host,
          port: this.config.datadog.port,
          prefix: this.config.datadog.prefix
        });
      }
      
      this.initialized = true;
      
    } catch (error: any) {
      logger.error('Failed to initialize APM', error);
      throw error;
    }
  }
  
  // Error tracking
  captureError(error: Error, context?: {
    user?: { id: string; email: string; clientId?: string };
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }): string | undefined {
    if (!this.config.sentry.enabled) return;
    
    return Sentry.withScope((scope) => {
      if (context?.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email,
          clientId: context.user.clientId
        });
      }
      
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      
      if (context?.level) {
        scope.setLevel(context.level);
      }
      
      return Sentry.captureException(error);
    });
  }
  
  // Performance monitoring
  startTrace(name: string, operation: string): {
    finish: (data?: Partial<TraceData>) => void;
  } {
    const startTime = Date.now();
    let spanFinishCallback: (() => void) | null = null;
    
    if (this.config.sentry.enabled) {
      spanFinishCallback = Sentry.startSpan({
        name,
        op: operation
      }, (span) => {
        // Return a finish callback
        return () => {
          // Span is automatically finished by the callback
        };
      });
    }
    
    return {
      finish: (data?: Partial<TraceData>) => {
        const duration = Date.now() - startTime;
        
        // Set span data before finishing
        if (this.config.sentry.enabled && data) {
          Sentry.withScope((scope) => {
            if (data.user) {
              scope.setUser({
                id: data.user.id,
                email: data.user.email,
                clientId: data.user.clientId
              });
            }
            
            if (data.tags) {
              Object.entries(data.tags).forEach(([key, value]) => {
                scope.setTag(key, value);
              });
            }
            
            // Set span status
            const currentSpan = Sentry.getActiveSpan();
            if (currentSpan) {
              currentSpan.setStatus({ code: data.success !== false ? 1 : 2 }); // OK : ERROR
            }
          });
        }
        
        // Finish the span if we have a callback
        if (spanFinishCallback) {
          spanFinishCallback();
        }
        
        // Send DataDog metrics
        this.recordMetric({
          name: `${operation}.duration`,
          value: duration,
          type: 'timer',
          tags: data?.tags
        });
        
        if (data?.success === false) {
          this.recordMetric({
            name: `${operation}.error`,
            value: 1,
            type: 'counter',
            tags: data?.tags
          });
        }
      }
    };
  }
  
  // Metrics collection
  recordMetric(metric: MetricData): void {
    if (!this.statsd) return;
    
    const tags = metric.tags ? Object.entries(metric.tags).map(([k, v]) => `${k}:${v}`) : [];
    
    try {
      switch (metric.type) {
        case 'counter':
          this.statsd.increment(metric.name, metric.value, tags);
          break;
        case 'gauge':
          this.statsd.gauge(metric.name, metric.value, tags);
          break;
        case 'histogram':
          this.statsd.histogram(metric.name, metric.value, tags);
          break;
        case 'timer':
          this.statsd.timing(metric.name, metric.value, tags);
          break;
      }
    } catch (error: any) {
      logger.warn('Failed to record metric', error);
    }
  }
  
  // User context
  setUser(user: { id: string; email: string; clientId?: string }): void {
    if (this.config.sentry.enabled) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        clientId: user.clientId
      });
    }
  }
  
  // Custom events
  captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' = 'info', context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }): string | undefined {
    if (!this.config.sentry.enabled) return;
    
    return Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      
      scope.setLevel(level);
      return Sentry.captureMessage(message);
    });
  }
  
  // Breadcrumbs
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (this.config.sentry.enabled) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        timestamp: Date.now() / 1000
      });
    }
  }
  
  // Health check
  async healthCheck(): Promise<{
    sentry: { enabled: boolean; healthy: boolean };
    datadog: { enabled: boolean; healthy: boolean };
  }> {
    const result = {
      sentry: { enabled: this.config.sentry.enabled, healthy: false },
      datadog: { enabled: this.config.datadog.enabled, healthy: false }
    };
    
    // Check Sentry
    if (this.config.sentry.enabled) {
      try {
        // Send a test event (will be filtered out in beforeSend)
        Sentry.captureMessage('Health check', 'info');
        result.sentry.healthy = true;
      } catch (error: any) {
        logger.warn('Sentry health check failed', error);
      }
    }
    
    // Check DataDog
    if (this.config.datadog.enabled && this.statsd) {
      try {
        this.statsd.gauge('health.check', 1, ['source:apm']);
        result.datadog.healthy = true;
      } catch (error: any) {
        logger.warn('DataDog health check failed', error);
      }
    }
    
    return result;
  }
  
  // Graceful shutdown
  async shutdown(): Promise<void> {
    logger.info('Shutting down APM');
    
    if (this.config.sentry.enabled) {
      await Sentry.close(2000);
    }
    
    if (this.statsd) {
      this.statsd.close();
    }
  }
  
  // Helper methods
  private sanitizeQueryString(queryString: string): string {
    // Remove sensitive parameters
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];
    let sanitized = queryString;
    
    sensitiveParams.forEach((param: any) => {
      const regex = new RegExp(`${param}=[^&]*`, 'gi');
      sanitized = sanitized.replace(regex, `${param}=[REDACTED]`);
    });
    
    return sanitized;
  }
}

// Singleton instance
let apmInstance: APMManager | null = null;

export const getAPM = (): APMManager => {
  if (!apmInstance) {
    apmInstance = new APMManager();
  }
  return apmInstance;
};

// Initialize APM
export const initializeAPM = async (): Promise<APMManager> => {
  const apm = getAPM();
  await apm.initialize();
  return apm;
};

// Convenience functions
export const captureError = (error: Error, context?: Parameters<APMManager['captureError']>[1]): string | undefined => {
  return getAPM().captureError(error, context);
};

export const startTrace = (name: string, operation: string) => {
  return getAPM().startTrace(name, operation);
};

export const recordMetric = (metric: MetricData): void => {
  getAPM().recordMetric(metric);
};

export const setUser = (user: { id: string; email: string; clientId?: string }): void => {
  getAPM().setUser(user);
};

// Express/Next.js middleware
export const createAPMMiddleware = () => {
  return (req: any, res: any, next: any) => {
    const apm = getAPM();
    const startTime = Date.now();
    
    // Start trace for this request
    const trace = apm.startTrace(`${req.method} ${req.route?.path || req.path}`, 'http.request');
    
    // Add user context if available
    if (req.user) {
      apm.setUser({
        id: req.user.id,
        email: req.user.email,
        clientId: req.user.clientId
      });
    }
    
    // Add breadcrumb
    apm.addBreadcrumb(`${req.method} ${req.path}`, 'http', {
      method: req.method,
      url: req.path,
      userAgent: req.get('User-Agent')
    });
    
    // Override res.end to finish trace
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      trace.finish({
        success: res.statusCode < 400,
        tags: {
          method: req.method,
          status_code: res.statusCode.toString(),
          route: req.route?.path || req.path
        },
        user: req.user ? {
          id: req.user.id,
          email: req.user.email,
          clientId: req.user.clientId
        } : undefined
      });
      
      originalEnd.apply(res, args);
    };
    
    next();
  };
};