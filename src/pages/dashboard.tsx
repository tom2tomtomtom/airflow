import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as DescriptionIcon,
  Campaign as CampaignIcon,
  AutoAwesome as AIIcon,
  TrendingUp,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import ActivityFeed from '@/components/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const DashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { activeClient, clients } = useClient();

  // Quick actions for easy navigation
  const quickActions: QuickAction[] = [
    {
      title: 'Generate AI Image',
      description: 'Create images with DALL-E 3',
      icon: <AIIcon />,
      color: '#9c27b0',
      href: '/assets?tab=ai',
    },
    {
      title: 'Browse Templates',
      description: 'Start from pre-built templates',
      icon: <DescriptionIcon />,
      color: '#2196f3',
      href: '/templates',
    },
    {
      title: 'Content Matrix',
      description: 'Plan your content strategy',
      icon: <CampaignIcon />,
      color: '#4caf50',
      href: '/matrix',
    },
    {
      title: 'Asset Library',
      description: 'Manage your digital assets',
      icon: <ImageIcon />,
      color: '#ff9800',
      href: '/assets',
    },
  ];

  // Mock statistics for demo
  const stats: StatCard[] = [
    {
      title: 'Total Assets',
      value: 127,
      change: '+12%',
      trend: 'up',
      icon: <ImageIcon />,
    },
    {
      title: 'AI Generated',
      value: 48,
      change: '+25%',
      trend: 'up',
      icon: <AIIcon />,
    },
    {
      title: 'Active Campaigns',
      value: 5,
      change: '0%',
      trend: 'neutral',
      icon: <CampaignIcon />,
    },
    {
      title: 'Templates Used',
      value: 23,
      change: '+8%',
      trend: 'up',
      icon: <DescriptionIcon />,
    },
  ];

  // Handle activity click
  const handleActivityClick = (activity: any) => {
    // Navigate based on activity type
    switch (activity.type) {
      case 'campaign_created':
      case 'campaign_updated':
      case 'campaign_launched':
        router.push('/campaigns');
        break;
      case 'asset_uploaded':
      case 'asset_generated':
        router.push('/assets');
        break;
      case 'matrix_created':
      case 'matrix_approved':
        router.push('/matrix');
        break;
      case 'approval_requested':
        router.push('/sign-off');
        break;
      case 'performance_alert':
        router.push('/analytics');
        break;
      default:
        break;
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | AIrWAVE</title>
      </Head>

      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {activeClient ? (
              <>Working on: <Chip label={activeClient.name} size="small" /></>
            ) : (
              'Select a client to get started'
            )}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp
                          sx={{
                            fontSize: 16,
                            color: stat.trend === 'up' ? 'success.main' : 'text.secondary',
                            transform: stat.trend === 'down' ? 'rotate(180deg)' : 'none',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: stat.trend === 'up' ? 'success.main' : 'text.secondary',
                            ml: 0.5,
                          }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: 'primary.light',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.cloneElement(stat.icon as React.ReactElement, {
                        sx: { color: 'primary.main' },
                      })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom mb={2}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} mb={4}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => router.push(action.href)}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: action.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {React.cloneElement(action.icon as React.ReactElement, {
                      sx: { color: 'white' },
                    })}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" color="primary">
                    <ArrowForward />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Activity Feed and Getting Started */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ActivityFeed
              compact
              maxItems={5}
              onActivityClick={handleActivityClick}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  New to AIrWAVE? Here are some things you can do:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Generate AI images with DALL-E 3
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Create content matrices for campaigns
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Use templates for quick content creation
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Manage and organize your digital assets
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Track campaign performance with analytics
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Get real-time updates with the activity feed
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={() => router.push('/assets?tab=ai')}
              >
                Start Creating
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default DashboardPage;
