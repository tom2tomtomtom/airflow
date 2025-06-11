import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const ClientsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Clients | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Clients">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Clients
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Client management coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default ClientsPage;