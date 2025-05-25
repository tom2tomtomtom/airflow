import React, { useState } from 'react';
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

// Mock data for charts
const performanceData = [
  { date: '2024-01-01', views: 4500, engagement: 320, conversions: 45 },
  { date: '2024-01-02', views: 5200, engagement: 380, conversions: 52 },
  { date: '2024-01-03', views: 4800, engagement: 350, conversions: 48 },
  { date: '2024-01-04', views: 6100, engagement: 420, conversions: 61 },
  { date: '2024-01-05', views: 7200, engagement: 480, conversions: 72 },
  { date: '2024-01-06', views: 6800, engagement: 460, conversions: 68 },
  { date: '2024-01-07', views: 7500, engagement: 510, conversions: 75 },
];

const platformData = [
  { name: 'Instagram', value: 35, color: '#E1306C' },
  { name: 'Facebook', value: 25, color: '#1877F2' },
  { name: 'Twitter', value: 20, color: '#1DA1F2' },
  { name: 'LinkedIn', value: 15, color: '#0A66C2' },
  { name: 'YouTube', value: 5, color: '#FF0000' },
];

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

const topPerformingContent = [
  {
    id: 1,
    title: 'Summer Fitness Challenge',
    platform: 'Instagram',
    views: 125000,
    engagement: 8.5,
    conversion: 3.2,
    trend: 'up',
  },
  {
    id: 2,
    title: 'Protein Shake Recipe',
    platform: 'YouTube',
    views: 98000,
    engagement: 7.2,
    conversion: 2.8,
    trend: 'up',
  },
  {
    id: 3,
    title: 'Morning Workout Routine',
    platform: 'Facebook',
    views: 76000,
    engagement: 6.8,
    conversion: 2.5,
    trend: 'down',
  },
  {
    id: 4,
    title: 'Healthy Meal Prep',
    platform: 'LinkedIn',
    views: 54000,
    engagement: 5.5,
    conversion: 2.1,
    trend: 'stable',
  },
];

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { activeClient } = useClient();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(activeClient?.id);
  const { isLoading: matricesLoading } = useMatrices(activeClient?.id);
  
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('chart');
  const [comparison, setComparison] = useState('period');

  const isLoading = campaignsLoading || matricesLoading;

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

  if (isLoading) {
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
                  onChange={(e) => setTimeRange(e.target.value)}
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
                  onChange={(e) => setSelectedCampaign(e.target.value)}
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
                  onChange={(e) => setSelectedPlatform(e.target.value)}
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
              <Button startIcon={<RefreshIcon />}>Refresh</Button>
              <Button variant="contained" startIcon={<DownloadIcon />}>Export</Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Views"
              value="1.2M"
              change={15.3}
              icon={<ViewsIcon />}
              color="info.light"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Engagement Rate"
              value="6.8%"
              change={-2.1}
              icon={<EngagementIcon />}
              color="warning.light"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Conversions"
              value="2,845"
              change={23.5}
              icon={<ConversionIcon />}
              color="success.light"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Revenue"
              value="$45.2K"
              change={18.7}
              icon={<RevenueIcon />}
              color="primary.light"
            />
          </Grid>
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
                  <ResponsiveContainer width="100%" height="100%">
                    {viewMode === 'chart' ? (
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill={theme.palette.primary.main} />
                        <Bar dataKey="engagement" fill={theme.palette.secondary.main} />
                        <Bar dataKey="conversions" fill={theme.palette.success.main} />
                      </BarChart>
                    ) : (
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="views" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} />
                        <Area type="monotone" dataKey="engagement" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.light} />
                        <Area type="monotone" dataKey="conversions" stroke={theme.palette.success.main} fill={theme.palette.success.light} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Platform Distribution</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
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
                <List>
                  {platformData.map((platform) => (
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
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Top Performing Content</Typography>
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
                      {topPerformingContent.map((content) => (
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
                              <Chip label="Stable" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                  onChange={(e) => setComparison(e.target.value)}
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
                      245%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average return on investment
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Spent</Typography>
                        <Typography variant="body2" fontWeight="bold">$18,500</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Revenue</Typography>
                        <Typography variant="body2" fontWeight="bold">$45,325</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Net Profit</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">$26,825</Typography>
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
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">ROI</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {campaigns?.slice(0, 5).map((campaign: any) => {
                        const spent = Math.floor(Math.random() * 5000) + 1000;
                        const revenue = Math.floor(spent * (Math.random() * 3 + 1));
                        const roi = ((revenue - spent) / spent * 100).toFixed(0);
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell>{campaign.name}</TableCell>
                            <TableCell align="right">${spent.toLocaleString()}</TableCell>
                            <TableCell align="right">${revenue.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Typography color={parseInt(roi) > 0 ? 'success.main' : 'error.main'}>
                                {roi}%
                              </Typography>
                            </TableCell>
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
