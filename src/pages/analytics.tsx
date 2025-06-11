import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const AnalyticsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Analytics | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Analytics">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analytics dashboard coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default AnalyticsPage;