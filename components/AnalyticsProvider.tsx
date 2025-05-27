import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tracking } from '@/lib/analytics/tracking';
import { initGA } from '@/lib/analytics/googleAnalytics';

interface AnalyticsContextType {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackClick: (element: string, properties?: Record<string, any>) => void;
  trackFormSubmit: (formName: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  setUser: (userId: string, properties: Record<string, any>) => void;
  clearUser: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export function AnalyticsProvider({ children, user }: AnalyticsProviderProps) {
  const router = useRouter();
  
  // Initialize analytics on mount
  useEffect(() => {
    initGA();
    
    // Track initial page view
    Tracking.trackPageView(router.pathname);
  }, []);
  
  // Set user context when user changes
  useEffect(() => {
    if (user) {
      Tracking.setUser(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } else {
      Tracking.clearUser();
    }
  }, [user]);
  
  // Track route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      Tracking.trackPageView(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  const value: AnalyticsContextType = {
    trackEvent: Tracking.track,
    trackClick: Tracking.trackClick,
    trackFormSubmit: Tracking.trackFormSubmit,
    trackError: Tracking.trackError,
    setUser: Tracking.setUser,
    clearUser: Tracking.clearUser,
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
