import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';

const ExecutePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeClient, loading: clientLoading } = useClient();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect to client creation if authenticated but no active client
  React.useEffect(() => {
    if (!clientLoading && isAuthenticated && !activeClient) {
      router.push('/create-client?first=true');
    }
  }, [activeClient, clientLoading, isAuthenticated, router]);

  if (authLoading || clientLoading || !activeClient) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Execute | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Execute">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Execute
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Campaign distribution configuration and performance tracking
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body1">
            This page is under construction. It will allow you to execute campaigns across multiple platforms.
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default ExecutePage;
