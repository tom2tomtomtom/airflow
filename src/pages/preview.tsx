import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const PreviewPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Preview | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Preview">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Preview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Preview page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default PreviewPage;
