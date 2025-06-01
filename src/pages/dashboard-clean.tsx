import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Collapse,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Schedule,
  TrendingUp,
  VideoLibrary,
  Analytics,
  Settings,
  Help,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CleanDashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const recentProjects = [
    { name: 'Summer Campaign 2024', status: 'In Progress', progress: 75 },
    { name: 'Product Launch Video', status: 'Completed', progress: 100 },
    { name: 'Social Media Series', status: 'Draft', progress: 25 },
  ];

  const quickStats = [
    { label: 'Active Projects', value: '3', icon: <VideoLibrary /> },
    { label: 'Completed This Month', value: '12', icon: <CheckCircle /> },
    { label: 'Success Rate', value: '94%', icon: <TrendingUp /> },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | AIrWAVE</title>
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Super Clean Hero */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            fontWeight={300}
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Create Amazing Videos
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}
          >
            Upload your brief, let AI generate motivations and copy, then render stunning videos in minutes
          </Typography>
          
          {/* Single Primary Action */}
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={() => router.push('/strategic-content')}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Creating →
          </Button>
        </Box>

        {/* Quick Stats - Hidden by default, expandable */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <Button
              variant="text"
              onClick={() => setShowAdvanced(!showAdvanced)}
              endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              {showAdvanced ? 'Hide' : 'Show'} Dashboard Details
            </Button>
          </Box>
          
          <Collapse in={showAdvanced}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  centered
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab label="Overview" />
                  <Tab label="Recent Projects" />
                  <Tab label="Analytics" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    {quickStats.map((stat, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Box textAlign="center">
                          <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 1 }}>
                            {stat.icon}
                          </Avatar>
                          <Typography variant="h4" fontWeight={600}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <List>
                    {recentProjects.map((project, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <VideoLibrary />
                          </ListItemIcon>
                          <ListItemText
                            primary={project.name}
                            secondary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                  label={project.status} 
                                  size="small" 
                                  color={project.status === 'Completed' ? 'success' : 'default'}
                                />
                                <Typography variant="caption">
                                  {project.progress}% complete
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentProjects.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box textAlign="center" py={4}>
                    <Analytics sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Analytics Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Detailed analytics and performance metrics
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => router.push('/analytics')}
                    >
                      View Full Analytics
                    </Button>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </Collapse>
        </Box>

        {/* Simple Footer Actions */}
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="text"
            startIcon={<Help />}
            onClick={() => router.push('/help')}
            sx={{ textTransform: 'none' }}
          >
            Help & Tutorials
          </Button>
          <Button
            variant="text"
            startIcon={<Settings />}
            onClick={() => router.push('/settings')}
            sx={{ textTransform: 'none' }}
          >
            Settings
          </Button>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default CleanDashboard;