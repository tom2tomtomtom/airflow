import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}));

// Mock useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {}
  })
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  it('should handle successful login', async () => {
    const mockUser = { 
      id: '123', 
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };
    
    const { supabase } = await import('@/lib/supabase/client');
    
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
      // No error thrown means success
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle login error', async () => {
    const { supabase } = await import('@/lib/supabase/client');
    
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toBe('Invalid credentials');
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle successful signup', async () => {
    const mockUser = { 
      id: '456', 
      email: 'newuser@example.com',
      user_metadata: { full_name: 'New User' }
    };
    
    const { supabase } = await import('@/lib/supabase/client');
    
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup(
        'newuser@example.com',
        'password',
        'New User'
      );
      // No error thrown means success
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle logout', async () => {
    const { supabase } = await import('@/lib/supabase/client');
    
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle session on mount', async () => {
    const mockUser = { 
      id: '789', 
      email: 'existing@example.com',
      user_metadata: { full_name: 'Existing User' }
    };
    
    const { supabase } = await import('@/lib/supabase/client');
    
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: 'token',
          user: mockUser 
        } 
      },
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});