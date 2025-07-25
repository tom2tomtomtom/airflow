/**
 * Performance utilities for Video Studio components
 * Provides debouncing, throttling, and memoization helpers
 */
import React from 'react';

/**
 * Debounce function to limit the rate of function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to ensure function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Shallow comparison for React.memo and useEffect dependencies
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Deep comparison for complex objects (use sparingly)
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!deepEqual(obj1[key], obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Memoization utility for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  }

  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; total: number }> {
    const result: Record<string, { average: number; count: number; total: number }> = {};
    
    for (const [name, times] of this.metrics.entries()) {
      const total = times.reduce((sum, time) => sum + time, 0);
      result[name] = {
        average: total / times.length,
        count: times.length,
        total,
      };
    }
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(name: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startMeasure: () => monitor.startMeasure(name),
    getAverageTime: () => monitor.getAverageTime(name),
    getMetrics: () => monitor.getMetrics(),
  };
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent: React.FC<P> = (props) => {
    const monitor = PerformanceMonitor.getInstance();
    const endMeasure = monitor.startMeasure(`${componentName} Render`);
    
    React.useEffect(() => {
      endMeasure();
    });
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
}

/**
 * Virtual scrolling utility for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
}

export function calculateVirtualScrollBounds({
  itemHeight,
  containerHeight,
  itemCount,
  overscan = 5,
}: VirtualScrollOptions & { scrollTop: number }): {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
} {
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(arguments[0].scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleItems + overscan * 2);
  
  return {
    startIndex,
    endIndex,
    visibleItems,
  };
}

/**
 * Memory usage monitoring (Chrome only)
 */
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

/**
 * Bundle size analyzer helper
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    console.group('📦 Bundle Analysis');
    
    scripts.forEach((script) => {
      const scriptElement = script as HTMLScriptElement;
      if (scriptElement.src) {
        console.log(`Script: ${scriptElement.src}`);
      }
    });
    
    const memory = getMemoryUsage();
    if (memory) {
      console.log(`Memory Usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    console.groupEnd();
  }
}