import { supabase } from './supabase';
import { User, AuthTokens } from '@/types/auth';
import axios from 'axios';

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
  try {
    const response = await axios.post('/api/auth/login', { email, password });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Login failed');
    }

    return {
      user: response.data.user,
      tokens: response.data.tokens
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Login failed');
  }
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<{ user: any; session: any }> {
  try {
    // Sign up directly with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Sign up failed');
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    // Get the current access token
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      // Call the logout API
      await axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Sign out from Supabase
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear local storage even if the API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

// Refresh token
export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  try {
    const response = await axios.post('/api/auth/refresh', { refreshToken });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Token refresh failed');
    }

    return response.data.tokens;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Token refresh failed');
  }
}

// Get current user from local storage
export function getCurrentUser(): User | null {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Set current user in local storage
export function setCurrentUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// Set tokens in local storage
export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
}

// Get access token from local storage
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Get refresh token from local storage
export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!getCurrentUser();
}

// Create axios instance with authentication
export const authAxios = axios.create();

// Add request interceptor to add authorization header and CSRF token
authAxios.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = getRefreshToken();

        if (!refreshTokenValue) {
          // No refresh token, sign out
          await signOut();
          return Promise.reject(error);
        }

        // Try to refresh the token
        const tokens = await refreshToken(refreshTokenValue);

        // Update tokens in local storage
        setTokens(tokens);

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

        // Retry the original request
        return authAxios(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, sign out
        await signOut();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
