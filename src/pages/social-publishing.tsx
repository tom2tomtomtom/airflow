import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const SocialPublishingPage: React.FC = () => {
  return (
    <>
       <Head>
        <title>Social Publishing | Airflow</title>
      </Head>
      <DashboardLayout title="Social Publishing">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Social Publishing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Social Publishing page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default SocialPublishingPage;
