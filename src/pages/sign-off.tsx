import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const SignOffPage: React.FC = () => {
  return (
    <>
       <Head>
        <title>Sign Off | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Sign Off">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Sign Off
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign Off page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default SignOffPage;
