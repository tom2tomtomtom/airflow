import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const ExecutePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Execute | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Execute">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Execute
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Execute page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default ExecutePage;