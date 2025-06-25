import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import { swaggerSpec } from '@/lib/swagger';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  loading: () => (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress />
    </Box>
  ),
  ssr: false }) as any;

export default function ApiDocsPage() {
  return (
    <>
       <Head>
        <title>API Documentation - Airflow</title>
        <meta name="description" content="Comprehensive API documentation for Airflow platform" />
      </Head>

      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Airflow API Documentation
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Comprehensive documentation for all Airflow API endpoints. This interactive
              documentation allows you to explore and test API endpoints directly from your browser.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Getting Started
            </Typography>
            <Typography variant="body2" paragraph>
              • All API endpoints require authentication via JWT token or session cookie • Base URL:{' '}
              <code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</code>• All
              responses follow a consistent format with success/error indicators • Rate limiting is
              applied to prevent abuse
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Authentication
            </Typography>
            <Typography variant="body2" paragraph>
              Use the "Authorize" button below to authenticate your requests. You can use either: •
              Bearer token in the Authorization header • Session cookie (automatically handled by
              browser)
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <SwaggerUI spec={swaggerSpec} />
          </Paper>
        </Box>
      </DashboardLayout>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {}
  };
}
