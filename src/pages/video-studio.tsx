import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const VideoStudioPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Video Studio | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Video Studio">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Video Studio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Video Studio page coming soon
          </Typography>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default VideoStudioPage;
