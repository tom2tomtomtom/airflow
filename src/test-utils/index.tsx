import React from 'react';
import { render as rtlRender } from '@testing-library/react';
// import { vi } from 'vitest'; // Using Jest instead
const vi = jest;

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({ data: null, error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

// Custom render function with providers
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { ...options });
}

// Mock router
export const createMockRouter = (router: Record<string, unknown> = {}) => ({
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  ...router,
});

export * from '@testing-library/react';
