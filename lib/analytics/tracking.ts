import { analytics, ANALYTICS_EVENTS } from './mixpanel';
import * as ga from './googleAnalytics';
import { addAnalyticsJob } from '@/lib/queue/bullQueue';

// Unified tracking interface
export class Tracking {
  /**
   * Track user signup
   */
  static async trackSignup(userId: string, email: string, properties?: Record<string, any>) {
    analytics.track(ANALYTICS_EVENTS.USER_SIGNED_UP, {
      user_id: userId,
      email,
      ...properties,
    });
    
    ga.trackEvent('sign_up', 'user', email);
    
    // Queue for backend processing
    await addAnalyticsJob({
      event: ANALYTICS_EVENTS.USER_SIGNED_UP,
      userId,
      properties: { email, ...properties },
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Track user login
   */
  static trackLogin(userId: string, method: string = 'email') {
    analytics.track(ANALYTICS_EVENTS.USER_LOGGED_IN, {
      user_id: userId,
      login_method: method,
    });
    
    ga.trackEvent('login', 'user', method);
  }
  
  /**
   * Track asset upload
   */
  static async trackAssetUpload(
    assetId: string,
    assetType: string,
    fileSize: number,
    clientId: string
  ) {
    analytics.track(ANALYTICS_EVENTS.ASSET_UPLOADED, {
      asset_id: assetId,
      asset_type: assetType,
      file_size: fileSize,
      client_id: clientId,
    });
    
    ga.trackEvent('upload', 'asset', assetType, Math.round(fileSize / 1024)); // KB
    
    // Increment user property
    analytics.incrementUserProperty('total_assets_uploaded');
  }
  
  /**
   * Track campaign creation
   */
  static async trackCampaignCreation(
    campaignId: string,
    clientId: string,
    templateCount: number
  ) {
    analytics.track(ANALYTICS_EVENTS.CAMPAIGN_CREATED, {
      campaign_id: campaignId,
      client_id: clientId,
      template_count: templateCount,
    });
    
    ga.trackEvent('create', 'campaign', clientId);
    
    analytics.incrementUserProperty('total_campaigns_created');
  }
  
  /**
   * Track render completion
   */
  static async trackRenderComplete(
    executionId: string,
    duration: number,
    success: boolean,
    clientId: string
  ) {
    const event = success ? ANALYTICS_EVENTS.RENDER_COMPLETED : ANALYTICS_EVENTS.RENDER_FAILED;
    
    analytics.track(event, {
      execution_id: executionId,
      duration_ms: duration,
      success,
      client_id: clientId,
    });
    
    ga.trackEvent(
      success ? 'render_success' : 'render_failure',
      'render',
      clientId,
      duration
    );
    
    // Track timing
    ga.trackTiming('render_duration', duration, 'performance', success ? 'success' : 'failure');
    
    if (success) {
      analytics.incrementUserProperty('total_renders_completed');
    }
  }
  
  /**
   * Track approval
   */
  static async trackApproval(
    approvalId: string,
    approved: boolean,
    clientId: string,
    responseTime?: number
  ) {
    const event = approved ? ANALYTICS_EVENTS.APPROVAL_RECEIVED : ANALYTICS_EVENTS.APPROVAL_REJECTED;
    
    analytics.track(event, {
      approval_id: approvalId,
      approved,
      client_id: clientId,
      response_time_hours: responseTime,
    });
    
    ga.trackEvent(
      approved ? 'approval_accepted' : 'approval_rejected',
      'approval',
      clientId
    );
  }
  
  /**
   * Track page performance
   */
  static trackPagePerformance(pageName: string, loadTime: number) {
    analytics.track(ANALYTICS_EVENTS.PAGE_LOAD_TIME, {
      page_name: pageName,
      load_time_ms: loadTime,
    });
    
    ga.trackTiming('page_load', loadTime, 'performance', pageName);
  }
  
  /**
   * Track API performance
   */
  static trackAPIPerformance(endpoint: string, method: string, duration: number, status: number) {
    analytics.track(ANALYTICS_EVENTS.API_RESPONSE_TIME, {
      endpoint,
      method,
      duration_ms: duration,
      status_code: status,
      success: status >= 200 && status < 300,
    });
    
    if (duration > 1000) { // Log slow APIs
      ga.trackEvent('slow_api', 'performance', endpoint, duration);
    }
  }
  
  /**
   * Track errors
   */
  static trackError(error: Error, context?: Record<string, any>) {
    analytics.trackError(error, context);
    ga.trackException(error.message, false);
  }
  
  /**
   * Track revenue (if applicable)
   */
  static trackRevenue(amount: number, clientId: string, planType: string) {
    analytics.trackRevenue(amount, {
      client_id: clientId,
      plan_type: planType,
    });
    
    ga.trackConversion('purchase', amount);
  }
  
  /**
   * Set user context
   */
  static setUser(userId: string, properties: Record<string, any>) {
    analytics.identify(userId, properties);
    ga.setUserProperties({
      user_id: userId,
      ...properties,
    });
  }
  
  /**
   * Clear user context (on logout)
   */
  static clearUser() {
    analytics.reset();
  }
}

// Export for convenience
export { ANALYTICS_EVENTS } from './mixpanel';
