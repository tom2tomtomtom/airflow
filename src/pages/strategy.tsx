import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const StrategyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Strategy | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Strategy">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Strategy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Strategy page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default StrategyPage;
