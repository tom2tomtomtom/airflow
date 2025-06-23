import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const UsersPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Users | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Users">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            User management coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default UsersPage;
