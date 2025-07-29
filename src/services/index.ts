/**
 * Service Layer Infrastructure
 *
 * This module exports the core service infrastructure including:
 * - BaseService abstract class
 * - ServiceFactory for dependency injection and service management
 * - ServiceRegistry for service registration
 * - ServiceConfigManager for configuration management
 * - Service decorators and utilities
 */

// Core service infrastructure
export { BaseService, ServiceOperation, Cached } from './BaseService';
export type { ServiceHealth, ServiceConfig, ServiceMetrics } from './BaseService';

// Service factory and registry
export {
  ServiceFactory,
  ServiceRegistry,
  getServiceFactory,
  registerService,
  createService,
  getService,
} from './ServiceFactory';
export type { ServiceConstructor, ServiceRegistration } from './ServiceFactory';

// Service configuration management
export {
  ServiceConfigManager,
  DEFAULT_SERVICE_CONFIGS,
  initializeDefaultConfigs,
  getServiceConfigManager,
  getServiceConfig,
  setServiceConfig,
} from './ServiceConfig';

// Re-export service types for convenience
export type {
  // Core service interfaces
  BaseServiceConfig,
  ServiceHealthStatus,
  ServiceMetricsData,
  ServiceOperationResult,
  ServiceDependency,

  // Error handling
  ServiceLogContext,
  ServiceError,
  ServiceErrorContext,
  ServiceRetryConfig,

  // Service-specific configs
  ClientServiceConfig,
  AssetServiceConfig,
  CampaignServiceConfig,
  AuthServiceConfig,
  ApiServiceConfig,

  // Factory and registration types
  ServiceRegistrationInfo,
  ServiceLifecycleHooks,

  // Cache types
  CacheServiceContext,
  CacheStrategyConfig,

  // Generic service interfaces
  CrudService,
  ValidationService,
  CachingService,
  EventService,

  // Decorator options
  ServiceDecoratorOptions,
} from '@/types/services';

// Re-export utility functions
export {
  toServiceLogContext,
  toErrorContext,
  createServiceResult,
  createServiceError,
  isServiceError,
  isValidLogContext,
  isServiceOperationResult,
  isBaseServiceConfig,
} from '@/types/services';

// Existing services (for backwards compatibility)
export { getCopyGenerator } from './copyGenerator';
export { getAssetManager } from './assetManager';
export { getMotivationGenerator } from './motivationGenerator';
export { getReviewSystem } from './reviewSystem';
export { getTemplateEngine } from './templateEngine';
export { getBriefParser } from './briefParser';
export { getExportEngine } from './exportEngine';
export { getCampaignRenderer } from './campaignRenderer';

/**
 * Initialize the service layer infrastructure
 * This should be called once during application startup
 */
export async function initializeServiceLayer(): Promise<void> {
  // Initialize default configurations
  // initializeDefaultConfigs(); // TODO: Fix circular dependency issue
  
  // The service factory will handle service registration and initialization
  // as services are created on demand
}

/**
 * Shutdown the service layer infrastructure
 * This should be called during application shutdown
 */
export async function shutdownServiceLayer(): Promise<void> {
  // const factory = getServiceFactory(); // TODO: Fix circular dependency issue
  // await factory.destroyAll();
}
