import { getLogger } from '@/lib/logger';
import { BaseServiceConfig, ServiceLogContext } from '@/types/services';

const logger = getLogger('service-config');

/**
 * Service configuration manager
 * Handles loading, validation, and management of service configurations
 */
export class ServiceConfigManager {
  private static instance: ServiceConfigManager;
  private configs = new Map<string, BaseServiceConfig>();
  private defaultConfigs = new Map<string, Partial<BaseServiceConfig>>();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ServiceConfigManager {
    if (!ServiceConfigManager.instance) {
      ServiceConfigManager.instance = new ServiceConfigManager();
    }
    return ServiceConfigManager.instance;
  }

  /**
   * Register a default configuration for a service
   */
  public registerDefault(serviceName: string, config: Partial<BaseServiceConfig>): void {
    this.defaultConfigs.set(serviceName, config);

    logger.debug('Default service config registered', {
      serviceName,
      config,
    } as ServiceLogContext);
  }

  /**
   * Set configuration for a service
   */
  public setConfig(serviceName: string, config: BaseServiceConfig): void {
    // Merge with defaults if they exist
    const defaults = this.defaultConfigs.get(serviceName) || {};
    const mergedConfig = { ...defaults, ...config, name: serviceName };

    this.configs.set(serviceName, mergedConfig);

    logger.info('Service config updated', {
      serviceName,
      config: mergedConfig,
    } as ServiceLogContext);
  }

  /**
   * Get configuration for a service
   */
  public getConfig(serviceName: string): BaseServiceConfig | undefined {
    return this.configs.get(serviceName);
  }

  /**
   * Get configuration with defaults fallback
   */
  public getConfigWithDefaults(serviceName: string): BaseServiceConfig {
    const config = this.configs.get(serviceName);
    const defaults = this.defaultConfigs.get(serviceName) || {};

    return {
      name: serviceName,
      version: '1.0.0',
      enabled: true,
      dependencies: [],
      config: {},
      ...defaults,
      ...config,
    };
  }

  /**
   * Check if a service has configuration
   */
  public hasConfig(serviceName: string): boolean {
    return this.configs.has(serviceName);
  }

  /**
   * List all configured services
   */
  public listConfiguredServices(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Validate service configuration
   */
  public validateConfig(config: BaseServiceConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.name || typeof config.name !== 'string') {
      errors.push('Service name is required and must be a string');
    }

    if (config.version && typeof config.version !== 'string') {
      errors.push('Service version must be a string');
    }

    if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
      errors.push('Service enabled flag must be a boolean');
    }

    if (config.dependencies && !Array.isArray(config.dependencies)) {
      errors.push('Service dependencies must be an array');
    }

    if (config.config && typeof config.config !== 'object') {
      errors.push('Service config must be an object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Load configuration from environment variables
   */
  public loadFromEnvironment(serviceName: string): BaseServiceConfig | null {
    const envPrefix = `SERVICE_${serviceName.toUpperCase().replace(/-/g, '_')}`;

    const config: BaseServiceConfig = {
      name: serviceName,
      version: process.env[`${envPrefix}_VERSION`] || '1.0.0',
      enabled: process.env[`${envPrefix}_ENABLED`] !== 'false',
      dependencies: process.env[`${envPrefix}_DEPENDENCIES`]?.split(',') || [],
      config: this.parseConfigFromEnv(envPrefix),
    };

    const validation = this.validateConfig(config);
    if (!validation.valid) {
      logger.error('Invalid service config from environment', {
        serviceName,
        errors: validation.errors,
      } as ServiceLogContext);
      return null;
    }

    this.setConfig(serviceName, config);
    return config;
  }

  /**
   * Export all configurations
   */
  public exportConfigs(): Record<string, BaseServiceConfig> {
    const exported: Record<string, BaseServiceConfig> = {};

    for (const [serviceName, config] of this.configs.entries()) {
      exported[serviceName] = { ...config };
    }

    return exported;
  }

  /**
   * Import configurations
   */
  public importConfigs(configs: Record<string, BaseServiceConfig>): void {
    for (const [serviceName, config] of Object.entries(configs)) {
      const validation = this.validateConfig(config);
      if (validation.valid) {
        this.setConfig(serviceName, config);
      } else {
        logger.error('Invalid service config during import', {
          serviceName,
          errors: validation.errors,
        } as ServiceLogContext);
      }
    }
  }

  /**
   * Clear all configurations
   */
  public clear(): void {
    this.configs.clear();
    this.defaultConfigs.clear();
    logger.info('All service configurations cleared');
  }

  /**
   * Parse configuration from environment variables
   */
  private parseConfigFromEnv(envPrefix: string): Record<string, any> {
    const config: Record<string, any> = {};
    const configPrefix = `${envPrefix}_CONFIG_`;

    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(configPrefix)) {
        const configKey = key.substring(configPrefix.length).toLowerCase();
        config[configKey] = this.parseEnvValue(value || '');
      }
    }

    return config;
  }

  /**
   * Parse environment variable value to appropriate type
   */
  private parseEnvValue(value: string): any {
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Try to parse as number
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

    // Try to parse as JSON array or object
    if (
      (value.startsWith('{') && value.endsWith('}')) ||
      (value.startsWith('[') && value.endsWith(']'))
    ) {
      try {
        return JSON.parse(value);
      } catch {
        // Fall through to string
      }
    }

    // Return as string
    return value;
  }
}

/**
 * Default service configurations
 */
export const DEFAULT_SERVICE_CONFIGS: Record<string, Partial<BaseServiceConfig>> = {
  'client-service': {
    version: '1.0.0',
    enabled: true,
    config: {
      cacheEnabled: true,
      cacheTtl: 300, // 5 minutes
      enableFiltering: true,
      enableValidation: true,
    },
  },
  'asset-service': {
    version: '1.0.0',
    enabled: true,
    config: {
      uploadPath: '/tmp/uploads',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      enableCompression: true,
      enableThumbnails: true,
    },
  },
  'campaign-service': {
    version: '1.0.0',
    enabled: true,
    config: {
      enableValidation: true,
      enableAnalytics: true,
      exportFormats: ['pdf', 'png', 'jpg'],
      matrixGenerationEnabled: true,
    },
  },
  'auth-service': {
    version: '1.0.0',
    enabled: true,
    config: {
      tokenTtl: 3600, // 1 hour
      refreshTokenTtl: 86400 * 7, // 7 days
      sessionTtl: 86400, // 1 day
      enableMfa: false,
      enablePasswordPolicy: true,
    },
  },
  'api-service': {
    version: '1.0.0',
    enabled: true,
    config: {
      timeout: 30000, // 30 seconds
      enableRequestLogging: true,
      enableResponseCaching: true,
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', '5XX'],
      },
    },
  },
};

/**
 * Initialize default service configurations
 */
export function initializeDefaultConfigs(): void {
  const configManager = ServiceConfigManager.getInstance();

  for (const [serviceName, config] of Object.entries(DEFAULT_SERVICE_CONFIGS)) {
    configManager.registerDefault(serviceName, config);
  }

  logger.info('Default service configurations initialized', {
    services: Object.keys(DEFAULT_SERVICE_CONFIGS),
  } as ServiceLogContext);
}

/**
 * Get service configuration manager instance
 */
export const getServiceConfigManager = (): ServiceConfigManager => {
  return ServiceConfigManager.getInstance();
};

/**
 * Convenience function to get service config
 */
export const getServiceConfig = (serviceName: string): BaseServiceConfig => {
  return getServiceConfigManager().getConfigWithDefaults(serviceName);
};

/**
 * Convenience function to set service config
 */
export const setServiceConfig = (serviceName: string, config: BaseServiceConfig): void => {
  getServiceConfigManager().setConfig(serviceName, config);
};
