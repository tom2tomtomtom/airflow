import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  Alert,
  Fab,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import SocialPublisher from '@/components/social/SocialPublisher';
import PlatformConnections from '@/components/social/PlatformConnections';
import ScheduledPosts from '@/components/social/ScheduledPosts';
import PublishingAnalytics from '@/components/social/PublishingAnalytics';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SocialPublishingPage: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [showPublisher, setShowPublisher] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Load platform connections
  useEffect(() => {
    if (activeClient) {
      loadPlatforms();
    }
  }, [activeClient]);

  const loadPlatforms = async () => {
    if (!activeClient) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/social/platforms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-client-id': activeClient.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.platforms || []);
      } else {
        throw new Error('Failed to load platform connections');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Error loading platforms:', error);

      }
      setError(error instanceof Error ? error.message : 'Failed to load platforms');
      showNotification('Failed to load platform connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePublishSuccess = () => {
    showNotification('Posts published successfully!', 'success');
    setShowPublisher(false);
    // Refresh data if needed
    if (activeTab === 2) {
      // Refresh analytics
    }
  };

  const connectedPlatforms = platforms.filter(p => p.isConnected);
  const activePlatforms = connectedPlatforms.filter(p => p.status === 'active');

  if (!activeClient) {
    return (
      <DashboardLayout title="Social Publishing">
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to manage social publishing
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Social Publishing | AIrFLOW</title>
      </Head>
      <DashboardLayout title="Social Publishing">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Social Media Publishing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Publish and schedule content across multiple social media platforms
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Connected Platforms
                </Typography>
                <Typography variant="h4">
                  {connectedPlatforms.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activePlatforms.length} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Scheduled Posts
                </Typography>
                <Typography variant="h4">
                  {scheduledCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Posts Today
                </Typography>
                <Typography variant="h4">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Published
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Engagement Rate
                </Typography>
                <Typography variant="h4">
                  4.2%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab 
                label="Publish" 
                icon={<PublishIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Platforms" 
                icon={<SettingsIcon />} 
                iconPosition="start"
              />
              <Tab
                label={
                  <Badge badgeContent={scheduledCount} color="primary">
                    Schedule
                  </Badge>
                }
                icon={<ScheduleIcon />}
                iconPosition="start"
              />
              <Tab
                label="Analytics"
                icon={<AnalyticsIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {/* Publishing Interface */}
            {connectedPlatforms.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No Platforms Connected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connect your social media accounts to start publishing
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab(1)}
                  startIcon={<SettingsIcon />}
                >
                  Connect Platforms
                </Button>
              </Box>
            ) : (
              <SocialPublisher
                platforms={connectedPlatforms}
                onSuccess={handlePublishSuccess}
                clientId={activeClient.id}
              />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {/* Platform Connections */}
            <PlatformConnections
              clientId={activeClient.id}
              onConnectionUpdate={loadPlatforms}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {/* Scheduled Posts */}
            <ScheduledPosts
              clientId={activeClient.id}
              onScheduleUpdate={(count) => setScheduledCount(count)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {/* Publishing Analytics */}
            <PublishingAnalytics
              clientId={activeClient.id}
              platforms={connectedPlatforms}
            />
          </TabPanel>
        </Paper>

        {/* Quick Publish FAB */}
        {activeTab !== 0 && connectedPlatforms.length > 0 && (
          <Fab
            color="primary"
            aria-label="quick publish"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setActiveTab(0)}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Publisher Dialog */}
        {showPublisher && (
          <SocialPublisher
            platforms={connectedPlatforms}
            onSuccess={handlePublishSuccess}
            onClose={() => setShowPublisher(false)}
            clientId={activeClient.id}
            dialog
          />
        )}
      </DashboardLayout>
    </>
  );
};

export default SocialPublishingPage;