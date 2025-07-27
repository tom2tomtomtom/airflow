import { BaseService, ServiceHealth } from './BaseService';
import { getLogger } from '@/lib/logger';
import { ServiceLogContext } from '@/types/services';

// Lazy load logger to allow for proper mocking in tests
let logger: any = null;
const getLoggerInstance = () => {
  if (!logger) {
    logger = getLogger('service-factory');
  }
  return logger;
};

/**
 * Service constructor type
 */
export type ServiceConstructor<T extends BaseService = BaseService> = new (...args: any[]) => T;

/**
 * Service registration information
 */
export interface ServiceRegistration {
  constructor: ServiceConstructor;
  dependencies: string[];
  singleton: boolean;
  config?: Record<string, any>;
}

/**
 * Service registry for managing service registrations and dependencies
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services = new Map<string, ServiceRegistration>();

  private constructor() {}

  /**
   * Get singleton instance of service registry
   */
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service with its dependencies
   */
  public register<T extends BaseService>(
    name: string,
    constructor: ServiceConstructor<T>,
    dependencies: string[] = [],
    config: Record<string, any> = {},
    singleton = true
  ): void {
    this.services.set(name, {
      constructor,
      dependencies,
      singleton,
      config,
    });

    getLoggerInstance().info('Service registered', {
      serviceName: name,
      dependencies,
      singleton,
    } as ServiceLogContext);
  }

  /**
   * Check if a service is registered
   */
  public has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get service registration
   */
  public get(name: string): ServiceConstructor | undefined {
    const registration = this.services.get(name);
    return registration?.constructor;
  }

  /**
   * Get service registration info
   */
  public getRegistration(name: string): ServiceRegistration | undefined {
    return this.services.get(name);
  }

  /**
   * Get service dependencies
   */
  public getDependencies(name: string): string[] {
    const registration = this.services.get(name);
    return registration?.dependencies || [];
  }

  /**
   * List all registered services
   */
  public list(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all registrations (mainly for testing)
   */
  public clear(): void {
    this.services.clear();
    getLoggerInstance().info('Service registry cleared');
  }

  /**
   * Validate service dependencies
   */
  public validateDependencies(name: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(name)) {
      throw new Error(
        `Circular dependency detected: ${Array.from(visited).join(' -> ')} -> ${name}`
      );
    }

    const registration = this.services.get(name);
    if (!registration) {
      throw new Error(`Service "${name}" is not registered`);
    }

    visited.add(name);

    for (const dependency of registration.dependencies) {
      this.validateDependencies(dependency, new Set(visited));
    }

    return true;
  }
}

/**
 * Service factory for creating and managing service instances
 */
export class ServiceFactory {
  private instances = new Map<string, BaseService>();
  private registry: ServiceRegistry;
  private initializationPromises = new Map<string, Promise<BaseService>>();

  constructor() {
    this.registry = ServiceRegistry.getInstance();
  }

  /**
   * Create or get a service instance
   */
  public async create<T extends BaseService>(name: string): Promise<T> {
    // Check if instance already exists (singleton pattern)
    const existing = this.instances.get(name);
    if (existing) {
      return existing as T;
    }

    // Check if initialization is in progress
    const initPromise = this.initializationPromises.get(name);
    if (initPromise) {
      return initPromise as Promise<T>;
    }

    // Start new initialization
    const promise = this.initializeService<T>(name);
    this.initializationPromises.set(name, promise);

    try {
      const instance = await promise;
      this.instances.set(name, instance);
      this.initializationPromises.delete(name);
      return instance;
    } catch (error) {
      this.initializationPromises.delete(name);
      throw error;
    }
  }

  /**
   * Get an existing service instance without creating it
   */
  public get<T extends BaseService>(name: string): T | undefined {
    return this.instances.get(name) as T | undefined;
  }

  /**
   * Check if service instance exists
   */
  public has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Destroy a service instance
   */
  public async destroy(name: string): Promise<void> {
    const instance = this.instances.get(name);
    if (instance) {
      try {
        await instance.cleanup();
      } catch (error: any) {
        getLoggerInstance().error('Error during service cleanup', error, {
          serviceName: name,
        } as ServiceLogContext);
      }

      this.instances.delete(name);

      getLoggerInstance().info('Service destroyed', {
        serviceName: name,
      } as ServiceLogContext);
    }
  }

  /**
   * Destroy all service instances
   */
  public async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this.instances.keys()).map(name => this.destroy(name));
    await Promise.all(destroyPromises);

    getLoggerInstance().info('All services destroyed');
  }

  /**
   * Get health status for a specific service
   */
  public async getServiceHealth(name: string): Promise<ServiceHealth | undefined> {
    const instance = this.instances.get(name);
    if (!instance) {
      return undefined;
    }

    try {
      return await instance.healthCheck();
    } catch (error: any) {
      getLoggerInstance().error('Health check failed', error, {
        serviceName: name,
      } as ServiceLogContext);

      return {
        service: instance.getServiceName(),
        status: 'unhealthy',
        timestamp: new Date(),
        version: instance.getVersion(),
        metadata: { error: error.message },
      };
    }
  }

  /**
   * Get health status for all services
   */
  public async getAllServicesHealth(): Promise<Record<string, ServiceHealth>> {
    const healthPromises = Array.from(this.instances.entries()).map(async ([name, instance]) => {
      const health = await this.getServiceHealth(name);
      return [name, health] as [string, ServiceHealth];
    });

    const healthResults = await Promise.all(healthPromises);
    return Object.fromEntries(healthResults.filter(([, health]) => health !== undefined));
  }

  /**
   * Initialize a service with its dependencies
   */
  private async initializeService<T extends BaseService>(name: string): Promise<T> {
    getLoggerInstance().info('Initializing service', {
      serviceName: name,
    } as ServiceLogContext);

    // Validate dependencies first
    this.registry.validateDependencies(name);

    const registration = this.registry.getRegistration(name);
    if (!registration) {
      throw new Error(`Service "${name}" is not registered`);
    }

    // Create dependency instances
    const dependencies = await this.resolveDependencies(registration.dependencies);

    // Create service instance
    const ServiceClass = registration.constructor;
    const instance = new ServiceClass(...dependencies) as T;

    // Initialize the service
    await instance.initialize();

    getLoggerInstance().info('Service initialized successfully', {
      serviceName: name,
      serviceType: instance.getServiceName(),
      version: instance.getVersion(),
    } as ServiceLogContext);

    return instance;
  }

  /**
   * Resolve service dependencies
   */
  private async resolveDependencies(dependencies: string[]): Promise<BaseService[]> {
    const resolvedDependencies: BaseService[] = [];

    for (const depName of dependencies) {
      const dependency = await this.create(depName);
      resolvedDependencies.push(dependency);
    }

    return resolvedDependencies;
  }

  /**
   * Get service initialization order based on dependencies
   */
  public getInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving service: ${name}`);
      }

      if (visited.has(name)) {
        return;
      }

      visiting.add(name);

      const dependencies = this.registry.getDependencies(name);
      for (const dep of dependencies) {
        visit(dep);
      }

      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const serviceName of this.registry.list()) {
      if (!visited.has(serviceName)) {
        visit(serviceName);
      }
    }

    return order;
  }

  /**
   * Initialize all registered services in dependency order
   */
  public async initializeAll(): Promise<void> {
    const initOrder = this.getInitializationOrder();

    getLoggerInstance().info('Initializing all services', {
      services: initOrder,
      count: initOrder.length,
    } as ServiceLogContext);

    for (const serviceName of initOrder) {
      try {
        await this.create(serviceName);
      } catch (error: any) {
        getLoggerInstance().error(
          'Failed to initialize service during bulk initialization',
          error,
          {
            serviceName,
            initOrder,
          } as ServiceLogContext
        );
        throw error;
      }
    }

    getLoggerInstance().info('All services initialized successfully', {
      count: initOrder.length,
    } as ServiceLogContext);
  }
}

// Singleton factory instance
let factoryInstance: ServiceFactory | null = null;

/**
 * Get the singleton service factory instance
 */
export const getServiceFactory = (): ServiceFactory => {
  if (!factoryInstance) {
    factoryInstance = new ServiceFactory();
  }
  return factoryInstance;
};

/**
 * Convenience function to register a service
 */
export const registerService = <T extends BaseService>(
  name: string,
  constructor: ServiceConstructor<T>,
  dependencies: string[] = [],
  config: Record<string, any> = {}
): void => {
  const registry = ServiceRegistry.getInstance();
  registry.register(name, constructor, dependencies, config);
};

/**
 * Convenience function to create a service instance
 */
export const createService = <T extends BaseService>(name: string): Promise<T> => {
  const factory = getServiceFactory();
  return factory.create<T>(name);
};

/**
 * Convenience function to get an existing service instance
 */
export const getService = <T extends BaseService>(name: string): T | undefined => {
  const factory = getServiceFactory();
  return factory.get<T>(name);
};
