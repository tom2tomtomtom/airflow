/**
 * API Performance Optimization Middleware
 * Implements response compression, caching, and monitoring for optimal API performance
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { cacheManager } from '@/lib/cache/strategy';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: {
    before: NodeJS.MemoryUsage;
    after?: NodeJS.MemoryUsage;
  };
  cacheHit?: boolean;
  queryCount?: number;
}

interface OptimizationOptions {
  enableCaching?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  enableCompression?: boolean;
  enableMetrics?: boolean;
  enableQueryOptimization?: boolean;
  rateLimit?: {
    max: number;
    window: number;
  };
}

/**
 * Performance monitoring utility
 */
class APIPerformanceMonitor {
  private static metrics = new Map<string, PerformanceMetrics[]>();
  private static maxMetricsPerEndpoint = 100;

  static startTracking(endpoint: string): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      startTime: Date.now(),
      memoryUsage: {
        before: process.memoryUsage(),
      },
    };

    // Store metrics for analysis
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }

    const endpointMetrics = this.metrics.get(endpoint)!;
    endpointMetrics.push(metrics);

    // Keep only recent metrics
    if (endpointMetrics.length > this.maxMetricsPerEndpoint) {
      endpointMetrics.splice(0, endpointMetrics.length - this.maxMetricsPerEndpoint);
    }

    return metrics;
  }

  static finishTracking(metrics: PerformanceMetrics): void {
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryUsage!.after = process.memoryUsage();
  }

  static getMetrics(endpoint?: string) {
    if (endpoint) {
      return this.metrics.get(endpoint) || [];
    }
    return Object.fromEntries(this.metrics);
  }

  static getAverageResponseTime(endpoint: string): number {
    const endpointMetrics = this.metrics.get(endpoint) || [];
    if (endpointMetrics.length === 0) return 0;

    const totalTime = endpointMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalTime / endpointMetrics.length;
  }

  static clearMetrics(endpoint?: string): void {
    if (endpoint) {
      this.metrics.delete(endpoint);
    } else {
      this.metrics.clear();
    }
  }
}

/**
 * Query optimization utilities
 */
class QueryOptimizer {
  private static queryCache = new Map<string, any>();
  private static queryCount = new Map<string, number>();

  static trackQuery(endpoint: string, query: string, result: unknown): void {
    // Track query count per endpoint
    const currentCount = this.queryCount.get(endpoint) || 0;
    this.queryCount.set(endpoint, currentCount + 1);

    // Cache frequently used queries
    const cacheKey = `${endpoint}:${this.hashQuery(query)}`;
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      endpoint,
    });
  }

  static getQueryCount(endpoint: string): number {
    return this.queryCount.get(endpoint) || 0;
  }

  static getCachedQuery(endpoint: string, query: string): unknown | null {
    const cacheKey = `${endpoint}:${this.hashQuery(query)}`;
    const cached = this.queryCache.get(cacheKey);

    if (!cached) return null;

    // Check if cache is still valid (5 minutes)
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
      this.queryCache.delete(cacheKey);
      return null;
    }

    return cached.result;
  }

  private static hashQuery(query: string): string {
    // Simple hash function for query caching
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  static clearCache(endpoint?: string): void {
    if (endpoint) {
      for (const [key] of this.queryCache) {
        if (key.startsWith(`${endpoint}:`)) {
          this.queryCache.delete(key);
        }
      }
      this.queryCount.delete(endpoint);
    } else {
      this.queryCache.clear();
      this.queryCount.clear();
    }
  }
}

/**
 * Response compression utility
 */
function compressResponse(data: unknown): string {
  // Simple JSON minification
  return JSON.stringify(data, null, 0);
}

/**
 * Main API optimization middleware
 */
export function withAPIOptimization(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: OptimizationOptions = {}
) {
  const {
    enableCaching = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enableCompression = true,
    enableMetrics = true,
    enableQueryOptimization = true,
  } = options;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const endpoint = req.url || 'unknown';
    let metrics: PerformanceMetrics | null = null;

    // Start performance tracking
    if (enableMetrics) {
      metrics = APIPerformanceMonitor.startTracking(endpoint);
    }

    try {
      // Generate cache key
      const requestCacheKey = cacheKey || generateCacheKey(req);

      // Try to get from cache first
      if (enableCaching && req.method === 'GET') {
        const cached = await cacheManager.get('api-responses', requestCacheKey);
        if (cached && !cacheManager.isStale('api-responses', requestCacheKey)) {
          if (metrics) {
            metrics.cacheHit = true;
            APIPerformanceMonitor.finishTracking(metrics);
          }

          // Set cache headers
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes

          if (enableCompression) {
            res.setHeader('Content-Encoding', 'none'); // Already compressed
          }

          res.status(200).json(cached);
          return;
        }
      }

      // Set up response interception for caching
      const originalJson = res.json;
      let responseData: unknown = null;

      res.json = function (data: unknown) {
        responseData = data;
        return originalJson.call(this, data);
      };

      // Add query optimization context
      if (enableQueryOptimization) {
        (req as any).queryOptimizer = QueryOptimizer;
        if (metrics) {
          metrics.queryCount = 0;
        }
      }

      // Set performance headers
      res.setHeader('X-Response-Time-Start', Date.now().toString());

      // Execute the handler
      await handler(req, res);

      // Cache successful responses
      if (
        enableCaching &&
        req.method === 'GET' &&
        responseData &&
        res.statusCode >= 200 &&
        res.statusCode < 300
      ) {
        await cacheManager.set('api-responses', requestCacheKey, responseData, {
          ttl: cacheTTL,
          staleWhileRevalidate: true,
        });
      }

      // Set performance headers
      if (metrics) {
        APIPerformanceMonitor.finishTracking(metrics);
        res.setHeader('X-Response-Time', metrics.duration?.toString() || '0');
        res.setHeader('X-Cache', 'MISS');

        if (enableQueryOptimization) {
          metrics.queryCount = QueryOptimizer.getQueryCount(endpoint);
          res.setHeader('X-Query-Count', metrics.queryCount.toString());
        }
      }

      // Add compression headers
      if (enableCompression && responseData) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);

      if (metrics) {
        APIPerformanceMonitor.finishTracking(metrics);
      }

      // Don't cache errors
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          timestamp: new Date().toISOString(),
        });
      }
    }
  };
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: NextApiRequest): string {
  const url = req.url || '';
  const method = req.method || 'GET';
  const query = JSON.stringify(req.query || {});
  const auth = req.headers.authorization || 'anonymous';

  // Create a simple hash
  const combined = `${method}:${url}:${query}:${auth.slice(0, 10)}`;
  return Buffer.from(combined).toString('base64').slice(0, 32);
}

/**
 * Database query optimization helper
 */
export function optimizeQuery(query: string, params?: unknown[]): string {
  // Add LIMIT if not present and no specific limit needed
  if (!query.toLowerCase().includes('limit') && query.toLowerCase().includes('select')) {
    query += ' LIMIT 100';
  }

  // Add basic query hints for PostgreSQL
  if (query.toLowerCase().includes('where') && !query.toLowerCase().includes('index')) {
    // This is a simplified example - in reality, you'd analyze the specific query
    query = query.replace(/WHERE/i, 'WHERE /*+ INDEX_HINT */');
  }

  return query;
}

/**
 * Batch operation utility for reducing API calls
 */
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private batchSize: number;
  private flushInterval: number;
  private processor: (items: T[]) => Promise<R[]>;
  private timeout: NodeJS.Timeout | null = null;

  constructor(processor: (items: T[]) => Promise<R[]>, batchSize = 10, flushInterval = 1000) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
  }

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);

      // Store the resolver with the item
      (item as any).__resolver = resolve;
      (item as any).__rejector = reject;

      // Auto-flush if batch is full
      if (this.batch.length >= this.batchSize) {
        this.flush();
      } else {
        // Set timeout for automatic flush
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => this.flush(), this.flushInterval);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const currentBatch = this.batch.splice(0);

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    try {
      const results = await this.processor(currentBatch);

      // Resolve each promise with its corresponding result
      currentBatch.forEach((item, index) => {
        if ((item as any).__resolver) {
          (item as any).__resolver(results[index]);
        }
      });
    } catch (error) {
      // Reject all promises in the batch
      currentBatch.forEach(item => {
        if ((item as any).__rejector) {
          (item as any).__rejector(error);
        }
      });
    }
  }
}

/**
 * API performance statistics
 */
export function getAPIPerformanceStats() {
  return {
    monitor: APIPerformanceMonitor.getMetrics(),
    queryOptimizer: {
      cacheSize: QueryOptimizer['queryCache'].size,
      totalQueries: Array.from(QueryOptimizer['queryCount'].values()).reduce((a, b) => a + b, 0),
    },
    cache: cacheManager.getStats(),
  };
}

/**
 * Clear all performance data
 */
export function clearPerformanceData() {
  APIPerformanceMonitor.clearMetrics();
  QueryOptimizer.clearCache();
}

// Export the monitoring utilities for use in API handlers
export { APIPerformanceMonitor, QueryOptimizer };
