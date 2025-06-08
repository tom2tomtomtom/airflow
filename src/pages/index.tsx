import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router, isAuthenticated, loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <Box
        className="loading-container"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          backgroundColor: 'var(--carbon-bg-primary)',
          color: 'var(--carbon-text-primary)',
        }}
      >
        <Typography sx={{ color: 'var(--carbon-text-primary)' }}>Loading...</Typography>
      </Box>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--carbon-bg-primary)',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--carbon-amber-main)' }}>
              AIrFLOW
            </Typography>
            <Typography variant="h5" color="textSecondary" paragraph>
              AI-Powered Content Management Platform
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4 }}>
              Create, manage, and optimize your digital content with the power of AI.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{ px: 4 }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{ px: 4 }}
              >
                Get Started
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Redirecting if authenticated
  return (
    <Box
      className="loading-container"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        backgroundColor: 'var(--carbon-bg-primary)',
        color: 'var(--carbon-text-primary)',
      }}
    >
      <Typography sx={{ color: 'var(--carbon-text-primary)' }}>Redirecting to dashboard...</Typography>
    </Box>
  );
};

export default HomePage;
