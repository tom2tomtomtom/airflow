import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Tabs,
  Tab,
  Stack,
  Chip,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  MenuItem,
  InputAdornment,
  Badge,
  LinearProgress,
  TextField,
  Select,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Assessment as AssessmentIcon,
  SmartToy as SmartToyIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
// import VideoGenerationTab from '@/components/generate/VideoGenerationTab';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

interface VideoStudioStats {
  total_generations: number;
  active_generations: number;
  completed_today: number;
  success_rate: number;
  total_videos_created: number;
  average_generation_time: number;
}

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

const VideoStudioPage: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<VideoStudioStats | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  // Load data
  useEffect(() => {
    if (activeClient) {
      loadStudioData();
      loadRecentGenerations();
    }
  }, [activeClient]);

  // Auto-refresh active generations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeClient && stats && stats.active_generations > 0) {
      interval = setInterval(() => {
        loadStudioData();
        loadRecentGenerations();
      }, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeClient, stats]);

  const loadStudioData = async () => {
    if (!activeClient) return;

    try {
      setLoading(true);
      
      // Load video generation statistics
      const statsResponse = await fetch(`/api/video/generations?client_id=${activeClient.id}&limit=1000`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // Calculate stats from the data
        const generations = statsData.data || [];
        const today = new Date().toISOString().split('T')[0];
        
        const activeCount = generations.filter((gen: any) => 
          ['pending', 'processing'].includes(gen.status)
        ).length;
        
        const completedToday = generations.filter((gen: any) => 
          gen.status === 'completed' && gen.created_at.startsWith(today)
        ).length;
        
        const completedCount = generations.filter((gen: any) => 
          gen.status === 'completed'
        ).length;
        
        const successRate = generations.length > 0 
          ? Math.round((completedCount / generations.length) * 100)
          : 0;

        setStats({
          total_generations: generations.length,
          active_generations: activeCount,
          completed_today: completedToday,
          success_rate: successRate,
          total_videos_created: completedCount,
          average_generation_time: 2.5, // minutes - could be calculated from actual data
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Error loading studio data:', error);

      }
    } finally {
      setLoading(false);
    }
  };

  const loadRecentGenerations = async () => {
    if (!activeClient) return;

    try {
      const params = new URLSearchParams({
        client_id: activeClient.id,
        limit: '10',
        sort_by: 'created_at',
        sort_order: 'desc',
        include_jobs: 'true',
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await fetch(`/api/video/generations?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentGenerations(data.data || []);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Error loading recent generations:', error);

      }
    }
  };

  const handleRefresh = () => {
    loadStudioData();
    loadRecentGenerations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'processing': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'failed': return <ErrorIcon />;
      case 'processing': return <ScheduleIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <Card>
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="caption" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: `${color}.main` } })}
          </Box>
        </Box>
      </>
    </Card>
  );

  if (!activeClient) {
    return (
      <DashboardLayout title="Video Studio">
        <Box textAlign="center" py={8}>
          <VideocamIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
             a client to access Video Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered video generation and management tools
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Video Studio | AIrFLOW</title>
      </Head>
      <DashboardLayout title="Video Studio">
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                  Video Studio
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  AI-powered video generation and management for {activeClient.name}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setActiveTab(0)}
                >
                  New Generation
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Stats Cards */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2}>
                <StatCard
                  title="Total Generations"
                  value={stats.total_generations}
                  subtitle="All time"
                  icon={<VideocamIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <StatCard
                  title="Active"
                  value={stats.active_generations}
                  subtitle="Currently processing"
                  icon={<ScheduleIcon />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <StatCard
                  title="Completed Today"
                  value={stats.completed_today}
                  subtitle="Videos generated"
                  icon={<CheckIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <StatCard
                  title="Success Rate"
                  value={`${stats.success_rate}%`}
                  subtitle="Completion rate"
                  icon={<TrendingUpIcon />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <StatCard
                  title="Total Videos"
                  value={stats.total_videos_created}
                  subtitle="Successfully created"
                  icon={<PlayArrowIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <StatCard
                  title="Avg. Time"
                  value={`${stats.average_generation_time}m`}
                  subtitle="Generation time"
                  icon={<ScheduleIcon />}
                  color="info"
                />
              </Grid>
            </Grid>
          )}

          {/* Active Generations Alert */}
          {stats && stats.active_generations > 0 && (
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => setActiveTab(1)}
                >
                  View Progress
                </Button>
              }
            >
              <Typography>
                You have {stats.active_generations} video generation{stats.active_generations > 1 ? 's' : ''} in progress.
              </Typography>
            </Alert>
          )}

          {/* Main Content */}
          <Paper sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab 
                  label="Generate Videos" 
                  icon={<AddIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Badge badgeContent={stats?.active_generations || 0} color="primary">
                      Management
                    </Badge>
                  }
                  icon={<AssessmentIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Analytics" 
                  icon={<AnalyticsIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 3 }}>
                  <Alert severity="info">
                    Video Generation Tab temporarily disabled during build fixes. Will be restored soon.
                  </Alert>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Generation Management
                  </Typography>
                  
                  {/* Filters */}
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Search generations..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="From Date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="To Date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button
                          startIcon={<FilterIcon />}
                          onClick={loadRecentGenerations}
                          disabled={loading}
                        >
                          Apply Filters
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Recent Generations */}
                  {recentGenerations.length > 0 ? (
                    <List>
                      {recentGenerations.map((generation) => (
                        <ListItem
                          key={generation.generation_id}
                          divider
                          secondaryAction={
                            <Stack direction="row" spacing={1}>
                              <Chip
                                size="small"
                                label={generation.status}
                                color={getStatusColor(generation.status) as any}
                                icon={getStatusIcon(generation.status)}
                              />
                              {generation.progress && generation.progress.status === 'processing' && (
                                <Chip
                                  size="small"
                                  label={`${generation.progress.percentage}%`}
                                  color="primary"
                                />
                              )}
                            </Stack>
                          }
                        >
                          <ListItemIcon>
                            {generation.context.type === 'brief' && <SmartToyIcon />}
                            {generation.context.type === 'campaign' && <CampaignIcon />}
                            {generation.context.type === 'matrix' && <AssessmentIcon />}
                            {generation.context.type === 'standalone' && <VideocamIcon />}
                          </ListItemIcon>
                          <ListItemText
                            primary={`Generation ${generation.generation_id.split('-')[1]}`}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Context: {generation.context.type} • 
                                  Jobs: {generation.jobs?.length || 1} • 
                                  Created: {new Date(generation.created_at).toLocaleString()}
                                </Typography>
                                {generation.progress && generation.progress.status === 'processing' && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={generation.progress.percentage} 
                                    sx={{ mt: 1 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <VideocamIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No video generations found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start creating videos in the Generate Videos tab
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Video Generation Analytics
                  </Typography>
                  <Alert severity="info">
                    Analytics dashboard coming soon! Track generation performance, success rates, and usage patterns.
                  </Alert>
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default VideoStudioPage;