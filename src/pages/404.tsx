import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Home as HomeIcon, Dashboard as DashboardIcon } from '@mui/icons-material';

export default function Custom404() {
  const router = useRouter();

  return (
    <>
       <Head>
        <title>404 - Page Not Found | Airflow</title>
      </Head>

      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center' }}
        >
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              maxWidth: 500 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: '120px',
                fontWeight: 700,
                color: 'primary.main',
                mb: 2 }}
            >
              404
            </Typography>

            <Typography variant="h4" gutterBottom>
              Page Not Found
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The page you&apos;re looking for doesn&apos;t exist. It might have been moved or
              deleted.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<DashboardIcon />}
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>

              <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => router.push('/')}>
                Go Home
              </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                If you believe this is an error, please contact support.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
}
