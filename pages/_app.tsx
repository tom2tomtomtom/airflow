import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import ErrorBoundary from '@/components/ErrorBoundary';
import { analytics } from '@/lib/analytics/mixpanel';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      // Google Analytics (if configured)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
        });
      }
      
      // Mixpanel analytics
      if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        analytics.track('Page View', {
          path: url,
          referrer: document.referrer,
        });
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  // Set user context for error tracking
  useEffect(() => {
    if (pageProps.user) {
      Sentry.setUser({
        id: pageProps.user.id,
        email: pageProps.user.email,
      });
      
      // Set user in analytics
      if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        analytics.identify(pageProps.user.id, {
          email: pageProps.user.email,
          name: pageProps.user.name,
        });
      }
    }
  }, [pageProps.user]);
  
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
