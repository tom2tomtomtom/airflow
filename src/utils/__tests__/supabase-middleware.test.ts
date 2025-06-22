import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { updateSession } from '../supabase-middleware';
import { NextRequest } from 'next/server';

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}));

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn()
  }
}));

describe('supabase-middleware utilities', () => {
  let mockCreateServerClient: jest.MockedFunction<any>;
  let mockNextResponse: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    };

    // Mock NextResponse
    const { NextResponse } = require('next/server');
    mockNextResponse = {
      cookies: {
        set: jest.fn()
      }
    };
    NextResponse.next = jest.fn().mockReturnValue(mockNextResponse);

    // Mock createServerClient
    const { createServerClient } = require('@supabase/ssr');
    mockCreateServerClient = createServerClient as jest.MockedFunction<any>;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('updateSession', () => {
    it('should create server client with correct parameters', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
          })
        }
      };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient);

      const mockRequest = {
        headers: new Headers(),
        cookies: {
          get: jest.fn(),
          set: jest.fn()
        }
      } as any as NextRequest;

      await updateSession(mockRequest);

      expect(mockCreateServerClient).toHaveBeenCalledWith(
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
    });

    it('should return response and user data', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient);

      const mockRequest = {
        headers: new Headers(),
        cookies: {
          get: jest.fn(),
          set: jest.fn()
        }
      } as any as NextRequest;

      const result = await updateSession(mockRequest);

      expect(result).toEqual({
        response: mockNextResponse,
        user: mockUser
      });
    });

    it('should handle authentication errors', async () => {
      const mockError = new Error('Authentication failed');
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: mockError
          })
        }
      };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient);

      const mockRequest = {
        headers: new Headers(),
        cookies: {
          get: jest.fn(),
          set: jest.fn()
        }
      } as any as NextRequest;

      const result = await updateSession(mockRequest);

      expect(result).toEqual({
        response: mockNextResponse,
        user: null
      });
    });

    describe('cookie management', () => {
      let cookieOptions: any;
      let mockRequest: NextRequest;

      beforeEach(() => {
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null
            })
          }
        };

        mockCreateServerClient.mockImplementation((url, key, options) => {
          cookieOptions = options;
          return mockSupabaseClient;
        });

        mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn(),
            set: jest.fn()
          }
        } as any as NextRequest;
      });

      describe('get cookie', () => {
        it('should get cookie value from request', async () => {
          const mockCookie = { value: 'test-value' };
          mockRequest.cookies.get = jest.fn().mockReturnValue(mockCookie);

          await updateSession(mockRequest);
          
          const result = cookieOptions.cookies.get('test-cookie');

          expect(mockRequest.cookies.get).toHaveBeenCalledWith('test-cookie');
          expect(result).toBe('test-value');
        });

        it('should return undefined for non-existent cookie', async () => {
          mockRequest.cookies.get = jest.fn().mockReturnValue(undefined);

          await updateSession(mockRequest);
          
          const result = cookieOptions.cookies.get('non-existent');

          expect(result).toBeUndefined();
        });
      });

      describe('set cookie', () => {
        it('should set cookie on request and response', async () => {
          await updateSession(mockRequest);

          const cookieOptions_local = {
            httpOnly: true,
            secure: true,
            sameSite: 'lax' as const,
            maxAge: 3600
          };

          cookieOptions.cookies.set('session-token', 'abc123', cookieOptions_local);

          expect(mockRequest.cookies.set).toHaveBeenCalledWith({
            name: 'session-token',
            value: 'abc123',
            ...cookieOptions_local
          });

          expect(mockNextResponse.cookies.set).toHaveBeenCalledWith({
            name: 'session-token',
            value: 'abc123',
            ...cookieOptions_local
          });
        });

        it('should handle set with minimal options', async () => {
          await updateSession(mockRequest);

          cookieOptions.cookies.set('simple-cookie', 'value', {});

          expect(mockRequest.cookies.set).toHaveBeenCalledWith({
            name: 'simple-cookie',
            value: 'value'
          });

          expect(mockNextResponse.cookies.set).toHaveBeenCalledWith({
            name: 'simple-cookie',
            value: 'value'
          });
        });

        it('should create new NextResponse when setting cookie', async () => {
          const { NextResponse } = require('next/server');
          
          await updateSession(mockRequest);

          cookieOptions.cookies.set('test', 'value', {});

          // Should call NextResponse.next to create new response
          expect(NextResponse.next).toHaveBeenCalledWith({
            request: {
              headers: mockRequest.headers
            }
          });
        });
      });

      describe('remove cookie', () => {
        it('should remove cookie from request and response', async () => {
          await updateSession(mockRequest);

          const cookieOptions_local = {
            path: '/',
            domain: '.example.com'
          };

          cookieOptions.cookies.remove('session-token', cookieOptions_local);

          expect(mockRequest.cookies.set).toHaveBeenCalledWith({
            name: 'session-token',
            value: '',
            ...cookieOptions_local
          });

          expect(mockNextResponse.cookies.set).toHaveBeenCalledWith({
            name: 'session-token',
            value: '',
            ...cookieOptions_local
          });
        });

        it('should handle remove with minimal options', async () => {
          await updateSession(mockRequest);

          cookieOptions.cookies.remove('simple-cookie', {});

          expect(mockRequest.cookies.set).toHaveBeenCalledWith({
            name: 'simple-cookie',
            value: ''
          });

          expect(mockNextResponse.cookies.set).toHaveBeenCalledWith({
            name: 'simple-cookie',
            value: ''
          });
        });

        it('should create new NextResponse when removing cookie', async () => {
          const { NextResponse } = require('next/server');
          
          await updateSession(mockRequest);

          cookieOptions.cookies.remove('test', {});

          // Should call NextResponse.next to create new response
          expect(NextResponse.next).toHaveBeenCalledWith({
            request: {
              headers: mockRequest.headers
            }
          });
        });
      });
    });

    describe('authentication flow', () => {
      it('should call getUser to refresh session', async () => {
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null
            })
          }
        };
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn(),
            set: jest.fn()
          }
        } as any as NextRequest;

        await updateSession(mockRequest);

        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      });

      it('should handle getUser promise rejection', async () => {
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockRejectedValue(new Error('Network error'))
          }
        };
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn(),
            set: jest.fn()
          }
        } as any as NextRequest;

        // Should not throw even if getUser fails
        await expect(updateSession(mockRequest)).rejects.toThrow('Network error');
      });

      it('should work with valid user session', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        };

        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null
            })
          }
        };
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);

        const mockRequest = {
          headers: new Headers({
            'authorization': 'Bearer valid-token'
          }),
          cookies: {
            get: jest.fn().mockReturnValue({ value: 'session-cookie' }),
            set: jest.fn()
          }
        } as any as NextRequest;

        const result = await updateSession(mockRequest);

        expect(result.user).toEqual(mockUser);
        expect(result.response).toBeDefined();
      });

      it('should work with expired session', async () => {
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'JWT expired' }
            })
          }
        };
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn().mockReturnValue({ value: 'expired-session' }),
            set: jest.fn()
          }
        } as any as NextRequest;

        const result = await updateSession(mockRequest);

        expect(result.user).toBeNull();
        expect(result.response).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('should handle missing environment variables', async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null
            })
          }
        };
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn(),
            set: jest.fn()
          }
        } as any as NextRequest;

        const result = await updateSession(mockRequest);

        expect(mockCreateServerClient).toHaveBeenCalledWith(
          undefined,
          undefined,
          expect.any(Object)
        );
        expect(result).toBeDefined();
      });

      it('should handle request with no cookies', async () => {
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null
            })
          }
        };
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn().mockReturnValue(undefined),
            set: jest.fn()
          }
        } as any as NextRequest;

        const result = await updateSession(mockRequest);

        expect(result.user).toBeNull();
        expect(result.response).toBeDefined();
      });

      it('should handle response cookies being undefined', async () => {
        // Mock NextResponse.next to return response without cookies
        const { NextResponse } = require('next/server');
        const responseWithoutCookies = {};
        NextResponse.next = jest.fn().mockReturnValue(responseWithoutCookies);

        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null
            })
          }
        };

        mockCreateServerClient.mockImplementation((url, key, options) => {
          // Test that cookie operations don't fail when response.cookies is undefined
          options.cookies.set('test', 'value', {});
          options.cookies.remove('test', {});
          return mockSupabaseClient;
        });

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn(),
            set: jest.fn()
          }
        } as any as NextRequest;

        const result = await updateSession(mockRequest);

        expect(result).toBeDefined();
      });
    });

    describe('integration scenarios', () => {
      it('should work in complete middleware flow', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' };
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null
            })
          }
        };

        mockCreateServerClient.mockImplementation((url, key, options) => {
          // Simulate typical middleware cookie operations
          const sessionCookie = options.cookies.get('sb-access-token');
          if (sessionCookie) {
            // Refresh token scenario
            options.cookies.set('sb-access-token', 'new-token', {
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              maxAge: 3600
            });
          }
          return mockSupabaseClient;
        });

        const mockRequest = {
          headers: new Headers({
            'cookie': 'sb-access-token=old-token'
          }),
          cookies: {
            get: jest.fn().mockReturnValue({ value: 'old-token' }),
            set: jest.fn()
          }
        } as any as NextRequest;

        const result = await updateSession(mockRequest);

        expect(result.user).toEqual(mockUser);
        expect(mockRequest.cookies.set).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'sb-access-token',
            value: 'new-token'
          })
        );
      });

      it('should handle multiple cookie operations', async () => {
        const mockSupabaseClient = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null
            })
          }
        };

        mockCreateServerClient.mockImplementation((url, key, options) => {
          // Simulate multiple cookie operations
          options.cookies.set('session', 'new-session', { maxAge: 3600 });
          options.cookies.set('refresh', 'new-refresh', { maxAge: 86400 });
          options.cookies.remove('old-session', { path: '/' });
          return mockSupabaseClient;
        });

        const mockRequest = {
          headers: new Headers(),
          cookies: {
            get: jest.fn(),
            set: jest.fn()
          }
        } as any as NextRequest;

        await updateSession(mockRequest);

        expect(mockRequest.cookies.set).toHaveBeenCalledTimes(3); // 2 sets + 1 remove
        expect(mockNextResponse.cookies.set).toHaveBeenCalledTimes(3);
      });
    });
  });
});