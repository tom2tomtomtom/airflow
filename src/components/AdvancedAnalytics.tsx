import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  ThumbUp,
  Share,
  PlayArrow,
  Download,
  Refresh,
  Info,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
} from '@mui/icons-material';

interface AnalyticsMetric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface PerformanceData {
  period: string;
  views: number;
  engagement: number;
  shares: number;
  conversions: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`analytics-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const metrics: AnalyticsMetric[] = [
    {
      id: 'total-views',
      label: 'Total Views',
      value: '24.5K',
      change: 12.5,
      trend: 'up',
      icon: <Visibility />,
      color: '#2196F3',
    },
    {
      id: 'engagement-rate',
      label: 'Engagement Rate',
      value: '8.2%',
      change: -2.1,
      trend: 'down',
      icon: <ThumbUp />,
      color: '#4CAF50',
    },
    {
      id: 'shares',
      label: 'Shares',
      value: '1.2K',
      change: 25.3,
      trend: 'up',
      icon: <Share />,
      color: '#FF9800',
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: '3.8%',
      change: 5.7,
      trend: 'up',
      icon: <TrendingUp />,
      color: '#9C27B0',
    },
    {
      id: 'avg-watch-time',
      label: 'Avg. Watch Time',
      value: '2:34',
      change: 8.9,
      trend: 'up',
      icon: <PlayArrow />,
      color: '#F44336',
    },
    {
      id: 'roi',
      label: 'ROI',
      value: '340%',
      change: 15.2,
      trend: 'up',
      icon: <Timeline />,
      color: '#00BCD4',
    },
  ];

  const performanceData: PerformanceData[] = [
    { period: 'Week 1', views: 5200, engagement: 420, shares: 89, conversions: 23 },
    { period: 'Week 2', views: 6800, engagement: 580, shares: 124, conversions: 31 },
    { period: 'Week 3', views: 8100, engagement: 720, shares: 156, conversions: 42 },
    { period: 'Week 4', views: 9400, engagement: 890, shares: 203, conversions: 58 },
  ];

  const topPerformingContent = [
    { title: 'Summer Campaign Video', views: '12.3K', engagement: '9.2%', platform: 'Instagram' },
    { title: 'Product Launch Teaser', views: '8.7K', engagement: '7.8%', platform: 'LinkedIn' },
    { title: 'Behind the Scenes', views: '6.1K', engagement: '12.1%', platform: 'TikTok' },
    { title: 'Customer Testimonial', views: '4.9K', engagement: '8.9%', platform: 'Facebook' },
  ];

  const handleTimeRangeChange = (newRange: string) => {
    setLoading(true);
    setTimeRange(newRange);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
    return null;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={e => handleTimeRangeChange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric: AnalyticsMetric) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={metric.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
                  <Avatar
                    sx={{
                      bgcolor: metric.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                  <Tooltip title="More info">
                    <IconButton size="small" aria-label="Icon button">
                      {' '}
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="h4" fontWeight={600} gutterBottom>
                  {metric.value}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.label}
                </Typography>

                <Box display="flex" alignItems="center" gap={0.5}>
                  {getTrendIcon(metric.trend)}
                  <Typography
                    variant="caption"
                    color={
                      metric.trend === 'up'
                        ? 'success.main'
                        : metric.trend === 'down'
                          ? 'error.main'
                          : 'text.secondary'
                    }
                    fontWeight={500}
                  >
                    {formatChange(metric.change)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs last period
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab icon={<ShowChart />} label="Performance Trends" />
            <Tab icon={<BarChart />} label="Content Analysis" />
            <Tab icon={<PieChart />} label="Audience Insights" />
            <Tab icon={<Timeline />} label="ROI Analysis" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Performance Trends */}
          <Typography variant="h6" gutterBottom>
            Performance Over Time
          </Typography>
          <Box
            sx={{
              height: 300,
              bgcolor: 'grey.50',
              borderRadius: 1,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              📊 Interactive Chart Component Would Go Here
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Engagement</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Conversions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceData.map((row: PerformanceData) => (
                  <TableRow key={row.period}>
                    <TableCell>{row.period}</TableCell>
                    <TableCell align="right">{row.views.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.engagement}</TableCell>
                    <TableCell align="right">{row.shares}</TableCell>
                    <TableCell align="right">{row.conversions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Content Analysis */}
          <Typography variant="h6" gutterBottom>
            Top Performing Content
          </Typography>
          <Grid container spacing={2}>
            {topPerformingContent.map((content, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="between" alignItems="start" mb={2}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {content.title}
                      </Typography>
                      <Chip label={content.platform} size="small" color="primary" />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Views
                        </Typography>
                        <Typography variant="h6">{content.views}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Engagement
                        </Typography>
                        <Typography variant="h6">{content.engagement}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Audience Insights */}
          <Typography variant="h6" gutterBottom>
            Audience Demographics
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: 250,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">🥧 Age Distribution Chart</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: 250,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">🌍 Geographic Distribution</Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* ROI Analysis */}
          <Typography variant="h6" gutterBottom>
            Return on Investment Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main" fontWeight={600}>
                    340%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall ROI
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main" fontWeight={600}>
                    $2.40
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenue per $1 spent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main" fontWeight={600}>
                    45 days
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payback period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AdvancedAnalytics;
