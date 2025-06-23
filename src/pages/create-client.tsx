import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const CreateClientPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Client | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Create Client">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Create Client
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create Client page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default CreateClientPage;
