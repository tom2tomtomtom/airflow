import { supabase } from './supabase';
import { User, AuthTokens } from '@/types/auth';
import axios from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance with default config
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const response = await authAxios.post('/api/auth/login', { 
      email, 
      password 
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    const { user, token } = response.data;

    // Store user info in localStorage (token is in httpOnly cookie)
    if (typeof window !== 'undefined') {
      localStorage.setItem('airwave_user', JSON.stringify(user));
    }

    return { user, token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Login failed');
  }
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<{ user: User; token?: string; emailConfirmationRequired?: boolean }> {
  try {
    const response = await authAxios.post('/api/auth/signup', {
      email,
      password,
      firstName,
      lastName,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Sign up failed');
    }

    const { user, token } = response.data;

    // Store user info if login was successful (email confirmed)
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('airwave_user', JSON.stringify(user));
    }

    return { 
      user, 
      token,
      emailConfirmationRequired: !user.emailConfirmed 
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Sign up failed');
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    // Call the logout API
    await authAxios.post('/api/auth/logout');
  } catch (error) {
    console.error('Sign out API error:', error);
    // Continue with cleanup even if API call fails
  } finally {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('airwave_user');
    }
    
    // Sign out from Supabase client
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signout error:', error);
    }
  }
}

// Get current user from local storage
export function getCurrentUser(): User | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const userJson = localStorage.getItem('airwave_user');
    if (!userJson) return null;

    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Set current user in local storage
export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('airwave_user', JSON.stringify(user));
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}

// Refresh token (handled by httpOnly cookies, so this is mostly a placeholder)
export async function refreshToken(): Promise<boolean> {
  try {
    // With httpOnly cookies, token refresh is handled automatically by the browser
    // We can make a request to a protected endpoint to verify if the token is still valid
    const response = await authAxios.get('/api/auth/me');
    return response.data.success;
  } catch (error) {
    console.error('Token refresh check failed:', error);
    return false;
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Password reset request error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to reset password');
  }
}

// Create authenticated axios instance
export const createAuthenticatedAxios = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Request interceptor to add CSRF protection
  instance.interceptors.request.use(
    async (config) => {
      // CSRF token handling if needed
      const csrfToken = typeof window !== 'undefined' 
        ? localStorage.getItem('csrf_token') 
        : null;
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle auth errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid, sign out user
        await signOut();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Default authenticated axios instance
export const authAPI = createAuthenticatedAxios();