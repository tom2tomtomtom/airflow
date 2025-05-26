import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask sensitive content
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
      
      // Privacy settings
      privacy: {
        maskTextContent: false,
        maskInputOptions: {
          password: true,
          email: true,
          tel: true,
        },
      },
      
      // Network recording
      networkDetailAllowUrls: [
        window.location.origin,
        'https://api.creatomate.com',
      ],
    }),
    
    Sentry.browserTracingIntegration(),
  ],
  
  // Configure which errors to ignore
  ignoreErrors: [
    // Browser extensions
    'Non-Error promise rejection captured',
    
    // Network errors that are expected
    'NetworkError',
    'Failed to fetch',
    
    // User-caused errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    
    // Known third-party errors
    'TransformStream is not defined',
  ],
  
  // Before sending error to Sentry
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.NODE_ENV === 'production' && !event.exception) {
      return null;
    }
    
    // Don't send events from localhost in production
    if (
      process.env.NODE_ENV === 'production' &&
      event.request?.url?.includes('localhost')
    ) {
      return null;
    }
    
    // Sanitize sensitive data
    if (event.request?.cookies) {
      event.request.cookies = '[Filtered]';
    }
    
    if (event.user?.email) {
      // Hash email for privacy
      event.user.email = '[Filtered]';
    }
    
    return event;
  },
  
  // Configure breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }
    
    // Sanitize fetch breadcrumbs
    if (breadcrumb.category === 'fetch' && breadcrumb.data?.url) {
      // Remove query params that might contain sensitive data
      const url = new URL(breadcrumb.data.url);
      url.search = '';
      breadcrumb.data.url = url.toString();
    }
    
    return breadcrumb;
  },
});
