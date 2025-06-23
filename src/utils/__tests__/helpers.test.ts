/**
 * 🧪 Helper Utilities Tests
 * Tests for common helper functions
 */

describe('Helper Utilities', () => {
  describe('Object helpers', () => {
    it('should check if object is empty', () => {
      const isEmpty = (obj: any) => {
        if (obj === null || obj === undefined) return true;
        if (typeof obj !== 'object') return false;
        return Object.keys(obj).length === 0;
      };
      
      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('string')).toBe(false);
    });

    it('should deep clone objects', () => {
      const deepClone = (obj: any) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        
        const clonedObj: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
          }
        }
        return clonedObj;
      };
      
      const original = { 
        name: 'test', 
        nested: { value: 42 },
        array: [1, 2, 3]
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
    });
  });

  describe('Array helpers', () => {
    it('should chunk arrays', () => {
      const chunk = <T>(array: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          chunks.push(array.slice(i, i + size));
        }
        return chunks;
      };
      
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk(['a', 'b', 'c'], 3)).toEqual([['a', 'b', 'c']]);
      expect(chunk([], 2)).toEqual([]);
    });

    it('should remove duplicates', () => {
      const unique = <T>(array: T[]): T[] => {
        return Array.from(new Set(array));
      };
      
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(unique([])).toEqual([]);
    });
  });

  describe('String helpers', () => {
    it('should capitalize strings', () => {
      const capitalize = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('tEST')).toBe('Test');
      expect(capitalize('')).toBe('');
    });

    it('should generate random strings', () => {
      const randomString = (length: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const str1 = randomString(10);
      const str2 = randomString(10);
      
      expect(str1.length).toBe(10);
      expect(str2.length).toBe(10);
      expect(str1).not.toBe(str2); // Very unlikely to be the same
    });
  });

  describe('Validation helpers', () => {
    it('should validate email format', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
      
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should validate URLs', () => {
      const isValidURL = (url: string): boolean => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };
      
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
      expect(isValidURL('ftp://files.example.com')).toBe(true);
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('http://')).toBe(false);
    });
  });

  describe('Date helpers', () => {
    it('should check if date is today', () => {
      const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
      };
      
      expect(isToday(new Date())).toBe(true);
      expect(isToday(new Date('2023-01-01'))).toBe(false);
    });

    it('should add days to date', () => {
      const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      
      const baseDate = new Date('2024-01-01');
      const futureDate = addDays(baseDate, 10);
      
      expect(futureDate.getDate()).toBe(11);
      expect(futureDate.getMonth()).toBe(0); // January
    });
  });
});