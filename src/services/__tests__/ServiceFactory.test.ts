import { ServiceFactory, ServiceRegistry } from '../ServiceFactory';
import { BaseService } from '../BaseService';
import { getLogger } from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger');
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockGetLogger = getLogger as jest.Mock;
mockGetLogger.mockReturnValue(mockLogger);

// Create test services
class TestServiceA extends BaseService {
  constructor() {
    super('test-service-a');
  }
  
  async testMethodA(): Promise<string> {
    return 'service-a-result';
  }
}

class TestServiceB extends BaseService {
  constructor(dependency: TestServiceA) {
    super('test-service-b');
    this.dependency = dependency;
  }
  
  private dependency: TestServiceA;
  
  async testMethodB(): Promise<string> {
    const result = await this.dependency.testMethodA();
    return `service-b-with-${result}`;
  }
}

describe('ServiceFactory', () => {
  let factory: ServiceFactory;
  let registry: ServiceRegistry;

  beforeEach(() => {
    factory = new ServiceFactory();
    registry = ServiceRegistry.getInstance();
    
    // Clear registry before each test
    registry.clear();
    jest.clearAllMocks();
  });

  describe('ServiceRegistry', () => {
    it('should maintain singleton instance', () => {
      const registry1 = ServiceRegistry.getInstance();
      const registry2 = ServiceRegistry.getInstance();
      
      expect(registry1).toBe(registry2);
    });

    it('should register service constructors', () => {
      registry.register('testA', TestServiceA);
      
      expect(registry.has('testA')).toBe(true);
      expect(registry.get('testA')).toBe(TestServiceA);
    });

    it('should handle service dependencies', () => {
      registry.register('testA', TestServiceA);
      registry.register('testB', TestServiceB, ['testA']);
      
      const dependencies = registry.getDependencies('testB');
      expect(dependencies).toEqual(['testA']);
    });

    it('should list all registered services', () => {
      registry.register('testA', TestServiceA);
      registry.register('testB', TestServiceB, ['testA']);
      
      const services = registry.list();
      expect(services).toEqual(['testA', 'testB']);
    });

    it('should clear all registrations', () => {
      registry.register('testA', TestServiceA);
      registry.register('testB', TestServiceB);
      
      registry.clear();
      
      expect(registry.list()).toHaveLength(0);
      expect(registry.has('testA')).toBe(false);
      expect(registry.has('testB')).toBe(false);
    });
  });

  describe('ServiceFactory', () => {
    beforeEach(() => {
      registry.register('testA', TestServiceA);
      registry.register('testB', TestServiceB, ['testA']);
    });

    it('should create service instances', async () => {
      const serviceA = await factory.create<TestServiceA>('testA');
      
      expect(serviceA).toBeInstanceOf(TestServiceA);
      expect(serviceA.getServiceName()).toBe('test-service-a');
    });

    it('should handle service dependencies', async () => {
      const serviceB = await factory.create<TestServiceB>('testB');
      
      expect(serviceB).toBeInstanceOf(TestServiceB);
      expect(serviceB.getServiceName()).toBe('test-service-b');
      
      const result = await serviceB.testMethodB();
      expect(result).toBe('service-b-with-service-a-result');
    });

    it('should cache service instances (singleton pattern)', async () => {
      const serviceA1 = await factory.create<TestServiceA>('testA');
      const serviceA2 = await factory.create<TestServiceA>('testA');
      
      expect(serviceA1).toBe(serviceA2);
    });

    it('should throw error for unregistered services', async () => {
      await expect(factory.create('nonexistent')).rejects.toThrow(
        'Service "nonexistent" is not registered'
      );
    });

    it('should handle circular dependencies', async () => {
      // Register services with circular dependency
      class ServiceX extends BaseService {
        constructor(serviceY: ServiceY) {
          super('service-x');
        }
      }
      
      class ServiceY extends BaseService {
        constructor(serviceX: ServiceX) {
          super('service-y');
        }
      }
      
      registry.register('serviceX', ServiceX, ['serviceY']);
      registry.register('serviceY', ServiceY, ['serviceX']);
      
      await expect(factory.create('serviceX')).rejects.toThrow(
        'Circular dependency detected'
      );
    });

    it('should resolve complex dependency graphs', async () => {
      // Create a more complex dependency graph: D -> B,C -> A
      class ServiceC extends BaseService {
        constructor(serviceA: TestServiceA) {
          super('service-c');
        }
      }
      
      class ServiceD extends BaseService {
        constructor(serviceB: TestServiceB, serviceC: ServiceC) {
          super('service-d');
        }
      }
      
      registry.register('serviceC', ServiceC, ['testA']);
      registry.register('serviceD', ServiceD, ['testB', 'serviceC']);
      
      const serviceD = await factory.create<ServiceD>('serviceD');
      expect(serviceD).toBeInstanceOf(ServiceD);
      expect(serviceD.getServiceName()).toBe('service-d');
    });

    it('should get service instance without creating new one', async () => {
      const created = await factory.create<TestServiceA>('testA');
      const retrieved = factory.get<TestServiceA>('testA');
      
      expect(retrieved).toBe(created);
    });

    it('should return undefined for non-existent service when using get', () => {
      const service = factory.get('nonexistent');
      expect(service).toBeUndefined();
    });

    it('should check if service exists', async () => {
      expect(factory.has('testA')).toBe(false);
      
      await factory.create('testA');
      
      expect(factory.has('testA')).toBe(true);
    });

    it('should destroy service instances', async () => {
      const service = await factory.create<TestServiceA>('testA');
      
      expect(factory.has('testA')).toBe(true);
      
      await factory.destroy('testA');
      
      expect(factory.has('testA')).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service destroyed',
        expect.objectContaining({
          serviceName: 'testA'
        })
      );
    });

    it('should destroy all service instances', async () => {
      await factory.create('testA');
      await factory.create('testB');
      
      expect(factory.has('testA')).toBe(true);
      expect(factory.has('testB')).toBe(true);
      
      await factory.destroyAll();
      
      expect(factory.has('testA')).toBe(false);
      expect(factory.has('testB')).toBe(false);
    });

    it('should get service health status', async () => {
      await factory.create('testA');
      
      const health = await factory.getServiceHealth('testA');
      
      expect(health).toEqual({
        service: 'test-service-a',
        status: 'healthy',
        timestamp: expect.any(Date),
        version: expect.any(String),
        metadata: expect.any(Object)
      });
    });

    it('should get health status for all services', async () => {
      await factory.create('testA');
      await factory.create('testB');
      
      const healthMap = await factory.getAllServicesHealth();
      
      expect(healthMap).toHaveProperty('testA');
      expect(healthMap).toHaveProperty('testB');
      expect(healthMap.testA.service).toBe('test-service-a');
      expect(healthMap.testB.service).toBe('test-service-b');
    });
  });

  describe('Error Handling', () => {
    it('should handle service creation errors gracefully', async () => {
      class FailingService extends BaseService {
        constructor() {
          super('failing-service');
          throw new Error('Service initialization failed');
        }
      }
      
      registry.register('failing', FailingService);
      
      await expect(factory.create('failing')).rejects.toThrow(
        'Service initialization failed'
      );
    });

    it('should handle missing dependencies', async () => {
      registry.register('testB', TestServiceB, ['nonexistent']);
      
      await expect(factory.create('testB')).rejects.toThrow(
        'Service "nonexistent" is not registered'
      );
    });
  });
});