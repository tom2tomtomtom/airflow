/**
 * 🧪 API Helper Service Tests
 * Tests for API utility services and helpers
 */

describe('API Helper Services', () => {
  describe('HTTP client helpers', () => {
    it('should build query parameters', () => {
      const buildQueryString = (params: Record<string, any>): string => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(value));
            }
          }
        });
        
        return searchParams.toString();
      };
      
      expect(buildQueryString({ page: 1, limit: 10 })).toBe('page=1&limit=10');
      expect(buildQueryString({ search: 'test', active: true })).toBe('search=test&active=true');
      expect(buildQueryString({ tags: ['a', 'b'], id: 123 })).toBe('tags=a&tags=b&id=123');
      expect(buildQueryString({ empty: null, undefined: undefined })).toBe('');
    });

    it('should handle API response formats', () => {
      interface ApiResponse<T> {
        success: boolean;
        data?: T;
        error?: string;
        meta?: {
          total?: number;
          page?: number;
          limit?: number;
        };
      }
      
      const createSuccessResponse = <T>(data: T, meta?: any): ApiResponse<T> => ({
        success: true,
        data,
        meta
      });
      
      const createErrorResponse = (error: string): ApiResponse<never> => ({
        success: false,
        error
      });
      
      const successResponse = createSuccessResponse(['item1', 'item2'], { total: 2 });
      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toEqual(['item1', 'item2']);
      expect(successResponse.meta?.total).toBe(2);
      
      const errorResponse = createErrorResponse('Something went wrong');
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Something went wrong');
    });

    it('should handle request headers', () => {
      const buildHeaders = (options: {},
        contentType?: string;
        authorization?: string;
        custom?: Record<string, string>;
      } = {}) => {
        const headers: Record<string, string> = {};
        
        if (options.contentType) {
          headers['Content-Type'] = options.contentType;
        }
        
        if (options.authorization) {
          headers['Authorization'] = options.authorization;
        }
        
        if (options.custom) {
          Object.assign(headers, options.custom);
        }
        
        return headers;
      };
      
      expect(buildHeaders()).toEqual({});
      
      expect(buildHeaders({
        contentType: 'application/json',
        authorization: 'Bearer token123'
      })).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123'
      });
      
      expect(buildHeaders({
        custom: { 'X-Custom-Header': 'value' }
      })).toEqual({
        'X-Custom-Header': 'value'
      });
    });
  });

  describe('Error handling', () => {
    it('should parse API errors', () => {
      const parseApiError = (error: any): string => {
        if (typeof error === 'string') return error;
        
        if (error?.response?.data?.error) {
          return error.response.data.error;
        }
        
        if (error?.response?.data?.message) {
          return error.response.data.message;
        }
        
        if (error?.message) {
          return error.message;
        }
        
        return 'An unexpected error occurred';
      };
      
      expect(parseApiError('Simple error')).toBe('Simple error');
      
      expect(parseApiError({
        response: { data: { error: 'API error' } }
      })).toBe('API error');
      
      expect(parseApiError({
        response: { data: { message: 'API message' } }
      })).toBe('API message');
      
      expect(parseApiError({
        message: 'Network error'
      })).toBe('Network error');
      
      expect(parseApiError({})).toBe('An unexpected error occurred');
    });

    it('should handle timeout errors', () => {
      const isTimeoutError = (error: any): boolean => {
        if (error?.code === 'ECONNABORTED') return true;
        if (error?.message?.includes('timeout')) return true;
        if (error?.response?.status === 408) return true;
        return false;
      };
      
      expect(isTimeoutError({ code: 'ECONNABORTED' })).toBe(true);
      expect(isTimeoutError({ message: 'Request timeout' })).toBe(true);
      expect(isTimeoutError({ response: { status: 408 } })).toBe(true);
      expect(isTimeoutError({ response: { status: 500 } })).toBe(false);
    });

    it('should handle network errors', () => {
      const isNetworkError = (error: any): boolean => {
        if (error?.code === 'NETWORK_ERROR') return true;
        if (error?.message?.includes('Network Error')) return true;
        if (!error?.response && error?.request) return true;
        return false;
      };
      
      expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(isNetworkError({ message: 'Network Error' })).toBe(true);
      expect(isNetworkError({ request: Record<string, unknown>$1 response: undefined })).toBe(true);
      expect(isNetworkError({ response: { status: 500 } })).toBe(false);
    });
  });

  describe('Data transformation', () => {
    it('should transform API data to UI format', () => {
      interface ApiUser {
        id: string;
        first_name: string;
        last_name: string;
        email_address: string;
        is_active: boolean;
        created_at: string;
      }
      
      interface UiUser {
        id: string;
        name: string;
        email: string;
        active: boolean;
        createdAt: Date;
      }
      
      const transformUser = (apiUser: ApiUser): UiUser => ({
        id: apiUser.id,
        name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
        email: apiUser.email_address,
        active: apiUser.is_active,
        createdAt: new Date(apiUser.created_at)
      });
      
      const apiUser: ApiUser = {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      };
      
      const uiUser = transformUser(apiUser);
      
      expect(uiUser.id).toBe('123');
      expect(uiUser.name).toBe('John Doe');
      expect(uiUser.email).toBe('john@example.com');
      expect(uiUser.active).toBe(true);
      expect(uiUser.createdAt).toBeInstanceOf(Date);
    });

    it('should handle pagination metadata', () => {
      const transformPaginationMeta = (meta: any) => ({
        currentPage: meta.page || 1,
        totalPages: Math.ceil((meta.total || 0) / (meta.limit || 10)),
        totalItems: meta.total || 0,
        itemsPerPage: meta.limit || 10,
        hasNextPage: (meta.page || 1) < Math.ceil((meta.total || 0) / (meta.limit || 10)),
        hasPrevPage: (meta.page || 1) > 1
      });
      
      const meta = { page: 2, total: 50, limit: 10 };
      const transformed = transformPaginationMeta(meta);
      
      expect(transformed.currentPage).toBe(2);
      expect(transformed.totalPages).toBe(5);
      expect(transformed.totalItems).toBe(50);
      expect(transformed.hasNextPage).toBe(true);
      expect(transformed.hasPrevPage).toBe(true);
    });
  });

  describe('Retry logic', () => {
    it('should implement exponential backoff', () => {
      const calculateBackoffDelay = (attempt: number, baseDelay: number = 1000): number => {
        return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
      };
      
      expect(calculateBackoffDelay(0)).toBe(1000);  // 1 second
      expect(calculateBackoffDelay(1)).toBe(2000);  // 2 seconds
      expect(calculateBackoffDelay(2)).toBe(4000);  // 4 seconds
      expect(calculateBackoffDelay(10)).toBe(30000); // Capped at 30 seconds
    });

    it('should determine if error is retryable', () => {
      const isRetryableError = (error: any): boolean => {
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        const status = error?.response?.status;
        
        if (retryableStatuses.includes(status)) return true;
        if (error?.code === 'ECONNABORTED') return true; // Timeout
        if (error?.code === 'NETWORK_ERROR') return true;
        
        return false;
      };
      
      expect(isRetryableError({ response: { status: 500 } })).toBe(true);
      expect(isRetryableError({ response: { status: 429 } })).toBe(true);
      expect(isRetryableError({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(isRetryableError({ response: { status: 400 } })).toBe(false);
      expect(isRetryableError({ response: { status: 401 } })).toBe(false);
    });
  });

  describe('URL construction', () => {
    it('should build API URLs', () => {
      const buildApiUrl = (endpoint: string, baseUrl: string = '/api/v1'): string => {
        // Remove leading slash from endpoint if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        // Ensure baseUrl ends without slash
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        
        return `${cleanBaseUrl}/${cleanEndpoint}`;
      };
      
      expect(buildApiUrl('users')).toBe('/api/v1/users');
      expect(buildApiUrl('/users')).toBe('/api/v1/users');
      expect(buildApiUrl('users', '/api/v2/')).toBe('/api/v2/users');
      expect(buildApiUrl('users/123/posts')).toBe('/api/v1/users/123/posts');
    });

    it('should handle resource IDs in URLs', () => {
      const buildResourceUrl = (resource: string, id?: string | number, action?: string): string => {
        let url = `/api/${resource}`;
        
        if (id) {
          url += `/${id}`;
        }
        
        if (action) {
          url += `/${action}`;
        }
        
        return url;
      };
      
      expect(buildResourceUrl('users')).toBe('/api/users');
      expect(buildResourceUrl('users', 123)).toBe('/api/users/123');
      expect(buildResourceUrl('users', 123, 'posts')).toBe('/api/users/123/posts');
      expect(buildResourceUrl('campaigns', 'abc-123', 'analytics')).toBe('/api/campaigns/abc-123/analytics');
    });
  });
});