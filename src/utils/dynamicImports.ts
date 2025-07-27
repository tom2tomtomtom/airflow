/**
 * Dynamic Import Utilities for Bundle Optimization
 * Provides lazy loading for heavy components and features
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Default loading component reference
 */
const LoadingFallback = () => null; // Reference to @/components/ui/LoadingSpinner

/**
 * Default error component reference
 */
const ErrorFallback = ({ error: _error }: { error?: Error }) => null; // Reference to @/components/ui/ErrorFallback

/**
 * Enhanced dynamic import with loading and error handling
 */
export function createLazyComponent<T = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: ComponentType;
    errorFallback?: ComponentType<{ error?: Error }>;
    ssr?: boolean;
  } = {}
) {
  const { fallback = LoadingFallback, errorFallback = ErrorFallback, ssr = false } = options;

  const safeImportFn = () =>
    importFn().catch(error => {
      const ErrorComponent = typeof errorFallback === 'function' && errorFallback.length > 0
        ? () => errorFallback({ error })
        : errorFallback as ComponentType<T>;
      return { default: ErrorComponent as ComponentType<T> };
    });

  return dynamic(safeImportFn, {
    loading: fallback,
    ssr,
  });
}

/**
 * Lazy load heavy dashboard components
 */
export const LazyDashboard = createLazyComponent(() => import('@/components/DashboardLayout'), {
  ssr: false,
});

export const LazyVideoEditor = createLazyComponent(
  () => import('@/components/VideoExecutionPanel'),
  { ssr: false }
);

export const LazyAnalytics = createLazyComponent(
  () => import('@/components/AdvancedAnalytics'),
  {
    ssr: false,
  }
);

export const LazyWorkflowCanvas = createLazyComponent(
  () => import('@/components/workflow/WorkflowContainer'),
  { ssr: false }
);

/**
 * Lazy load heavy form components
 */
export const LazyBriefUpload = createLazyComponent(() => import('@/components/BriefUploadModal'), {
  ssr: false,
});

export const LazyAssetManager = createLazyComponent(() => import('@/components/AssetBrowser'), {
  ssr: false,
});

/**
 * Lazy load admin components
 */
export const LazyAdminPanel = createLazyComponent(
  () => import('@/components/monitoring/MonitoringDashboard'),
  {
    ssr: false,
  }
);

export const LazyUserManagement = createLazyComponent(() => import('@/components/UserMenu'), {
  ssr: false,
});

/**
 * Code splitting utility for feature modules
 */
export class FeatureLazyLoader {
  private static cache = new Map<string, Promise<unknown>>();

  /**
   * Load a feature module with caching
   */
  static async loadFeature<T>(featureName: string, importFn: () => Promise<T>): Promise<T> {
    if (this.cache.has(featureName)) {
      return this.cache.get(featureName) as T;
    }

    const promise = importFn().catch(error => {
      // Remove failed promise from cache to allow retry
      this.cache.delete(featureName);
      throw error;
    });

    this.cache.set(featureName, promise);
    return promise;
  }

  /**
   * Preload a feature module
   */
  static preloadFeature(featureName: string, importFn: () => Promise<unknown>) {
    if (!this.cache.has(featureName)) {
      this.loadFeature(featureName, importFn);
    }
  }

  /**
   * Clear feature cache
   */
  static clearCache(featureName?: string) {
    if (featureName) {
      this.cache.delete(featureName);
    } else {
      this.cache.clear();
    }
  }
}

/**
 * Lazy load AI processing modules
 * Note: These modules will be loaded when they become available
 */
export const loadAIProcessor = () =>
  FeatureLazyLoader.loadFeature('ai-processor', () => Promise.resolve({ default: () => null }));

export const loadVideoGenerator = () =>
  FeatureLazyLoader.loadFeature('video-generator', () => Promise.resolve({ default: () => null }));

export const loadAnalyticsEngine = () =>
  FeatureLazyLoader.loadFeature('analytics-engine', () => Promise.resolve({ default: () => null }));

/**
 * Route-based code splitting utilities
 */
export const routeBasedComponents = {
  // Dashboard routes
  dashboard: () => import('@/pages/dashboard'),
  campaigns: () => import('@/pages/campaigns'),
  analytics: () => Promise.resolve({ default: () => null }), // Analytics page is currently disabled

  // Content creation routes
  briefUpload: () => Promise.resolve({ default: () => null }),
  videoCreator: () => Promise.resolve({ default: () => null }),
  assetLibrary: () => import('@/pages/assets'),

  // Admin routes
  admin: () => Promise.resolve({ default: () => null }),
  settings: () => Promise.resolve({ default: () => null }),

  // User management
  profile: () => Promise.resolve({ default: () => null }),
  team: () => Promise.resolve({ default: () => null }),
};

/**
 * Preload critical routes for better UX
 */
export function preloadCriticalRoutes() {
  if (typeof window !== 'undefined') {
    // Preload dashboard components on app load
    FeatureLazyLoader.preloadFeature('dashboard', routeBasedComponents.dashboard);

    // Preload frequently used components
    requestIdleCallback(() => {
      FeatureLazyLoader.preloadFeature('campaigns', routeBasedComponents.campaigns);
      FeatureLazyLoader.preloadFeature('brief-upload', routeBasedComponents.briefUpload);
    });
  }
}

/**
 * Bundle size monitoring utility
 */
export class BundleMonitor {
  private static performanceObserver: PerformanceObserver | null = null;

  static startMonitoring() {
    if (typeof window === 'undefined' || this.performanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;

            // eslint-disable-next-line no-console
            console.log('📊 Bundle Load Performance:', {
              domContentLoaded:
                navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
              firstContentfulPaint:
                performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
            });
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint'] });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Performance monitoring not supported:', error);
    }
  }

  static stopMonitoring() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

/**
 * Initialize bundle optimizations
 */
export function initializeBundleOptimizations() {
  // Start performance monitoring in development
  if (process.env.NODE_ENV === 'development') {
    BundleMonitor.startMonitoring();
  }

  // Preload critical routes
  preloadCriticalRoutes();

  // Clean up on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      BundleMonitor.stopMonitoring();
    });
  }
}
