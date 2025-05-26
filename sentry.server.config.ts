import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Server-specific options
  autoSessionTracking: false, // Not needed for server
  
  // Configure which errors to ignore
  ignoreErrors: [
    // Common non-actionable errors
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EPIPE',
    'ECONNRESET',
    
    // Expected errors
    'AbortError',
    'Non-Error promise rejection captured',
  ],
  
  // Before sending error to Sentry
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.NODE_ENV === 'production' && !event.exception) {
      return null;
    }
    
    // Don't send 4xx errors except 429 (rate limit)
    const statusCode = hint.originalException?.statusCode;
    if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      return null;
    }
    
    // Sanitize sensitive data
    if (event.request) {
      // Remove headers that might contain sensitive data
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }
      
      // Remove sensitive query params
      if (event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string);
        params.delete('token');
        params.delete('api_key');
        params.delete('secret');
        event.request.query_string = params.toString();
      }
    }
    
    // Remove user data in production
    if (process.env.NODE_ENV === 'production' && event.user) {
      event.user = {
        id: event.user.id, // Keep only user ID
      };
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    // Capture unhandled promise rejections
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
    
    // HTTP integration for better request context
    Sentry.httpIntegration({
      tracing: true,
      breadcrumbs: true,
    }),
    
    // Prisma integration if using Prisma
    // new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});
