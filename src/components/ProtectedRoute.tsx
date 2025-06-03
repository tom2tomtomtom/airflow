import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const { loading, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Preserve the current path for redirect after login
      const currentPath = router.asPath;
      const loginUrl = currentPath !== '/' && currentPath !== '/login' 
        ? `${redirectTo}?from=${encodeURIComponent(currentPath)}`
        : redirectTo;
        
      router.replace(loginUrl);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}