import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Image as ImageIcon,
  Description as DescriptionIcon,
  Campaign as CampaignIcon,
  AutoAwesome as AIIcon,
  TrendingUp,
  TrendingDown,
  Remove as TrendingNeutral,
  ArrowForward,
  Add,
  Business as BusinessIcon,
  Approval as ApprovalIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { ActivityFeed } from '@/components/ActivityFeed';
import ExecutionMonitor from '@/components/ExecutionMonitor';
import ApprovalWorkflow from '@/components/ApprovalWorkflow';
import RealTimeDashboard from '@/components/realtime/RealTimeDashboard';
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
  const { user, loading, isAuthenticated } = useAuth();
  const { activeClient } = useClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

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

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!isAuthenticated || loading) return;

      try {
        setStatsLoading(true);
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        if (data.success) {
          setDashboardStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to load stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStatsError(error instanceof Error ? error.message : 'Failed to load stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [isAuthenticated, loading]);

  const getStatCards = (): StatCard[] => {
    if (!dashboardStats) return [];

    return [
      {
        title: 'Total Assets',
        value: dashboardStats.totalAssets.count,
        change: dashboardStats.totalAssets.change,
        trend: dashboardStats.totalAssets.trend,
        icon: <ImageIcon />,
      },
      {
        title: 'AI Generated',
        value: dashboardStats.aiGenerated.count,
        change: dashboardStats.aiGenerated.change,
        trend: dashboardStats.aiGenerated.trend,
        icon: <AIIcon />,
      },
      {
        title: 'Active Campaigns',
        value: dashboardStats.activeCampaigns.count,
        change: dashboardStats.activeCampaigns.change,
        trend: dashboardStats.activeCampaigns.trend,
        icon: <CampaignIcon />,
      },
      {
        title: 'Templates Used',
        value: dashboardStats.templatesUsed.count,
        change: dashboardStats.templatesUsed.change,
        trend: dashboardStats.templatesUsed.trend,
        icon: <DescriptionIcon />,
      },
      {
        title: 'Total Clients',
        value: dashboardStats.totalClients.count,
        change: dashboardStats.totalClients.change,
        trend: dashboardStats.totalClients.trend,
        icon: <BusinessIcon />,
      },
      {
        title: 'Pending Approvals',
        value: dashboardStats.pendingApprovals.count,
        change: dashboardStats.pendingApprovals.change,
        trend: dashboardStats.pendingApprovals.trend,
        icon: <ApprovalIcon />,
      },
    ];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />;
      default:
        return <TrendingNeutral fontSize="small" sx={{ color: 'text.secondary' }} />;
    }
  };

  const stats = getStatCards();

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

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

        {/* Error State */}
        {statsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {statsError}
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid container spacing={3} mb={4}>
          {statsLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                      <CircularProgress size={24} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
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
                          {getTrendIcon(stat.trend)}
                          <Typography
                            variant="body2"
                            sx={{
                              color: stat.trend === 'up' ? 'success.main' : 
                                     stat.trend === 'down' ? 'error.main' : 'text.secondary',
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
          ))
          )}
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

        {/* Real-Time Dashboard Section */}
        <Typography variant="h5" gutterBottom mb={2}>
          Real-Time Operations
        </Typography>
        <RealTimeDashboard />

        {/* Enhanced Dashboard Widgets */}
        <Typography variant="h5" gutterBottom mt={4} mb={2}>
          Dashboard Overview
        </Typography>
        <Grid container spacing={3}>
          {/* Execution Monitor */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, height: 500 }}>
              <ExecutionMonitor
                maxHeight={450}
                showHeader={true}
                realtime={true}
              />
            </Paper>
          </Grid>

          {/* Approval Workflow */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, height: 500 }}>
              <ApprovalWorkflow
                maxHeight={450}
                showHeader={true}
                showActions={true}
              />
            </Paper>
          </Grid>

          {/* Activity Feed */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, height: 500 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <ActivityFeed
                maxHeight={400}
                showHeader={false}
                realtime={true}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Getting Started Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Getting Started with AIrWAVE
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    New to AIrWAVE? Here's your workflow:
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Upload Briefs:</strong> Start with your creative brief or strategy document
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Generate Motivations:</strong> AI extracts key motivations and insights
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Create Content Matrix:</strong> Plan campaigns across platforms and formats
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Execute & Monitor:</strong> Launch campaigns and track real-time progress
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Approve & Optimize:</strong> Streamlined approval workflows with analytics
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Tips & Shortcuts
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Chip 
                      label="Press Ctrl+K for quick search" 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label="Use bulk approvals for efficiency" 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label="Monitor executions in real-time" 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label="Retry failed executions automatically" 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => router.push('/assets?tab=ai')}
                  >
                    Start Creating Content
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default DashboardPage;
