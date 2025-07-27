import { LoggerFactory, StructuredLogger } from '@/lib/logger/structured';
import { classifyError, ClassifiedError } from '@/lib/error-handling/error-classifier';
import { cached, CacheOptions } from '@/lib/cache/redis-cache';
import { ServiceLogContext, ServiceError } from '@/types/services';

/**
 * Service health status interface
 */
export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  metadata?: Record<string, any>;
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  name: string;
  version?: string;
  enabled?: boolean;
  dependencies?: string[];
  config?: Record<string, any>;
}

/**
 * Service metrics interface
 */
export interface ServiceMetrics {
  operationCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastOperationTime?: Date;
  customMetrics: Record<string, number>;
}

/**
 * Abstract base class for all services in the application.
 * Provides common functionality including logging, error handling, caching, and lifecycle management.
 */
export abstract class BaseService {
  protected readonly logger: StructuredLogger;
  protected readonly serviceName: string;
  protected readonly version: string;
  protected isInitialized = false;
  protected metrics: ServiceMetrics;

  constructor(serviceName: string, version = '1.0.0') {
    this.serviceName = serviceName;
    this.version = version;
    this.logger = LoggerFactory.getLogger(serviceName);
    this.metrics = {
      operationCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      customMetrics: {},
    };

    this.logger.info('Service instance created', {
      service: serviceName,
      version: this.version,
    } as ServiceLogContext);
  }

  /**
   * Get the service name
   */
  public getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Get the service version
   */
  public getVersion(): string {
    return this.version;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Initialize the service. Override in subclasses for custom initialization logic.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Service already initialized', {
        service: this.serviceName,
      } as ServiceLogContext);
      return;
    }

    try {
      await this.performInitialization();
      this.isInitialized = true;

      this.logger.info('Service initialized', {
        service: this.serviceName,
        version: this.version,
      } as ServiceLogContext);
    } catch (error: any) {
      const classified = this.classifyServiceError(error, 'initialize');
      this.logger.error('Service initialization failed', classified.originalError, {
        service: this.serviceName,
        errorType: classified.type,
      } as ServiceLogContext);
      throw error;
    }
  }

  /**
   * Cleanup the service. Override in subclasses for custom cleanup logic.
   */
  public async cleanup(): Promise<void> {
    try {
      await this.performCleanup();
      this.isInitialized = false;

      this.logger.info('Service cleanup completed', {
        service: this.serviceName,
      } as ServiceLogContext);
    } catch (error: any) {
      const classified = this.classifyServiceError(error, 'cleanup');
      this.logger.error('Service cleanup failed', classified.originalError, {
        service: this.serviceName,
        errorType: classified.type,
      } as ServiceLogContext);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  public async healthCheck(): Promise<ServiceHealth> {
    try {
      const customHealth = await this.performHealthCheck();

      return {
        service: this.serviceName,
        status: 'healthy',
        timestamp: new Date(),
        version: this.version,
        metadata: {
          initialized: this.isInitialized,
          metrics: this.metrics,
          ...customHealth,
        },
      };
    } catch (error: any) {
      this.logger.error('Health check failed', error, {
        service: this.serviceName,
      } as ServiceLogContext);

      return {
        service: this.serviceName,
        status: 'unhealthy',
        timestamp: new Date(),
        version: this.version,
        metadata: {
          error: error.message,
          initialized: this.isInitialized,
        },
      };
    }
  }

  /**
   * Get service metrics
   */
  public getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Record a custom metric
   */
  public recordMetric(name: string, value: number): void {
    this.metrics.customMetrics[name] = value;

    this.logger.debug('Metric recorded', {
      service: this.serviceName,
      metric: name,
      value,
    } as ServiceLogContext);
  }

  /**
   * Log an operation with context
   */
  protected logOperation(operation: string, context: Record<string, any> = {}): void {
    this.logger.info(operation, {
      service: this.serviceName,
      operation,
      ...context,
    } as ServiceLogContext);
  }

  /**
   * Classify and handle service errors consistently
   */
  protected classifyServiceError(error: Error, operation?: string): ClassifiedError {
    const context = {
      route: this.serviceName,
      operation,
      service: this.serviceName,
      version: this.version,
    };

    const classified = classifyError(error, context);
    this.metrics.errorCount++;

    return classified;
  }

  /**
   * Wrap function with caching using the established cache infrastructure
   */
  public cached<T>(
    fn: () => Promise<T>,
    keyGenerator: () => string,
    options: CacheOptions = {}
  ): () => Promise<T> {
    return cached(fn, keyGenerator, options);
  }

  /**
   * Execute an operation with error handling and metrics tracking
   */
  public async executeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.operationCount++;

    try {
      this.logOperation(`${operationName} started`, context);

      const result = await operation();

      const duration = Date.now() - startTime;
      this.updateResponseTime(duration);
      this.metrics.lastOperationTime = new Date();

      this.logOperation(`${operationName} completed`, {
        ...context,
        duration,
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const classified = this.classifyServiceError(error, operationName);

      this.logger.error(`${operationName} failed`, classified.originalError, {
        service: this.serviceName,
        operation: operationName,
        duration,
        errorType: classified.type,
        ...context,
      } as ServiceLogContext);

      throw error;
    }
  }

  /**
   * Create a service-specific error
   */
  protected createServiceError(
    message: string,
    code?: string | number,
    details?: Record<string, any>
  ): ServiceError {
    return {
      message: `[${this.serviceName}] ${message}`,
      code,
      details: {
        service: this.serviceName,
        version: this.version,
        ...details,
      },
    };
  }

  /**
   * Validate service dependencies before operation
   */
  protected validateDependencies(dependencies: string[]): void {
    // This would typically check if required services are available
    // Implementation depends on the service registry
    this.logger.debug('Validating dependencies', {
      service: this.serviceName,
      dependencies,
    } as ServiceLogContext);
  }

  // Protected methods for subclass customization

  /**
   * Override this method for custom initialization logic
   */
  protected async performInitialization(): Promise<void> {
    // Default: no-op
  }

  /**
   * Override this method for custom cleanup logic
   */
  protected async performCleanup(): Promise<void> {
    // Default: no-op
  }

  /**
   * Override this method for custom health check logic
   */
  protected async performHealthCheck(): Promise<Record<string, any>> {
    return {};
  }

  // Private helper methods

  private updateResponseTime(duration: number): void {
    const totalTime =
      this.metrics.averageResponseTime * (this.metrics.operationCount - 1) + duration;
    this.metrics.averageResponseTime = totalTime / this.metrics.operationCount;
  }
}

/**
 * Service decorator for automatic error handling and logging
 */
export function ServiceOperation(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const opName = operationName || propertyKey;

    descriptor.value = async function (...args: any[]) {
      if (this instanceof BaseService) {
        return this.executeOperation(opName, () => originalMethod.apply(this, args));
      } else {
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Service method decorator for caching
 */
export function Cached(keyPrefix: string, options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (this instanceof BaseService) {
        const keyGenerator = () => `${keyPrefix}:${JSON.stringify(args)}`;
        const cachedFn = this.cached(() => originalMethod.apply(this, args), keyGenerator, options);
        return cachedFn();
      } else {
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}
