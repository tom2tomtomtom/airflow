import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const CampaignBuilderPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Campaign Builder | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Campaign Builder">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Campaign Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Campaign builder coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default CampaignBuilderPage;