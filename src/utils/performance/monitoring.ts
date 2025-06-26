// Performance monitoring setup
import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Track Core Web Vitals
export const setupPerformanceMonitoring = () => {
  onCLS((metric: Metric) => {
    // Log CLS metric
    if (process.env.NODE_ENV === 'development') {
      console.log('CLS:', metric);
    }
  });
  onFID((metric: Metric) => {
    // Log FID metric
    if (process.env.NODE_ENV === 'development') {
      console.log('FID:', metric);
    }
  });
  onFCP((metric: Metric) => {
    // Log FCP metric
    if (process.env.NODE_ENV === 'development') {
      console.log('FCP:', metric);
    }
  });
  onLCP((metric: Metric) => {
    // Log LCP metric
    if (process.env.NODE_ENV === 'development') {
      console.log('LCP:', metric);
    }
  });
  onTTFB((metric: Metric) => {
    // Log TTFB metric
    if (process.env.NODE_ENV === 'development') {
      console.log('TTFB:', metric);
    }
  });
};

// Performance observer for custom metrics
export const observePerformance = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        // Log performance entries in development only
        if (entry.entryType === 'navigation' && process.env.NODE_ENV === 'development') {
          console.log('Navigation timing:', entry);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  }
};
