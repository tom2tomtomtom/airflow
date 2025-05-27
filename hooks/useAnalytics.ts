import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tracking } from '@/lib/analytics/tracking';

/**
 * Custom hook for analytics tracking in React components
 */
export function useAnalytics() {
  const router = useRouter();
  
  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      Tracking.trackPageView(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  // Track click events
  const trackClick = useCallback((element: string, properties?: Record<string, any>) => {
    Tracking.trackClick(element, properties);
  }, []);
  
  // Track form submissions
  const trackFormSubmit = useCallback((formName: string, properties?: Record<string, any>) => {
    Tracking.trackFormSubmit(formName, properties);
  }, []);
  
  // Track custom events
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    Tracking.track(event, properties);
  }, []);
  
  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    Tracking.trackError(error, context);
  }, []);
  
  // Track timing
  const trackTiming = useCallback((metric: string, duration: number, properties?: Record<string, any>) => {
    Tracking.trackPerformance(metric, duration, properties);
  }, []);
  
  return {
    trackClick,
    trackFormSubmit,
    trackEvent,
    trackError,
    trackTiming,
  };
}

/**
 * Hook to track component mount performance
 */
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const mountTime = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const duration = unmountTime - mountTime;
      
      if (duration > 1000) { // Only track if component was mounted for > 1s
        Tracking.trackPerformance(`Component Mount Duration`, duration, {
          component: componentName,
        });
      }
    };
  }, [componentName]);
}

/**
 * Hook to track API call performance
 */
export function useAPITracking() {
  const trackAPICall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      Tracking.trackAPIPerformance(endpoint, method, duration, 200);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const status = (error as any)?.response?.status || 0;
      
      Tracking.trackAPIPerformance(endpoint, method, duration, status);
      Tracking.trackError(error as Error, { endpoint, method });
      
      throw error;
    }
  }, []);
  
  return { trackAPICall };
}
