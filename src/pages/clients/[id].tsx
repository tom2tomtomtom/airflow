import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const ClientDetailsPage: React.FC = () => {
  return (
    <>
       <Head>
        <title>Client Details | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Client Details">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Client Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Client details page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default ClientDetailsPage;
