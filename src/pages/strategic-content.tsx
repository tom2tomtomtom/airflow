import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const StrategicContentPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Strategic Content | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Strategic Content">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Strategic Content
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Strategic Content page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default StrategicContentPage;
