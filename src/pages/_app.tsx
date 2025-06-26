import React from 'react';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { AuthRefreshHandler } from '@/components/AuthRefreshHandler';
import { ClientProvider } from '@/contexts/ClientContext';
import createEmotionCache from '@/lib/createEmotionCache';
import { UnifiedProvider } from '@/contexts/UnifiedProvider';

// Import CSS files in the correct order
import '@/styles/globals.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// Simplified auth providers - only authentication specific
function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SupabaseAuthProvider>
        <ClientProvider>
          <AuthRefreshHandler />
          {children}
        </ClientProvider>
      </SupabaseAuthProvider>
    </AuthProvider>
  );
}

// Main app component with unified providers
function ThemedApp(props: MyAppProps) {
  const { Component, pageProps } = props;

  return (
    <UnifiedProvider>
      <AuthProviders>
        <Component {...pageProps} />
      </AuthProviders>
    </UnifiedProvider>
  );
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }

    // Performance optimization: Warm up the browser's DNS cache
    if (typeof window !== 'undefined') {
      const warmupUrls = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

      warmupUrls.forEach((url: any) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }
  }, []);

  useEffect(() => {
    // App initialization
    if (process.env.NODE_ENV === 'development') {
      // Development-specific initialization
    }
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // TODO: Send to error tracking service
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // TODO: Send to error tracking service
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Airflow - AI-Powered Campaign Management</title>
        <meta
          name="description"
          content="AI-powered campaign management platform for creating and managing digital marketing assets"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemedApp {...props} />
    </CacheProvider>
  );
}

export default MyApp;
