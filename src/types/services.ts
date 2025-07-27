/**
 * Service Type Declarations
 *
 * Provides proper TypeScript type patterns for service modules
 * to resolve type conflicts and establish consistency.
 *
 * This addresses Task 2.5 of TypeScript Error Resolution and
 * extends to support the new service layer architecture.
 */

import { LogContext } from '@/lib/logger/structured';

// ===== CORE SERVICE INTERFACES =====

/**
 * Base service configuration interface
 */
export interface BaseServiceConfig {
  name: string;
  version?: string;
  enabled?: boolean;
  dependencies?: string[];
  config?: Record<string, any>;
}

/**
 * Service health status interface
 */
export interface ServiceHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  metadata?: Record<string, any>;
}

/**
 * Service metrics interface
 */
export interface ServiceMetricsData {
  operationCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastOperationTime?: Date;
  customMetrics: Record<string, number>;
}

/**
 * Service operation result interface
 */
export interface ServiceOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Service dependency injection interface
 */
export interface ServiceDependency {
  name: string;
  required: boolean;
  version?: string;
}

// ===== SERVICE ERROR PATTERNS =====

/**
 * Extended LogContext for service operations
 * Allows any service-specific data while maintaining core structure
 */
export interface ServiceLogContext extends LogContext {
  service?: string;
  operation?: string;
  version?: string;
  [key: string]: any;
}

/**
 * Standard service error interface
 */
export interface ServiceError {
  message: string;
  code?: string | number;
  details?: Record<string, any>;
  service?: string;
  operation?: string;
  timestamp?: Date;
  [key: string]: any; // Allow additional properties
}

/**
 * Extended ErrorContext for services
 */
export interface ServiceErrorContext {
  route: string;
  metadata?: Record<string, any>;
  error?: ServiceError;
  service?: string;
  operation?: string;
  [key: string]: any;
}

/**
 * Service retry configuration
 */
export interface ServiceRetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

// ===== SERVICE LAYER SPECIFIC TYPES =====

/**
 * Client service operation types
 */
export interface ClientServiceConfig extends BaseServiceConfig {
  cacheEnabled?: boolean;
  cacheTtl?: number;
  enableFiltering?: boolean;
  enableValidation?: boolean;
}

/**
 * Asset service operation types
 */
export interface AssetServiceConfig extends BaseServiceConfig {
  uploadPath?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  enableCompression?: boolean;
  enableThumbnails?: boolean;
}

/**
 * Campaign service operation types
 */
export interface CampaignServiceConfig extends BaseServiceConfig {
  enableValidation?: boolean;
  enableAnalytics?: boolean;
  exportFormats?: string[];
  matrixGenerationEnabled?: boolean;
}

/**
 * Authentication service operation types
 */
export interface AuthServiceConfig extends BaseServiceConfig {
  tokenTtl?: number;
  refreshTokenTtl?: number;
  sessionTtl?: number;
  enableMfa?: boolean;
  enablePasswordPolicy?: boolean;
}

/**
 * API service configuration
 */
export interface ApiServiceConfig extends BaseServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retryConfig?: ServiceRetryConfig;
  enableRequestLogging?: boolean;
  enableResponseCaching?: boolean;
}

// ===== EXISTING SERVICE TYPES (MAINTAINED FOR COMPATIBILITY) =====

/**
 * Asset Manager specific types
 */
export interface AssetManagerLogContext extends ServiceLogContext {
  assetId?: string;
  bucket?: string;
  path?: string;
  operation?: 'upload' | 'delete' | 'analyze' | 'optimize';
}

/**
 * Copy length constraints mapping
 */
export interface CopyLengthConstraints {
  headline: { short: number; medium: number; long: number };
  subheadline: { short: number; medium: number; long: number };
  body: { short: number; medium: number; long: number };
  cta: { short: number; medium: number; long: number };
  tagline: { short: number; medium: number; long: number };
  social: { short: number; medium: number; long: number };
  [key: string]: any; // Allow additional copy types
}

/**
 * Copy generation options
 */
export interface CopyGenerationOptions {
  type: keyof CopyLengthConstraints;
  length: 'short' | 'medium' | 'long';
  context?: Record<string, any>;
  constraints?: Partial<CopyLengthConstraints>;
}

/**
 * Motivation generation options
 */
export interface MotivationGenerationOptions {
  briefId: string;
  targetAudience?: string;
  goals?: string[];
  context?: Record<string, any>;
  [key: string]: any;
}

/**
 * Motivation validation result
 */
export interface MotivationValidationResult {
  valid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Review system context
 */
export interface ReviewSystemContext extends ServiceLogContext {
  reviewId?: string;
  itemType?: string;
  itemId?: string;
  reviewerId?: string;
  action?: 'create' | 'update' | 'approve' | 'reject';
}

// ===== SERVICE FACTORY TYPES =====

/**
 * Service constructor type
 */
export type ServiceConstructor<T = any> = new (...args: any[]) => T;

/**
 * Service registration interface
 */
export interface ServiceRegistrationInfo {
  constructor: ServiceConstructor;
  dependencies: string[];
  singleton: boolean;
  config?: Record<string, any>;
}

/**
 * Service lifecycle hooks
 */
export interface ServiceLifecycleHooks {
  beforeInitialize?: () => Promise<void>;
  afterInitialize?: () => Promise<void>;
  beforeDestroy?: () => Promise<void>;
  afterDestroy?: () => Promise<void>;
}

// ===== CACHE SERVICE TYPES =====

/**
 * Cache operation context
 */
export interface CacheServiceContext extends ServiceLogContext {
  cacheKey?: string;
  operation?: 'get' | 'set' | 'delete' | 'clear';
  ttl?: number;
  compressed?: boolean;
}

/**
 * Cache strategy configuration
 */
export interface CacheStrategyConfig {
  name: string;
  ttl: number;
  maxSize?: number;
  compressionEnabled?: boolean;
  serializationFormat?: 'json' | 'msgpack';
}

// ===== UTILITY TYPE HELPERS =====

/**
 * Helper to convert any error-like object to ServiceLogContext
 */
export function toServiceLogContext(
  error: any,
  additionalContext?: Record<string, any>
): ServiceLogContext {
  const baseContext: ServiceLogContext = {
    error: error?.message || String(error),
    ...additionalContext,
  };

  // If error has properties, spread them in
  if (error && typeof error === 'object') {
    Object.keys(error).forEach(key => {
      if (typeof error[key] !== 'function') {
        baseContext[key] = error[key];
      }
    });
  }

  return baseContext;
}

/**
 * Helper to ensure ErrorContext compatibility
 */
export function toErrorContext(context: Record<string, any>): ServiceErrorContext {
  return {
    route: context.route || 'unknown',
    metadata: context.metadata,
    error: context.error,
    service: context.service,
    operation: context.operation,
    ...context,
  };
}

/**
 * Helper to create service operation result
 */
export function createServiceResult<T>(
  success: boolean,
  data?: T,
  error?: ServiceError,
  metadata?: Record<string, any>
): ServiceOperationResult<T> {
  return {
    success,
    data,
    error,
    metadata,
    timestamp: new Date(),
  };
}

/**
 * Helper to create service error
 */
export function createServiceError(
  message: string,
  service?: string,
  operation?: string,
  code?: string | number,
  details?: Record<string, any>
): ServiceError {
  return {
    message,
    service,
    operation,
    code,
    details,
    timestamp: new Date(),
  };
}

// ===== TYPE GUARDS =====

/**
 * Type guard for ServiceError
 */
export function isServiceError(error: any): error is ServiceError {
  return error && typeof error === 'object' && typeof error.message === 'string';
}

/**
 * Type guard for proper LogContext
 */
export function isValidLogContext(context: any): context is ServiceLogContext {
  return context && typeof context === 'object';
}

/**
 * Type guard for ServiceOperationResult
 */
export function isServiceOperationResult<T>(result: any): result is ServiceOperationResult<T> {
  return (
    result &&
    typeof result === 'object' &&
    typeof result.success === 'boolean' &&
    result.timestamp instanceof Date
  );
}

/**
 * Type guard for BaseServiceConfig
 */
export function isBaseServiceConfig(config: any): config is BaseServiceConfig {
  return config && typeof config === 'object' && typeof config.name === 'string';
}

// ===== GENERIC SERVICE INTERFACES =====

/**
 * Generic CRUD service interface
 */
export interface CrudService<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  create(data: CreateData): Promise<ServiceOperationResult<T>>;
  read(id: string): Promise<ServiceOperationResult<T>>;
  update(id: string, data: UpdateData): Promise<ServiceOperationResult<T>>;
  delete(id: string): Promise<ServiceOperationResult<boolean>>;
  list(filters?: Record<string, any>): Promise<ServiceOperationResult<T[]>>;
}

/**
 * Generic validation service interface
 */
export interface ValidationService<T> {
  validate(data: T): Promise<ServiceOperationResult<boolean>>;
  validatePartial(data: Partial<T>): Promise<ServiceOperationResult<boolean>>;
  getValidationRules(): Record<string, any>;
}

/**
 * Generic caching service interface
 */
export interface CachingService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

/**
 * Generic event service interface
 */
export interface EventService {
  emit(eventName: string, data: any): Promise<void>;
  subscribe(eventName: string, handler: (data: any) => void): void;
  unsubscribe(eventName: string, handler: (data: any) => void): void;
}

// ===== HOOK AND DECORATOR TYPES =====

/**
 * Service method decorator options
 */
export interface ServiceDecoratorOptions {
  operationName?: string;
  enableMetrics?: boolean;
  enableLogging?: boolean;
  enableErrorHandling?: boolean;
  enableCaching?: boolean;
  cacheOptions?: {
    keyPrefix: string;
    ttl?: number;
  };
}
