import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Alert,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  CircularProgress,
  Divider,
  CardContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  TouchApp as TouchAppIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as Chart,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getErrorMessage } from '@/utils/errorUtils';

interface PerformanceDashboardProps {
  clientId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
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

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  clientId,
  dateRange,
}) => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    granularity: 'day',
    metrics: ['impressions', 'clicks', 'conversions', 'spend'],
    platform: '',
    campaignId: '',
  });

  const targetClientId = clientId || activeClient?.id;

  // Load data
  useEffect(() => {
    if (targetClientId) {
      loadPerformanceData();
      loadInsights();
    }
  }, [targetClientId, filters, dateRange]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (targetClientId) {
        loadPerformanceData();
        loadInsights();
      }
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [targetClientId]);

  const loadPerformanceData = async () => {
    if (!targetClientId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        client_id: targetClientId,
        granularity: filters.granularity,
        metrics: filters.metrics.join(','),
      });

      if (dateRange?.start) params.append('date_from', dateRange.start);
      if (dateRange?.end) params.append('date_to', dateRange.end);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.campaignId) params.append('campaign_id', filters.campaignId);

      const response = await fetch(`/api/analytics/performance?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.data);
      } else {
        throw new Error('Failed to load performance data');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Error loading performance data:', error);
      showNotification('Failed to load performance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!targetClientId) return;

    try {
      const params = new URLSearchParams({
        client_id: targetClientId,
        insight_types: 'performance,optimization,trends,anomalies,predictions',
      });

      if (dateRange?.start) params.append('date_from', dateRange.start);
      if (dateRange?.end) params.append('date_to', dateRange.end);

      const response = await fetch(`/api/analytics/insights?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const handleRefresh = () => {
    loadPerformanceData();
    loadInsights();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon fontSize="small" />;
    if (change < 0) return <TrendingDownIcon fontSize="small" />;
    return null;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  if (!targetClientId) {
    return (
      <Alert severity="info">
        Please select a client to view performance dashboard
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Performance Dashboard
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Granularity</InputLabel>
              <Select
                value={filters.granularity}
                label="Granularity"
                onChange={(e) => setFilters({ ...filters, granularity: e.target.value })}
              >
                <MenuItem value="hour">Hourly</MenuItem>
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select
                value={filters.platform}
                label="Platform"
                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
              >
                <MenuItem value="">All Platforms</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="youtube">YouTube</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['impressions', 'clicks', 'conversions', 'spend'].map((metric) => (
                <Chip
                  key={metric}
                  label={metric}
                  onClick={() => {
                    const newMetrics = filters.metrics.includes(metric)
                      ? filters.metrics.filter(m => m !== metric)
                      : [...filters.metrics, metric];
                    setFilters({ ...filters, metrics: newMetrics });
                  }}
                  color={filters.metrics.includes(metric) ? 'primary' : 'default'}
                  variant={filters.metrics.includes(metric) ? 'filled' : 'outlined'}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CardContent>
          {/* KPI Cards */}
          {performanceData && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          Total Impressions
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {performanceData.aggregatedMetrics.total_impressions.toLocaleString()}
                        </Typography>
                        {performanceData.comparisons && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {getChangeIcon(performanceData.comparisons.previous_period.impressions_change)}
                            <Typography 
                              variant="caption" 
                              color={getChangeColor(performanceData.comparisons.previous_period.impressions_change) + '.main'}
                            >
                              {performanceData.comparisons.previous_period.impressions_change > 0 ? '+' : ''}
                              {performanceData.comparisons.previous_period.impressions_change}%
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                      <VisibilityIcon sx={{ color: "primary.main" }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          Total Clicks
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {performanceData.aggregatedMetrics.total_clicks.toLocaleString()}
                        </Typography>
                        {performanceData.comparisons && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {getChangeIcon(performanceData.comparisons.previous_period.clicks_change)}
                            <Typography 
                              variant="caption" 
                              color={getChangeColor(performanceData.comparisons.previous_period.clicks_change) + '.main'}
                            >
                              {performanceData.comparisons.previous_period.clicks_change > 0 ? '+' : ''}
                              {performanceData.comparisons.previous_period.clicks_change}%
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                      <TouchAppIcon sx={{ color: 'info.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          Total Conversions
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {performanceData.aggregatedMetrics.total_conversions.toLocaleString()}
                        </Typography>
                        {performanceData.comparisons && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {getChangeIcon(performanceData.comparisons.previous_period.conversions_change)}
                            <Typography 
                              variant="caption" 
                              color={getChangeColor(performanceData.comparisons.previous_period.conversions_change) + '.main'}
                            >
                              {performanceData.comparisons.previous_period.conversions_change > 0 ? '+' : ''}
                              {performanceData.comparisons.previous_period.conversions_change}%
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                      <AssessmentIcon sx={{ color: 'success.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          Total Spend
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          ${performanceData.aggregatedMetrics.total_spend.toLocaleString()}
                        </Typography>
                        {performanceData.comparisons && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {getChangeIcon(performanceData.comparisons.previous_period.spend_change)}
                            <Typography 
                              variant="caption" 
                              color={getChangeColor(performanceData.comparisons.previous_period.spend_change) + '.main'}
                            >
                              {performanceData.comparisons.previous_period.spend_change > 0 ? '+' : ''}
                              {performanceData.comparisons.previous_period.spend_change}%
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                      <MoneyIcon sx={{ color: 'warning.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Performance Metrics Cards */}
          {performanceData && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  < sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Click-Through Rate
                    </Typography>
                    <Typography variant="h3" color="primary.main">
                      {performanceData.aggregatedMetrics.average_ctr}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Industry avg: {performanceData.comparisons?.benchmarks?.industry_avg_ctr || 2.5}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  < sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {performanceData.aggregatedMetrics.average_conversion_rate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Industry avg: {performanceData.comparisons?.benchmarks?.industry_avg_conversion_rate || 3.8}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  < sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Cost Per Click
                    </Typography>
                    <Typography variant="h3" color="info.main">
                      ${performanceData.aggregatedMetrics.average_cpc}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cost efficiency
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  < sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Performance Score
                    </Typography>
                    <Typography variant="h3" color="warning.main">
                      {performanceData.comparisons?.benchmarks?.performance_score || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Out of 100
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Main Content Tabs */}
          <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab 
                  label="Time Series" 
                  icon={<CircularProgress />}
                  iconPosition="start"
                />
                <Tab 
                  label="Insights" 
                  icon={<LightbulbIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Top Performers" 
                  icon={<AssessmentIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={activeTab} index={0}>
                {performanceData && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Performance Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={performanceData.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Chart />
                        <Legend />
                        <Area type="monotone" dataKey="impressions" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="clicks" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                        <Area type="monotone" dataKey="conversions" stackId="3" stroke="#ffc658" fill="#ffc658" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {insights && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Performance Insights & Recommendations
                    </Typography>
                    
                    {/* Performance Insights */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Performance Insights
                      </Typography>
                      <Grid container spacing={2}>
                        {insights.performance_insights.map((insight: any, index: number) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Alert 
                              severity={insight.type}
                              icon={getInsightIcon(insight.type)}
                              sx={{ mb: 1 }}
                            >
                              <Typography variant="subtitle2" gutterBottom>
                                {insight.title}
                              </Typography>
                              <Typography variant="body2" paragraph>
                                {insight.description}
                              </Typography>
                              {insight.recommendation && (
                                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                  💡 {insight.recommendation}
                                </Typography>
                              )}
                            </Alert>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Optimization Opportunities */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Optimization Opportunities
                      </Typography>
                      <List>
                        {insights.optimization_opportunities.map((opportunity: any, index: number) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemIcon>
                                <Chip 
                                  label={opportunity.priority_score} 
                                  color={getPriorityColor(opportunity.effort_required) as any}
                                  size="small"
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={opportunity.title}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" paragraph>
                                      {opportunity.description}
                                    </Typography>
                                    <Typography variant="caption" color="success.main">
                                      📈 {opportunity.potential_impact}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                      ⚡ {opportunity.effort_required} effort
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < insights.optimization_opportunities.length - 1 && <CircularProgress />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>

                    {/* Predictions */}
                    {insights.predictions && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                          30-Day Predictions
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card>
                              < sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Expected Impressions
                                </Typography>
                                <Typography variant="h5">
                                  {insights.predictions.next_30_days.expected_impressions.toLocaleString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card>
                              < sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Expected Conversions
                                </Typography>
                                <Typography variant="h5">
                                  {insights.predictions.next_30_days.expected_conversions.toLocaleString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card>
                              < sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Expected Spend
                                </Typography>
                                <Typography variant="h5">
                                  ${insights.predictions.next_30_days.expected_spend.toLocaleString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card>
                              < sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Confidence Level
                                </Typography>
                                <Typography variant="h5">
                                  {insights.predictions.next_30_days.confidence_level}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                {performanceData && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Top Performers
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Top Campaigns */}
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                              Top Campaigns
                            </Typography>
                            <List dense>
                              {performanceData.topPerformers.campaigns.map((campaign: any, index: number) => (
                                <ListItem key={campaign.id}>
                                  <ListItemText
                                    primary={campaign.name}
                                    secondary={`ROAS: ${campaign.roas} • Conversions: ${campaign.conversions}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Top Content */}
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                              Top Content
                            </Typography>
                            <List dense>
                              {performanceData.topPerformers.content.map((content: any, index: number) => (
                                <ListItem key={content.id}>
                                  <ListItemText
                                    primary={content.title}
                                    secondary={`${content.platform} • Engagement: ${content.engagement_rate}%`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Top Platforms */}
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                              Platform Performance
                            </Typography>
                            <List dense>
                              {performanceData.topPerformers.platforms.map((platform: any, index: number) => (
                                <ListItem key={platform.name}>
                                  <ListItemText
                                    primary={platform.name}
                                    secondary={`Efficiency Score: ${platform.efficiency_score} • Spend: $${platform.spend}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </TabPanel>
            </Box>
          </Paper>
        </CardContent>
      )}
    </Box>
  );
};

export default PerformanceDashboard;