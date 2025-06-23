import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const ApprovalsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Approvals | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Approvals">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Approvals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Approval workflow coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default ApprovalsPage;
