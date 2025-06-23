import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createSupabaseBrowserClient, resetSupabaseBrowserClient } from '../supabase-browser';

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn()
}));

describe('supabase-browser utilities', () => {
  let mockCreateBrowserClient: jest.MockedFunction<any>;
  let originalWindow: typeof window;
  let originalDocument: typeof document;
  let mockWindow: any;
  let mockDocument: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock createBrowserClient
    const { createBrowserClient } = require('@supabase/ssr');
    mockCreateBrowserClient = createBrowserClient as jest.MockedFunction<any>;
    
    // Mock environment variables
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    };

    // Mock browser environment
    originalWindow = global.window;
    originalDocument = global.document;
    
    mockDocument = {
      cookie: 'session=abc123; theme=dark; user=john'
    };
    
    mockWindow = {
      navigator: { userAgent: 'test-browser'  },
  addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    });
    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true
    });

    // Reset singleton
    resetSupabaseBrowserClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true
    });
    Object.defineProperty(global, 'document', {
      value: originalDocument,
      writable: true
    });
    jest.restoreAllMocks();
  });

  describe('createSupabaseBrowserClient', () => {
    it('should create Supabase client with correct parameters', () => {
      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockReturnValue(mockClient);

      const client = createSupabaseBrowserClient();

      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function)
          })
        })
      );
      expect(client).toBe(mockClient);
    });

    it('should return singleton instance on subsequent calls', () => {
      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockReturnValue(mockClient);

      const client1 = createSupabaseBrowserClient();
      const client2 = createSupabaseBrowserClient();

      expect(client1).toBe(client2);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    });

    it('should handle missing environment variables', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockReturnValue(mockClient);

      const client = createSupabaseBrowserClient();

      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        undefined,
        undefined,
        expect.any(Object)
      );
      expect(client).toBe(mockClient);
    });

    describe('cookie management', () => {
      let cookieOptions: any;

      beforeEach(() => {
        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          cookieOptions = options;
          return mockClient;
        });
        
        createSupabaseBrowserClient();
      });

      describe('get cookie', () => {
        it('should get cookie value from document.cookie', () => {
          const result = cookieOptions.cookies.get('session');
          
          expect(result).toBe('abc123');
        });

        it('should return undefined for non-existent cookie', () => {
          const result = cookieOptions.cookies.get('nonexistent');
          
          expect(result).toBeUndefined();
        });

        it('should handle empty document.cookie', () => {
          mockDocument.cookie = '';
          
          const result = cookieOptions.cookies.get('session');
          
          expect(result).toBeUndefined();
        });

        it('should return undefined in non-browser environment', () => {
          Object.defineProperty(global, 'window', {
            value: undefined,
            writable: true
          });
          Object.defineProperty(global, 'document', {
            value: undefined,
            writable: true
          });
          
          const result = cookieOptions.cookies.get('session');
          
          expect(result).toBeUndefined();
        });

        it('should handle cookie with semicolon in value', () => {
          mockDocument.cookie = 'complex=value;with;semicolons; other=value';
          
          const result = cookieOptions.cookies.get('complex');
          
          expect(result).toBe('value');
        });

        it('should handle cookie at end of string', () => {
          mockDocument.cookie = 'first=value1; last=value2';
          
          const result = cookieOptions.cookies.get('last');
          
          expect(result).toBe('value2');
        });
      });

      describe('set cookie', () => {
        beforeEach(() => {
          mockDocument.cookie = '';
        });

        it('should set basic cookie', () => {
          cookieOptions.cookies.set('test', 'value', {});
          
          expect(mockDocument.cookie).toBe('test=value; path=/');
        });

        it('should set cookie with expiry date', () => {
          const expires = new Date('2024-12-31T23:59:59Z');
          
          cookieOptions.cookies.set('test', 'value', { expires });
          
          expect(mockDocument.cookie).toBe('test=value; expires=Tue, 31 Dec 2024 23:59:59 GMT; path=/');
        });

        it('should set cookie with max-age', () => {
          cookieOptions.cookies.set('test', 'value', { maxAge: 3600 });
          
          expect(mockDocument.cookie).toBe('test=value; max-age=3600; path=/');
        });

        it('should set cookie with custom domain', () => {
          cookieOptions.cookies.set('test', 'value', { domain: '.example.com' });
          
          expect(mockDocument.cookie).toBe('test=value; domain=.example.com; path=/');
        });

        it('should set cookie with custom path', () => {
          cookieOptions.cookies.set('test', 'value', { path: '/admin' });
          
          expect(mockDocument.cookie).toBe('test=value; path=/admin');
        });

        it('should set secure cookie', () => {
          cookieOptions.cookies.set('test', 'value', { secure: true });
          
          expect(mockDocument.cookie).toBe('test=value; path=/; secure');
        });

        it('should set httpOnly cookie', () => {
          cookieOptions.cookies.set('test', 'value', { httpOnly: true });
          
          expect(mockDocument.cookie).toBe('test=value; path=/; httponly');
        });

        it('should set cookie with sameSite', () => {
          cookieOptions.cookies.set('test', 'value', { sameSite: 'strict' });
          
          expect(mockDocument.cookie).toBe('test=value; path=/; samesite=strict');
        });

        it('should set cookie with all options', () => {
          const expires = new Date('2024-12-31T23:59:59Z');
          const options = {
            expires,
            maxAge: 3600,
            domain: '.example.com',
            path: '/api',
            secure: true,
            httpOnly: true,
            sameSite: 'lax'
          };
          
          cookieOptions.cookies.set('test', 'value', options);
          
          expect(mockDocument.cookie).toBe(
            'test=value; expires=Tue, 31 Dec 2024 23:59:59 GMT; max-age=3600; domain=.example.com; path=/api; secure; httponly; samesite=lax'
          );
        });

        it('should not set cookie in non-browser environment', () => {
          Object.defineProperty(global, 'window', {
            value: undefined,
            writable: true
          });
          Object.defineProperty(global, 'document', {
            value: undefined,
            writable: true
          });
          
          cookieOptions.cookies.set('test', 'value', {});
          
          // Should not throw and should not modify anything
          expect(true).toBe(true); // Test passes if no error thrown
        });

        it('should handle undefined options', () => {
          cookieOptions.cookies.set('test', 'value', undefined);
          
          expect(mockDocument.cookie).toBe('test=value; path=/');
        });
      });

      describe('remove cookie', () => {
        beforeEach(() => {
          mockDocument.cookie = '';
        });

        it('should remove cookie with default path', () => {
          cookieOptions.cookies.remove('test', {});
          
          expect(mockDocument.cookie).toBe('test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/');
        });

        it('should remove cookie with custom path', () => {
          cookieOptions.cookies.remove('test', { path: '/admin' });
          
          expect(mockDocument.cookie).toBe('test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/admin');
        });

        it('should remove cookie with custom domain', () => {
          cookieOptions.cookies.remove('test', { domain: '.example.com' });
          
          expect(mockDocument.cookie).toBe('test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.example.com');
        });

        it('should remove cookie with both path and domain', () => {
          cookieOptions.cookies.remove('test', { path: '/api', domain: '.example.com' });
          
          expect(mockDocument.cookie).toBe('test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api; domain=.example.com');
        });

        it('should not remove cookie in non-browser environment', () => {
          Object.defineProperty(global, 'window', {
            value: undefined,
            writable: true
          });
          Object.defineProperty(global, 'document', {
            value: undefined,
            writable: true
          });
          
          cookieOptions.cookies.remove('test', {});
          
          // Should not throw and should not modify anything
          expect(true).toBe(true); // Test passes if no error thrown
        });

        it('should handle undefined options', () => {
          cookieOptions.cookies.remove('test', undefined);
          
          expect(mockDocument.cookie).toBe('test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/');
        });
      });
    });

    describe('server-side rendering', () => {
      it('should handle SSR environment gracefully', () => {
        // Simulate SSR (no window/document)
        Object.defineProperty(global, 'window', {
          value: undefined,
          writable: true
        });
        Object.defineProperty(global, 'document', {
          value: undefined,
          writable: true
        });

        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockReturnValue(mockClient);

        const client = createSupabaseBrowserClient();

        expect(client).toBe(mockClient);
        expect(mockCreateBrowserClient).toHaveBeenCalled();
      });

      it('should handle partial browser environment', () => {
        // Window exists but document doesn't
        Object.defineProperty(global, 'document', {
          value: undefined,
          writable: true
        });

        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          const cookieOptions = options;
          
          // Test cookie operations in partial environment
          expect(cookieOptions.cookies.get('test')).toBeUndefined();
          cookieOptions.cookies.set('test', 'value', {});
          cookieOptions.cookies.remove('test', {});
          
          return mockClient;
        });

        const client = createSupabaseBrowserClient();

        expect(client).toBe(mockClient);
      });
    });

    describe('edge cases', () => {
      it('should handle malformed cookie strings', () => {
        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          mockDocument.cookie = 'malformed cookie string without equals';
          
          const result = options.cookies.get('malformed');
          expect(result).toBeUndefined();
          
          return mockClient;
        });

        createSupabaseBrowserClient();
      });

      it('should handle empty cookie names', () => {
        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          mockDocument.cookie = 'valid=value';
          
          const result = options.cookies.get('');
          expect(result).toBeUndefined();
          
          return mockClient;
        });

        createSupabaseBrowserClient();
      });

      it('should handle special characters in cookie values', () => {
        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          mockDocument.cookie = 'special=value%20with%20spaces; normal=test';
          
          const result = options.cookies.get('special');
          expect(result).toBe('value%20with%20spaces');
          
          return mockClient;
        });

        createSupabaseBrowserClient();
      });

      it('should handle multiple cookies with same prefix', () => {
        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          mockDocument.cookie = 'test=value1; test_long=value2; testing=value3';
          
          const result = options.cookies.get('test');
          expect(result).toBe('value1');
          
          return mockClient;
        });

        createSupabaseBrowserClient();
      });

      it('should handle whitespace in cookie strings', () => {
        const mockClient = { from: jest.fn() };
        mockCreateBrowserClient.mockImplementation((url, key, options) => {
          mockDocument.cookie = '  test  =  value  ;  other  =  value2  ';
          
          const result = options.cookies.get('test');
          expect(result).toBe('  value  ');
          
          return mockClient;
        });

        createSupabaseBrowserClient();
      });
    });
  });

  describe('resetSupabaseBrowserClient', () => {
    it('should reset singleton instance', () => {
      const mockClient1 = { from: jest.fn(), id: 'client1' };
      const mockClient2 = { from: jest.fn(), id: 'client2' };
      
      mockCreateBrowserClient
        .mockReturnValueOnce(mockClient1)
        .mockReturnValueOnce(mockClient2);

      // Create first instance
      const client1 = createSupabaseBrowserClient();
      expect(client1).toBe(mockClient1);

      // Get same instance
      const client1Again = createSupabaseBrowserClient();
      expect(client1Again).toBe(mockClient1);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);

      // Reset and create new instance
      resetSupabaseBrowserClient();
      const client2 = createSupabaseBrowserClient();
      expect(client2).toBe(mockClient2);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
    });

    it('should allow multiple resets', () => {
      resetSupabaseBrowserClient();
      resetSupabaseBrowserClient();
      resetSupabaseBrowserClient();
      
      // Should not throw and should work normally
      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockReturnValue(mockClient);
      
      const client = createSupabaseBrowserClient();
      expect(client).toBe(mockClient);
    });
  });

  describe('integration tests', () => {
    it('should work with realistic Supabase usage pattern', () => {
      const mockClient = {
        from: jest.fn(),
        auth: {},
  getSession: jest.fn(),
          signIn: jest.fn(),
          signOut: jest.fn()
        }
      };
      mockCreateBrowserClient.mockReturnValue(mockClient);
      
      // Get client multiple times (should be singleton)
      const client1 = createSupabaseBrowserClient();
      const client2 = createSupabaseBrowserClient();
      
      expect(client1).toBe(client2);
      expect(client1).toBe(mockClient);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
      
      // Verify client has expected methods
      expect(client1.from).toBeDefined();
      expect(client1.auth).toBeDefined();
    });

    it('should handle cookie operations during auth flow', () => {
      let cookieHandler: any;
      
      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockImplementation((url, key, options) => {
        cookieHandler = options.cookies;
        return mockClient;
      });
      
      createSupabaseBrowserClient();
      
      // Simulate auth token storage
      cookieHandler.set('sb-access-token', 'token123', {
        expires: new Date('2024-12-31'),
        secure: true,
        sameSite: 'lax'
      });
      
      expect(mockDocument.cookie).toContain('sb-access-token=token123');
      expect(mockDocument.cookie).toContain('secure');
      expect(mockDocument.cookie).toContain('samesite=lax');
      
      // Simulate token retrieval
      mockDocument.cookie = 'sb-access-token=token123; other=value';
      const token = cookieHandler.get('sb-access-token');
      expect(token).toBe('token123');
      
      // Simulate logout (token removal)
      cookieHandler.remove('sb-access-token', { path: '/' });
      expect(mockDocument.cookie).toContain('sb-access-token=; expires=Thu, 01 Jan 1970');
    });

    it('should handle multiple simultaneous client creations', () => {
      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockReturnValue(mockClient);
      
      // Simulate multiple components trying to get client simultaneously
      const clients = Promise.all([
        Promise.resolve(createSupabaseBrowserClient()),
        Promise.resolve(createSupabaseBrowserClient()),
        Promise.resolve(createSupabaseBrowserClient())
      ]);
      
      return clients.then(([client1, client2, client3]) => {
        expect(client1).toBe(client2);
        expect(client2).toBe(client3);
        expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
      });
    });

    it('should preserve client instance across environment changes', () => {
      const mockClient = { from: jest.fn() };
      mockCreateBrowserClient.mockReturnValue(mockClient);
      
      // Create client in normal environment
      const client1 = createSupabaseBrowserClient();
      
      // Temporarily simulate SSR
      const savedWindow = global.window;
      const savedDocument = global.document;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      Object.defineProperty(global, 'document', {
        value: undefined,
        writable: true
      });
      
      // Should still return same instance
      const client2 = createSupabaseBrowserClient();
      
      // Restore environment
      Object.defineProperty(global, 'window', {
        value: savedWindow,
        writable: true
      });
      Object.defineProperty(global, 'document', {
        value: savedDocument,
        writable: true
      });
      
      const client3 = createSupabaseBrowserClient();
      
      expect(client1).toBe(client2);
      expect(client2).toBe(client3);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    });
  });
});