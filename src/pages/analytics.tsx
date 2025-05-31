import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewsIcon,
  TouchApp as EngagementIcon,
  ShoppingCart as ConversionIcon,
  AttachMoney as RevenueIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Campaign as CampaignIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useClient } from '@/contexts/ClientContext';
import { useCampaigns, useMatrices } from '@/hooks/useData';
import { useNotification } from '@/contexts/NotificationContext';
import { getErrorMessage } from '@/utils/errorUtils';

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

// Static data for analytics features not yet in real data
const audienceData = [
  { age: '18-24', male: 25, female: 30 },
  { age: '25-34', male: 35, female: 40 },
  { age: '35-44', male: 30, female: 28 },
  { age: '45-54', male: 20, female: 22 },
  { age: '55+', male: 15, female: 18 },
];

const contentPerformance = [
  { subject: 'Engagement', A: 85, B: 72, fullMark: 100 },
  { subject: 'Reach', A: 78, B: 86, fullMark: 100 },
  { subject: 'Conversions', A: 90, B: 68, fullMark: 100 },
  { subject: 'CTR', A: 72, B: 80, fullMark: 100 },
  { subject: 'ROI', A: 88, B: 75, fullMark: 100 },
];

interface AnalyticsData {
  performanceData: Array<any>;
  platformData: Array<any>;
  topPerformingContent: Array<any>;
  kpiSummary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    averageCTR: number;
    averageConversionRate: number;
    averageCPC: number;
    roas: number;
  };
  trends: {
    impressions: { value: number; change: number };
    clicks: { value: number; change: number };
    conversions: { value: number; change: number };
    spend: { value: number; change: number };
  };
  dateRange: {
    start: string;
    end: string;
  };
}

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { activeClient } = useClient();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(activeClient?.id);
  const { isLoading: matricesLoading } = useMatrices(activeClient?.id);
  const { showNotification } = useNotification();
  
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('chart');
  const [comparison, setComparison] = useState('period');
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const isLoading = campaignsLoading || matricesLoading || analyticsLoading;

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!activeClient) {
        setAnalyticsData(null);
        setAnalyticsLoading(false);
        return;
      }

      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        
        // Calculate date range based on timeRange
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case '24h':
            startDate.setDate(startDate.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
          default:
            startDate.setDate(startDate.getDate() - 7);
        }
        
        const params = new URLSearchParams({
          clientId: activeClient.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        
        if (selectedCampaign !== 'all') {
          params.append('campaignId', selectedCampaign);
        }
        
        if (selectedPlatform !== 'all') {
          params.append('platform', selectedPlatform);
        }
        
        const response = await fetch(`/api/analytics/overview?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const result = await response.json();
        if (result.success) {
          setAnalyticsData(result.data);
        } else {
          throw new Error(result.error || 'Failed to load analytics');
        }
      } catch (error) {
        const message = getErrorMessage(error);
        console.error('Error fetching analytics:', error);
        setAnalyticsError(message);
        showNotification('Failed to load analytics data', 'error');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeClient, timeRange, selectedCampaign, selectedPlatform, showNotification]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <InstagramIcon />;
      case 'facebook': return <FacebookIcon />;
      case 'twitter': return <TwitterIcon />;
      case 'linkedin': return <LinkedInIcon />;
      case 'youtube': return <YouTubeIcon />;
      default: return <CampaignIcon />;
    }
  };

  const handleRefresh = () => {
    if (activeClient) {
      // Trigger refresh by updating a dependency
      setAnalyticsLoading(true);
      // The useEffect will handle the refresh
    }
  };

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {change > 0 ? (
                <ArrowUpIcon color="success" fontSize="small" />
              ) : (
                <ArrowDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={change > 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(change)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: color || 'primary.light' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (!activeClient) {
    return (
      <DashboardLayout title="Analytics">
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to view analytics
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (isLoading && !analyticsData) {
    return (
      <DashboardLayout title="Analytics">
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <LoadingSkeleton variant="card" />
            </Grid>
          ))}
        </Grid>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Analytics">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Campaign Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track performance metrics and ROI across all campaigns
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={selectedCampaign}
                  label="Campaign"
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setSelectedCampaign(e.target.value)}
                >
                  <MenuItem value="all">All Campaigns</MenuItem>
                  {campaigns?.map((campaign: any) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Platform</InputLabel>
                <Select
                  value={selectedPlatform}
                  label="Platform"
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setSelectedPlatform(e.target.value)}
                >
                  <MenuItem value="all">All Platforms</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="facebook">Facebook</MenuItem>
                  <MenuItem value="twitter">Twitter</MenuItem>
                  <MenuItem value="linkedin">LinkedIn</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh}
                disabled={analyticsLoading}
              >
                Refresh
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />}>Export</Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error State */}
        {analyticsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {analyticsError}
          </Alert>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {analyticsLoading ? (
            // Loading skeletons
            [...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                      <CircularProgress size={24} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : analyticsData ? (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Impressions"
                  value={analyticsData.kpiSummary.totalImpressions.toLocaleString()}
                  change={analyticsData.trends.impressions.change}
                  icon={<ViewsIcon />}
                  color="info.light"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="CTR"
                  value={`${analyticsData.kpiSummary.averageCTR}%`}
                  change={((analyticsData.trends.clicks.value / Math.max(analyticsData.trends.impressions.value, 1)) * 100 - analyticsData.kpiSummary.averageCTR).toFixed(1)}
                  icon={<EngagementIcon />}
                  color="warning.light"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Conversions"
                  value={analyticsData.kpiSummary.totalConversions.toLocaleString()}
                  change={analyticsData.trends.conversions.change}
                  icon={<ConversionIcon />}
                  color="success.light"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Spend"
                  value={`$${analyticsData.kpiSummary.totalSpend.toLocaleString()}`}
                  change={analyticsData.trends.spend.change}
                  icon={<RevenueIcon />}
                  color="primary.light"
                />
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No analytics data available for the selected filters.
              </Alert>
            </Grid>
          )}
        </Grid>

        {/* Main Content */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="Overview" />
              <Tab label="Engagement" />
              <Tab label="Audience" />
              <Tab label="Content Performance" />
              <Tab label="ROI Analysis" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {/* Overview Tab */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Performance Trend</Typography>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                    size="small"
                  >
                    <ToggleButton value="chart">
                      <BarChartIcon />
                    </ToggleButton>
                    <ToggleButton value="area">
                      <TimelineIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box sx={{ height: 400 }}>
                  {analyticsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : analyticsData && analyticsData.performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {viewMode === 'chart' ? (
                        <BarChart data={analyticsData.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="impressions" fill={theme.palette.primary.main} name="Impressions" />
                          <Bar dataKey="clicks" fill={theme.palette.secondary.main} name="Clicks" />
                          <Bar dataKey="conversions" fill={theme.palette.success.main} name="Conversions" />
                        </BarChart>
                      ) : (
                        <AreaChart data={analyticsData.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="impressions" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} name="Impressions" />
                          <Area type="monotone" dataKey="clicks" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.light} name="Clicks" />
                          <Area type="monotone" dataKey="conversions" stroke={theme.palette.success.main} fill={theme.palette.success.light} name="Conversions" />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography color="text.secondary">
                        No performance data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Platform Distribution</Typography>
                <Box sx={{ height: 300 }}>
                  {analyticsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : analyticsData && analyticsData.platformData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.platformData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography color="text.secondary">
                        No platform data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {/* Engagement Tab */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Engagement metrics show how your audience interacts with your content across different platforms and campaigns.
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Engagement by Platform</Typography>
                {analyticsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : analyticsData && analyticsData.platformData.length > 0 ? (
                  <List>
                    {analyticsData.platformData.map((platform) => (
                      <ListItem key={platform.name}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: platform.color }}>
                            {getPlatformIcon(platform.name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={platform.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={platform.value}
                                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">{platform.value}%</Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No platform engagement data available
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Top Performing Content</Typography>
                {analyticsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : analyticsData && analyticsData.topPerformingContent.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Content</TableCell>
                          <TableCell align="right">Views</TableCell>
                          <TableCell align="right">Engagement</TableCell>
                          <TableCell>Trend</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analyticsData.topPerformingContent.map((content) => (
                          <TableRow key={content.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getPlatformIcon(content.platform)}
                                <Typography variant="body2">{content.title}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">{content.views.toLocaleString()}</TableCell>
                            <TableCell align="right">{content.engagement}%</TableCell>
                            <TableCell>
                              {content.trend === 'up' ? (
                                <TrendingUpIcon color="success" />
                              ) : content.trend === 'down' ? (
                                <TrendingDownIcon color="error" />
                              ) : (
                                <Chip label="Neutral" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No top performing content data available
                  </Typography>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {/* Audience Tab */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Age & Gender Distribution</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={audienceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="male" fill={theme.palette.primary.main} />
                      <Bar dataKey="female" fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Audience Insights</Typography>
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Top Locations
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label="United States (35%)" size="small" />
                        <Chip label="United Kingdom (18%)" size="small" />
                        <Chip label="Canada (12%)" size="small" />
                      </Stack>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Active Hours
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Peak engagement: 7-9 PM EST
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Device Types
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label="Mobile (68%)" size="small" color="primary" />
                        <Chip label="Desktop (28%)" size="small" />
                        <Chip label="Tablet (4%)" size="small" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {/* Content Performance Tab */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">A/B Test Performance</Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Comparison</InputLabel>
                <Select
                  value={comparison}
                  label="Comparison"
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setComparison(e.target.value)}
                >
                  <MenuItem value="period">Period Comparison</MenuItem>
                  <MenuItem value="variant">Variant Comparison</MenuItem>
                  <MenuItem value="platform">Platform Comparison</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={contentPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Variant A" dataKey="A" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} fillOpacity={0.6} />
                  <Radar name="Variant B" dataKey="B" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.light} fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            {/* ROI Analysis Tab */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Campaign ROI</Typography>
                    <Typography variant="h3" color="success.main">
                      {analyticsData ? `${analyticsData.kpiSummary.roas.toFixed(0)}%` : '0%'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average return on investment
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Spent</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${analyticsData ? analyticsData.kpiSummary.totalSpend.toLocaleString() : '0'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Clicks</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {analyticsData ? analyticsData.kpiSummary.totalClicks.toLocaleString() : '0'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Conversions</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {analyticsData ? analyticsData.kpiSummary.totalConversions.toLocaleString() : '0'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>ROI by Campaign</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Campaign</TableCell>
                        <TableCell align="right">Spent</TableCell>
                        <TableCell align="right">Clicks</TableCell>
                        <TableCell align="right">Conversions</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {campaigns?.slice(0, 5).map((campaign: any) => {
                        const spent = Math.floor(Math.random() * 5000) + 1000;
                        const clicks = Math.floor(Math.random() * 1000) + 100;
                        const conversions = Math.floor(Math.random() * 100) + 10;
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell>{campaign.name}</TableCell>
                            <TableCell align="right">${spent.toLocaleString()}</TableCell>
                            <TableCell align="right">{clicks.toLocaleString()}</TableCell>
                            <TableCell align="right">{conversions.toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={campaign.status}
                                size="small"
                                color={campaign.status === 'active' ? 'success' : 'default'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </DashboardLayout>
    </>
  );
};

export default AnalyticsPage;