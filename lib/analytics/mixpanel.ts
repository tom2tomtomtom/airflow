import { getErrorMessage } from '@/utils/errorUtils';
import mixpanel, { Dict, Query } from 'mixpanel-browser';

// Generate a simple session ID without external dependencies
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize Mixpanel only in production or if explicitly enabled
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const isDevelopment = process.env.NODE_ENV === 'development';
const isEnabled = Boolean(MIXPANEL_TOKEN && (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || process.env.NODE_ENV === 'production'));

if (isEnabled) {
  mixpanel.init(MIXPANEL_TOKEN!, {
    debug: isDevelopment,
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: false,
    batch_requests: true,
    loaded: (mixpanel) => {
      // Set up super properties that persist across all events
      mixpanel.register({
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV,
      });
    },
  });
}

// Analytics event names
export const ANALYTICS_EVENTS = {
  // User events
  USER_SIGNED_UP: 'User Signed Up',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',
  USER_PROFILE_UPDATED: 'User Profile Updated',
  
  // Client events
  CLIENT_CREATED: 'Client Created',
  CLIENT_UPDATED: 'Client Updated',
  CLIENT_SELECTED: 'Client Selected',
  CLIENT_DELETED: 'Client Deleted',
  
  // Asset events
  ASSET_UPLOADED: 'Asset Uploaded',
  ASSET_BULK_UPLOADED: 'Assets Bulk Uploaded',
  ASSET_DELETED: 'Asset Deleted',
  ASSET_FAVORITED: 'Asset Favorited',
  ASSET_DOWNLOADED: 'Asset Downloaded',
  
  // Campaign events
  CAMPAIGN_CREATED: 'Campaign Created',
  CAMPAIGN_MATRIX_UPDATED: 'Campaign Matrix Updated',
  CAMPAIGN_COMPLETED: 'Campaign Completed',
  CAMPAIGN_EXPORTED: 'Campaign Exported',
  
  // Render events
  RENDER_STARTED: 'Render Started',
  RENDER_COMPLETED: 'Render Completed',
  RENDER_FAILED: 'Render Failed',
  RENDER_RETRIED: 'Render Retried',
  
  // Strategy events
  BRIEF_CREATED: 'Brief Created',
  BRIEF_UPLOADED: 'Brief Uploaded',
  MOTIVATIONS_GENERATED: 'Motivations Generated',
  COPY_GENERATED: 'Copy Generated',
  
  // Approval events
  APPROVAL_SENT: 'Approval Sent',
  APPROVAL_RECEIVED: 'Approval Received',
  APPROVAL_REJECTED: 'Approval Rejected',
  
  // Error events
  ERROR_OCCURRED: 'Error Occurred',
  ERROR_BOUNDARY_TRIGGERED: 'Error Boundary Triggered',
  
  // Performance events
  PAGE_LOAD_TIME: 'Page Load Time',
  API_RESPONSE_TIME: 'API Response Time',
  RENDER_QUEUE_TIME: 'Render Queue Time',
} as const;

// User properties
interface UserProperties {
  email?: string;
  name?: string;
  role?: string;
  created_at?: string;
  client_count?: number;
  organization?: string;
  plan?: string;
}

// Event properties
interface EventProperties extends Dict {
  client_id?: string;
  campaign_id?: string;
  asset_id?: string;
  duration_ms?: number;
  error_message?: string;
  error_code?: string;
}

class Analytics {
  private sessionId: string;
  private isEnabled: boolean;
  
  constructor() {
    this.sessionId = generateSessionId();
    this.isEnabled = isEnabled;
  }
  
  /**
   * Identify a user
   */
  identify(userId: string, properties?: UserProperties) {
    if (!this.isEnabled) return;
    
    try {
      mixpanel.identify(userId);
      
      if (properties) {
        mixpanel.people.set(properties);
        
        // Also set as super properties for all events
        mixpanel.register({
          user_id: userId,
          user_email: properties.email,
          user_role: properties.role,
        });
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics identify error:', error);
    }
  }
  
  /**
   * Track an event
   */
  track(event: string, properties?: EventProperties) {
    if (!this.isEnabled) {
      if (isDevelopment) {
        console.log('[Analytics]', event, properties);
      }
      return;
    }
    
    try {
      const enrichedProperties = {
        ...properties,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        ...this.getDefaultProperties(),
      };
      
      mixpanel.track(event, enrichedProperties);
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics track error:', error);
    }
  }
  
  /**
   * Time an event
   */
  timeEvent(event: string) {
    if (!this.isEnabled) return;
    
    try {
      mixpanel.time_event(event);
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics time event error:', error);
    }
  }
  
  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return;
    
    try {
      mixpanel.people.set(properties);
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics set user properties error:', error);
    }
  }
  
  /**
   * Increment a user property
   */
  incrementUserProperty(property: string, value: number = 1) {
    if (!this.isEnabled) return;
    
    try {
      mixpanel.people.increment(property, value);
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics increment error:', error);
    }
  }
  
  /**
   * Track revenue
   */
  trackRevenue(amount: number, properties?: EventProperties) {
    if (!this.isEnabled) return;
    
    try {
      mixpanel.people.track_charge(amount, properties);
      this.track('Revenue', {
        ...properties,
        amount,
      });
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics revenue error:', error);
    }
  }
  
  /**
   * Reset analytics (on logout)
   */
  reset() {
    if (!this.isEnabled) return;
    
    try {
      mixpanel.reset();
      this.sessionId = generateSessionId();
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Analytics reset error:', error);
    }
  }
  
  /**
   * Get default properties for all events
   */
  private getDefaultProperties(): Dict {
    return {
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      screen_width: typeof window !== 'undefined' ? window.screen.width : undefined,
      screen_height: typeof window !== 'undefined' ? window.screen.height : undefined,
      viewport_width: typeof window !== 'undefined' ? window.innerWidth : undefined,
      viewport_height: typeof window !== 'undefined' ? window.innerHeight : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };
  }
  
  /**
   * Track page view
   */
  trackPageView(pageName?: string) {
    this.track('Page View', {
      page_name: pageName,
    });
  }
  
  /**
   * Track click event
   */
  trackClick(element: string, properties?: EventProperties) {
    this.track('Element Clicked', {
      element,
      ...properties,
    });
  }
  
  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, properties?: EventProperties) {
    this.track('Form Submitted', {
      form_name: formName,
      ...properties,
    });
  }
  
  /**
   * Track error
   */
  trackError(error: Error | string, properties?: EventProperties) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: errorMessage,
      error_stack: errorStack,
      ...properties,
    });
  }
  
  /**
   * Track performance metric
   */
  trackPerformance(metric: string, duration: number, properties?: EventProperties) {
    this.track(metric, {
      duration_ms: duration,
      ...properties,
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export types
export type { UserProperties, EventProperties };
