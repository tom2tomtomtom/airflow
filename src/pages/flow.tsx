import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  AutoAwesome as MagicIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

// Lazy load the workflow component for better performance
const UnifiedBriefWorkflow = dynamic(
  () => import('@/components/UnifiedBriefWorkflow').then(mod => ({ default: mod.UnifiedBriefWorkflow })),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
);

const FlowPage: React.FC = () => {
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  const handleWorkflowComplete = () => {
    setOpenWorkflow(false);
    showNotification('Content workflow completed successfully!', 'success');
  };

  return (
    <>
      <Head>
        <title>Flow - AI Content Workflow | AIrFLOW</title>
        <meta name="description" content="AI-powered content generation workflow" />
      </Head>

      <DashboardLayout title="Flow">
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              AI Content Workflow
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate strategic content with AI using our unified workflow.
              {activeClient && ` Working on: ${activeClient.name}`}
            </Typography>
          </Box>

          {/* Main Content */}
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <MagicIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                AI Content Generation
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Use our unified workflow to upload briefs and generate strategic content with AI.
                Our AI will analyze your brand guidelines and create content that aligns with your objectives.
              </Typography>
            </Box>

            {!activeClient ? (
              <Box sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Please select a client to start the content workflow.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ py: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<MagicIcon />}
                  onClick={() => setOpenWorkflow(true)}
                  sx={{ 
                    py: 2, 
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 2 
                  }}
                >
                  Start Flow
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                What you can do:
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary.main">
                    Upload Briefs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload strategy documents and briefs
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary.main">
                    AI Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI analyzes your content and objectives
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary.main">
                    Content Generation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate strategic content automatically
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Unified Brief Workflow */}
          <UnifiedBriefWorkflow
            open={openWorkflow}
            onClose={() => setOpenWorkflow(false)}
            onComplete={handleWorkflowComplete}
          />
        </Box>
      </DashboardLayout>
    </>
  );
};

export default FlowPage;