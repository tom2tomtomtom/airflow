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
  
  // Edge-specific configuration
  transportOptions: {
    // Reduce the time we wait for the server to respond
    fetchOptions: {
      keepalive: false,
    },
  },
  
  // Configure which errors to ignore
  ignoreErrors: [
    // Common edge runtime errors
    'FetchError',
    'AbortError',
    'TypeError: Failed to fetch',
  ],
  
  // Before sending error to Sentry
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.NODE_ENV === 'production' && !event.exception) {
      return null;
    }
    
    // Sanitize sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }
    }
    
    return event;
  },
});
