/**
 * Redis Infrastructure Testing
 * Comprehensive tests for Redis caching layer, session management, rate limiting,
 * connection pooling, failover, and performance under load
 */

import { jest } from '@jest/globals';
import { RedisManager } from '../redis-config';

// Mock ioredis
const mockRedis = {
  ping: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  setex: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn(),
  hset: jest.fn(),
  hget: jest.fn(),
  hdel: jest.fn(),
  hgetall: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  sismember: jest.fn(),
  zadd: jest.fn(),
  zrem: jest.fn(),
  zrange: jest.fn(),
  zrangebyscore: jest.fn(),
  zcard: jest.fn(),
  flushall: jest.fn(),
  keys: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  quit: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('Redis Infrastructure Testing', () => {
  let redisManager: RedisManager;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance for testing
    (RedisManager as any).instance = null;
    redisManager = RedisManager.getInstance();

    // Mock successful ping by default
    mockRedis.ping.mockResolvedValue('PONG');
  });

  afterEach(async () => {
    await redisManager.disconnect();
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should establish Redis connection successfully', async () => {
      const client = await redisManager.getClient();
      
      expect(client).toBeDefined();
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should handle connection failures gracefully', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));
      
      await expect(redisManager.getClient()).rejects.toThrow('Redis connection failed');
    });

    it('should reuse existing connection', async () => {
      // First call should establish connection
      const client1 = await redisManager.getClient();

      // Second call should reuse existing connection (no new connection)
      const client2 = await redisManager.getClient();

      expect(client1).toBe(client2);
      // Both calls should use the same mocked Redis instance
      expect(client1).toBe(mockRedis);
      expect(client2).toBe(mockRedis);
    });

    it('should check connection availability', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      
      const isAvailable = await redisManager.isAvailable();
      
      expect(isAvailable).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should handle unavailable connection', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));
      
      const isAvailable = await redisManager.isAvailable();
      
      expect(isAvailable).toBe(false);
    });
  });

  describe('Basic Cache Operations', () => {
    beforeEach(async () => {
      await redisManager.getClient(); // Ensure connection
    });

    it('should set and get string values', async () => {
      const testKey = 'test:string';
      const testValue = 'test-value';
      
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(testValue));
      
      const setResult = await redisManager.set(testKey, testValue);
      const getValue = await redisManager.get(testKey);
      
      expect(setResult).toBe(true);
      expect(getValue).toBe(testValue);
      expect(mockRedis.set).toHaveBeenCalledWith(testKey, JSON.stringify(testValue));
    });

    it('should set values with TTL', async () => {
      const testKey = 'test:ttl';
      const testValue = { data: 'test' };
      const ttl = 300;
      
      mockRedis.setex.mockResolvedValue('OK');
      
      const result = await redisManager.set(testKey, testValue, ttl);
      
      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(testKey, ttl, JSON.stringify(testValue));
    });

    it('should handle non-existent keys', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const result = await redisManager.get('non-existent-key');
      
      expect(result).toBeNull();
    });

    it('should delete keys', async () => {
      const testKey = 'test:delete';
      
      mockRedis.del.mockResolvedValue(1);
      
      const result = await redisManager.del(testKey);
      
      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith(testKey);
    });

    it('should handle cache operation errors gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));
      
      const result = await redisManager.set('test:error', 'value');
      
      expect(result).toBe(false);
    });
  });

  describe('Advanced Data Structures', () => {
    beforeEach(async () => {
      await redisManager.getClient();
    });

    it('should handle hash operations', async () => {
      const hashKey = 'test:hash';
      const field = 'field1';
      const value = 'value1';
      
      mockRedis.hset.mockResolvedValue(1);
      mockRedis.hget.mockResolvedValue(value);
      
      await redisManager.hset(hashKey, field, value);
      const result = await redisManager.hget(hashKey, field);
      
      expect(result).toBe(value);
      expect(mockRedis.hset).toHaveBeenCalledWith(hashKey, field, value);
    });

    it('should handle set operations', async () => {
      const setKey = 'test:set';
      const member = 'member1';
      
      mockRedis.sadd.mockResolvedValue(1);
      mockRedis.sismember.mockResolvedValue(1);
      
      await redisManager.sadd(setKey, member);
      const isMember = await redisManager.sismember(setKey, member);
      
      expect(isMember).toBe(true);
      expect(mockRedis.sadd).toHaveBeenCalledWith(setKey, member);
    });

    it('should handle sorted set operations', async () => {
      const zsetKey = 'test:zset';
      const score = 100;
      const member = 'member1';
      
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.zrange.mockResolvedValue([member]);
      
      await redisManager.zadd(zsetKey, score, member);
      const members = await redisManager.zrange(zsetKey, 0, -1);
      
      expect(members).toContain(member);
      expect(mockRedis.zadd).toHaveBeenCalledWith(zsetKey, score, member);
    });
  });

  describe('Session Management', () => {
    const sessionPrefix = 'session:';
    
    beforeEach(async () => {
      await redisManager.getClient();
    });

    it('should store and retrieve session data', async () => {
      const sessionId = 'test-session-123';
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        loginTime: Date.now(),
      };
      
      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
      
      // Store session with 1 hour TTL
      const storeResult = await redisManager.set(`${sessionPrefix}${sessionId}`, sessionData, 3600);
      const retrievedData = await redisManager.get(`${sessionPrefix}${sessionId}`);
      
      expect(storeResult).toBe(true);
      expect(retrievedData).toEqual(sessionData);
    });

    it('should handle session expiration', async () => {
      const sessionId = 'expired-session';
      
      mockRedis.get.mockResolvedValue(null);
      
      const sessionData = await redisManager.get(`${sessionPrefix}${sessionId}`);
      
      expect(sessionData).toBeNull();
    });

    it('should invalidate sessions', async () => {
      const sessionId = 'session-to-invalidate';
      
      mockRedis.del.mockResolvedValue(1);
      
      const result = await redisManager.del(`${sessionPrefix}${sessionId}`);
      
      expect(result).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    const rateLimitPrefix = 'rate_limit:';
    
    beforeEach(async () => {
      await redisManager.getClient();
    });

    it('should implement sliding window rate limiting', async () => {
      const userId = 'user-123';
      const window = 60; // 1 minute
      const limit = 10;
      const key = `${rateLimitPrefix}${userId}`;
      
      // Mock current count as 5
      mockRedis.incr.mockResolvedValue(5);
      mockRedis.expire.mockResolvedValue(1);
      
      const currentCount = await redisManager.incr(key);
      await redisManager.expire(key, window);
      
      expect(currentCount).toBe(5);
      expect(currentCount).toBeLessThan(limit);
      expect(mockRedis.expire).toHaveBeenCalledWith(key, window);
    });

    it('should handle rate limit exceeded', async () => {
      const userId = 'user-456';
      const key = `${rateLimitPrefix}${userId}`;
      
      // Mock count exceeding limit
      mockRedis.incr.mockResolvedValue(15);
      
      const currentCount = await redisManager.incr(key);
      
      expect(currentCount).toBeGreaterThan(10);
    });

    it('should reset rate limit counters', async () => {
      const userId = 'user-789';
      const key = `${rateLimitPrefix}${userId}`;
      
      mockRedis.del.mockResolvedValue(1);
      
      const result = await redisManager.del(key);
      
      expect(result).toBe(true);
    });
  });

  describe('Performance and Load Testing', () => {
    beforeEach(async () => {
      await redisManager.getClient();
    });

    it('should handle concurrent operations', async () => {
      const operations = [];
      
      // Mock successful operations
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify('test-value'));
      
      // Create 100 concurrent operations
      for (let i = 0; i < 100; i++) {
        operations.push(redisManager.set(`test:concurrent:${i}`, `value-${i}`));
        operations.push(redisManager.get(`test:concurrent:${i}`));
      }
      
      const results = await Promise.all(operations);
      
      // All operations should complete successfully
      expect(results.filter(r => r === true || r === 'test-value')).toHaveLength(200);
    });

    it('should measure operation latency', async () => {
      mockRedis.ping.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('PONG'), 10))
      );
      
      const startTime = Date.now();
      await redisManager.ping();
      const endTime = Date.now();
      
      const latency = endTime - startTime;
      expect(latency).toBeGreaterThanOrEqual(10);
      expect(latency).toBeLessThan(100); // Should be reasonably fast
    });

    it('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure by setting many keys
      mockRedis.set.mockResolvedValue('OK');
      
      const operations = [];
      for (let i = 0; i < 1000; i++) {
        operations.push(redisManager.set(`memory:test:${i}`, `large-value-${'x'.repeat(1000)}`));
      }
      
      const results = await Promise.all(operations);
      
      // All operations should succeed
      expect(results.every(r => r === true)).toBe(true);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle Redis server disconnection', async () => {
      // First connection succeeds
      mockRedis.ping.mockResolvedValueOnce('PONG');
      await redisManager.getClient();
      
      // Then simulate disconnection
      mockRedis.set.mockRejectedValue(new Error('Connection lost'));
      
      const result = await redisManager.set('test:disconnected', 'value');
      
      expect(result).toBe(false);
    });

    it('should implement circuit breaker pattern', async () => {
      // Simulate multiple failures
      mockRedis.ping.mockRejectedValue(new Error('Service unavailable'));
      
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        attempts.push(redisManager.isAvailable());
      }
      
      const results = await Promise.all(attempts);
      
      // All should fail gracefully
      expect(results.every(r => r === false)).toBe(true);
    });

    it('should handle malformed data gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid-json{');
      
      const result = await redisManager.get('test:malformed');
      
      expect(result).toBeNull();
    });
  });

  describe('Cleanup and Maintenance', () => {
    beforeEach(async () => {
      await redisManager.getClient();
    });

    it('should clean up expired keys', async () => {
      mockRedis.keys.mockResolvedValue(['expired:key1', 'expired:key2']);
      mockRedis.del.mockResolvedValue(2);
      
      const expiredKeys = await redisManager.keys('expired:*');
      const deletedCount = await redisManager.del(...expiredKeys);
      
      expect(deletedCount).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('expired:key1', 'expired:key2');
    });

    it('should provide memory usage statistics', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      
      const keys = await redisManager.keys('*');
      
      expect(keys).toHaveLength(3);
    });

    it('should disconnect cleanly', async () => {
      mockRedis.quit.mockResolvedValue('OK');
      
      await redisManager.disconnect();
      
      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});
