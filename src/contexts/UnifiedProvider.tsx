import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';
import { getThemeConfig } from '@/styles/theme';
import { ThemeModeProvider, useThemeMode } from '@/contexts/ThemeContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UnifiedErrorBoundary } from '@/components/UnifiedErrorBoundary';

// Create a single query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// UI Provider - handles theme, loading, and notifications
function UIProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = getThemeConfig(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <LoadingProvider>
          <NotificationProvider>
            <UnifiedErrorBoundary context="page">{children}</UnifiedErrorBoundary>
          </NotificationProvider>
        </LoadingProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

// Core Infrastructure Provider - handles data fetching and theme mode
function CoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <UIProvider>{children}</UIProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

// Main Unified Provider - combines all core providers
export function UnifiedProvider({ children }: { children: React.ReactNode }) {
  return <CoreProvider>{children}</CoreProvider>;
}

// Export the query client for use in other parts of the app
export { queryClient };
