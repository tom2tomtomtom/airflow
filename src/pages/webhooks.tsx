import React from 'react';
import { NextPage } from 'next';
import { DashboardLayout } from '@/components/DashboardLayout';
import WebhookManager from '@/components/WebhookManager';
import { Box, Typography } from '@mui/material';

const WebhooksPage: NextPage = () => {
  return (
    <DashboardLayout title="Webhooks">
      <Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Webhooks
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure webhooks to receive real-time notifications about events in your campaigns
        </Typography>
        
        <WebhookManager />
      </Box>
    </DashboardLayout>
  );
};

export default WebhooksPage;