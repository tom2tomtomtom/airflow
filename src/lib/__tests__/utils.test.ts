/**
 * 🧪 Library Utilities Tests  
 * Tests for common library utilities
 */

describe('Library Utilities', () => {
  describe('Type guards', () => {
    it('should check if value is defined', () => {
      const isDefined = <T>(value: T | undefined | null): value is T => {
        return value !== undefined && value !== null;
      };
      
      expect(isDefined('test')).toBe(true);
      expect(isDefined(0)).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined(undefined)).toBe(false);
      expect(isDefined(null)).toBe(false);
    });

    it('should check if value is string', () => {
      const isString = (value: unknown): value is string => {
        return typeof value === 'string';
      };
      
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString(null)).toBe(false);
    });

    it('should check if value is number', () => {
      const isNumber = (value: unknown): value is number => {
        return typeof value === 'number' && !isNaN(value);
      };
      
      expect(isNumber(123)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('123')).toBe(false);
    });
  });

  describe('Async utilities', () => {
    it('should create delay function', async () => {
      const delay = (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
      };
      
      const start = Date.now();
      await delay(10);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(8); // Allow some variance
    });

    it('should create timeout function', async () => {
      const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), ms)
          )
        ]);
      };
      
      const quickPromise = Promise.resolve('success');
      const result = await timeout(quickPromise, 100);
      expect(result).toBe('success');
      
      const slowPromise = new Promise(resolve => setTimeout(resolve, 200));
      await expect(timeout(slowPromise, 50)).rejects.toThrow('Timeout');
    });
  });

  describe('Math utilities', () => {
    it('should clamp values', () => {
      const clamp = (value: number, min: number, max: number): number => {
        return Math.min(Math.max(value, min), max);
      };
      
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should generate random integers', () => {
      const randomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };
      
      for (let i = 0; i < 10; i++) {
        const value = randomInt(1, 5);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(5);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should calculate percentage', () => {
      const percentage = (value: number, total: number): number => {
        if (total === 0) return 0;
        return (value / total) * 100;
      };
      
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(1, 3)).toBeCloseTo(33.33, 2);
      expect(percentage(5, 0)).toBe(0);
    });
  });

  describe('Function utilities', () => {
    it('should create debounce function', (done) => {
      const debounce = <T extends (...args: any[]) => void>(
        func: T, 
        delay: number
      ): T => {
        let timeoutId: NodeJS.Timeout;
        return ((...args: Parameters<T>) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
        }) as T;
      };
      
      let callCount = 0;
      const increment = () => callCount++;
      const debouncedIncrement = debounce(increment, 10);
      
      debouncedIncrement();
      debouncedIncrement();
      debouncedIncrement();
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 15);
    });

    it('should create throttle function', (done) => {
      const throttle = <T extends (...args: any[]) => void>(
        func: T,
        delay: number
      ): T => {
        let lastCall = 0;
        return ((...args: Parameters<T>) => {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
          }
        }) as T;
      };
      
      let callCount = 0;
      const increment = () => callCount++;
      const throttledIncrement = throttle(increment, 10);
      
      throttledIncrement();
      throttledIncrement();
      throttledIncrement();
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 5);
    });
  });
});