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
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import {
  PlayArrow,
  CloudUpload,
  Description,
  Analytics,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Schedule,
  Edit as Draft,
} from '@mui/icons-material';
import { SimplifiedLayout } from '@/components/SimplifiedLayout';
import { UnifiedBriefWorkflow } from '@/components/UnifiedBriefWorkflow';

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
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CleanStrategicContent: React.FC = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleWorkflowComplete = (workflowData: any) => {
    console.log('Workflow completed:', workflowData);
    // Handle workflow completion
  };

  const recentBriefs = [
    { name: 'Summer Campaign Brief', status: 'Completed', date: '2 hours ago' },
    { name: 'Product Launch Strategy', status: 'In Progress', date: '1 day ago' },
    { name: 'Social Media Guidelines', status: 'Draft', date: '3 days ago' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle color="success" />;
      case 'In Progress': return <Schedule color="warning" />;
      case 'Draft': return <Draft color="disabled" />;
      default: return <Description />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  return (
    <SimplifiedLayout title="Strategic Content">
      <Head>
        <title>Strategic Content | AIrWAVE</title>
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Hero Section - Super Clean */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight={300}
            sx={{ mb: 2 }}
          >
            Strategic Content Creation
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}
          >
            Upload your brief and let AI guide you through the complete workflow
          </Typography>
          
          {/* Primary Action */}
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={() => setOpenWorkflow(true)}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Brief Workflow →
          </Button>
        </Box>

        {/* Advanced Options - Hidden by default */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <Button
              variant="text"
              onClick={() => setShowAdvanced(!showAdvanced)}
              endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </Box>
          
          <Collapse in={showAdvanced}>
            <Card>
              <CardContent>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  centered
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                >
                  <Tab label="Recent Briefs" />
                  <Tab label="Templates" />
                  <Tab label="Analytics" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" gutterBottom>
                    Recent Briefs
                  </Typography>
                  <List>
                    {recentBriefs.map((brief, index) => (
                      <ListItem key={index} divider={index < recentBriefs.length - 1}>
                        <ListItemIcon>
                          {getStatusIcon(brief.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={brief.name}
                          secondary={brief.date}
                        />
                        <Chip 
                          label={brief.status} 
                          size="small" 
                          color={getStatusColor(brief.status) as any}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box mt={2}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => router.push('/briefs')}
                    >
                      View All Briefs
                    </Button>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box textAlign="center" py={4}>
                    <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Brief Templates
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Start with pre-built brief templates for common use cases
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Button variant="outlined" fullWidth>
                          Product Launch
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button variant="outlined" fullWidth>
                          Brand Campaign
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button variant="outlined" fullWidth>
                          Social Media
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button variant="outlined" fullWidth>
                          Event Promotion
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box textAlign="center" py={4}>
                    <Analytics sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Content Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Track how your strategic content performs across campaigns
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Analytics will be available after you create your first brief workflow
                    </Alert>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </Collapse>
        </Box>

        {/* Quick Tips - Always visible but minimal */}
        <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💡 Quick Tips
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Upload any PDF, Word, or text file as your brief<br/>
              • AI will extract key information and generate motivations<br/>
              • The workflow guides you from brief to final video render<br/>
              • All steps are automated with smart suggestions
            </Typography>
          </CardContent>
        </Card>

        {/* Unified Brief Workflow Modal */}
        <UnifiedBriefWorkflow
          open={openWorkflow}
          onClose={() => setOpenWorkflow(false)}
          onComplete={handleWorkflowComplete}
        />
      </Container>
    </SimplifiedLayout>
  );
};

export default CleanStrategicContent;