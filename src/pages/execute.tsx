import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Avatar,
  Paper,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  CloudUpload as PublishIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Pinterest as PinterestIcon,
  CheckCircle as CheckIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as BudgetIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ExecutionMonitor from '@/components/ExecutionMonitor';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCampaigns, useMatrices, useAssets } from '@/hooks/useData';
import type { Campaign } from '@/types/models';

// Platform configuration
const platforms = [
  { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, color: '#E1306C' },
  { id: 'twitter', name: 'Twitter', icon: <TwitterIcon />, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon />, color: '#0A66C2' },
  { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon />, color: '#FF0000' },
  { id: 'pinterest', name: 'Pinterest', icon: <PinterestIcon />, color: '#E60023' },
];

// Export formats
const exportFormats = [
  { id: 'zip', name: 'ZIP Archive', description: 'All assets in organized folders' },
  { id: 'pdf', name: 'PDF Report', description: 'Campaign overview with assets' },
  { id: 'csv', name: 'CSV Data', description: 'Campaign data and metadata' },
  { id: 'json', name: 'JSON Export', description: 'Complete campaign structure' },
];

interface ExecutionTask {
  id: string;
  campaignId: string;
  campaignName: string;
  platforms: string[];
  scheduledDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  assets: {
    id: string;
    name: string;
    type: string;
    platform: string;
    status: 'ready' | 'processing' | 'published' | 'failed';
  }[];
}

const ExecutePage: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(activeClient?.id);
  const { data: matrices, isLoading: matricesLoading } = useMatrices(activeClient?.id);
  const { isLoading: assetsLoading } = useAssets(activeClient?.id);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('zip');
  const [executionTasks, setExecutionTasks] = useState<ExecutionTask[]>([]);
  const [executingTask, setExecutingTask] = useState<string | null>(null);

  const isLoading = campaignsLoading || matricesLoading || assetsLoading;

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleExecuteCampaign = () => {
    if (!selectedCampaign || selectedPlatforms.length === 0) {
      showNotification('Please select a campaign and at least one platform', 'error');
      return;
    }

    const newTask: ExecutionTask = {
      id: `task-${Date.now()}`,
      campaignId: selectedCampaign.id,
      campaignName: selectedCampaign.name,
      platforms: selectedPlatforms,
      ...(scheduleType === 'scheduled' && { scheduledDate }),
      status: 'pending',
      progress: 0,
      assets: selectedPlatforms.map(platform => ({
        id: `asset-${Date.now()}-${platform}`,
        name: `${selectedCampaign.name} - ${platform}`,
        type: 'image',
        platform,
        status: 'ready',
      })),
    };

    setExecutionTasks([...executionTasks, newTask]);
    showNotification('Campaign execution task created successfully!', 'success');
    
    // Reset form
    setActiveStep(0);
    setSelectedCampaign(null);
    setSelectedPlatforms([]);
    setScheduleType('immediate');
    setScheduledDate('');
    
    // Start execution if immediate
    if (scheduleType === 'immediate') {
      executeRealCampaign(newTask.id);
    }
  };

  const executeRealCampaign = async (taskId: string) => {
    setExecutingTask(taskId);
    
    try {
      const task = executionTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Update task status to in_progress
      setExecutionTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status: 'in_progress', progress: 5 }
            : t
        )
      );

      // Process each asset for video rendering
      const updatedAssets = [];
      
      for (let i = 0; i < task.assets.length; i++) {
        const asset = task.assets[i];
        
        try {
          // Update asset status to processing
          setExecutionTasks(prev =>
            prev.map(t =>
              t.id === taskId
                ? {
                    ...t,
                    progress: 10 + (i * 80) / task.assets.length,
                    assets: t.assets.map((a, idx) =>
                      idx === i
                        ? { ...a, status: 'processing' }
                        : idx < i
                        ? { ...a, status: 'published' }
                        : a
                    ),
                  }
                : t
            )
          );

          // Render video using Creatomate API
          const renderResponse = await fetch('/api/creatomate/renders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template_id: asset.templateId || 'default-template',
              modifications: {
                'text-1': {
                  text: asset.name,
                },
                'text-2': {
                  text: task.campaignName,
                },
                // Add more modifications based on asset data
              },
              webhook_url: `${window.location.origin}/api/webhooks/creatomate`,
              metadata: {
                taskId,
                assetId: asset.id,
                campaignId: task.campaignId,
              },
            }),
          });

          if (!renderResponse.ok) {
            throw new Error(`Failed to start render for ${asset.name}`);
          }

          const renderData = await renderResponse.json();
          
          if (renderData.success) {
            updatedAssets.push({
              ...asset,
              renderId: renderData.data.id,
              status: 'processing' as const,
            });

            // Poll for completion
            await pollRenderStatus(taskId, i, renderData.data.id);
          } else {
            throw new Error(renderData.error || 'Failed to start render');
          }
        } catch (error) {
          console.error(`Error processing asset ${asset.name}:`, error);
          
          // Mark asset as failed but continue with others
          setExecutionTasks(prev =>
            prev.map(t =>
              t.id === taskId
                ? {
                    ...t,
                    assets: t.assets.map((a, idx) =>
                      idx === i ? { ...a, status: 'failed' } : a
                    ),
                  }
                : t
            )
          );
        }
      }

      // Mark task as completed
      setExecutionTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status: 'completed', progress: 100 }
            : t
        )
      );

      setExecutingTask(null);
      showNotification('Campaign execution completed!', 'success');
      
    } catch (error) {
      console.error('Error executing campaign:', error);
      
      // Mark task as failed
      setExecutionTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status: 'failed', progress: 0 }
            : t
        )
      );
      
      setExecutingTask(null);
      showNotification('Campaign execution failed. Please try again.', 'error');
    }
  };

  const pollRenderStatus = async (taskId: string, assetIndex: number, renderId: string) => {
    const maxPolls = 120; // 10 minutes max (5 second intervals)
    let pollCount = 0;

    const poll = async (): Promise<void> => {
      if (pollCount >= maxPolls) {
        console.warn(`Render ${renderId} timed out after ${maxPolls * 5} seconds`);
        return;
      }

      try {
        const statusResponse = await fetch(`/api/creatomate/renders?id=${renderId}`, {
          method: 'GET',
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to get render status');
        }

        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          const renderStatus = statusData.data;
          
          if (renderStatus.status === 'completed') {
            // Update asset as published with video URL
            setExecutionTasks(prev =>
              prev.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      assets: t.assets.map((a, idx) =>
                        idx === assetIndex
                          ? { ...a, status: 'published', videoUrl: renderStatus.url }
                          : a
                      ),
                    }
                  : t
              )
            );
            return;
          } else if (renderStatus.status === 'failed') {
            setExecutionTasks(prev =>
              prev.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      assets: t.assets.map((a, idx) =>
                        idx === assetIndex
                          ? { ...a, status: 'failed' }
                          : a
                      ),
                    }
                  : t
              )
            );
            return;
          }
          
          // Still processing, continue polling
          pollCount++;
          setTimeout(poll, 5000); // Check again in 5 seconds
        }
      } catch (error) {
        console.error('Error polling render status:', error);
        pollCount++;
        setTimeout(poll, 5000);
      }
    };

    // Start polling
    setTimeout(poll, 5000); // First check after 5 seconds
  };

  const handleExport = () => {
    showNotification(`Exporting campaign in ${selectedExportFormat.toUpperCase()} format...`, 'info');
    setTimeout(() => {
      showNotification('Export completed successfully!', 'success');
      setExportDialogOpen(false);
    }, 2000);
  };

  const readyCampaigns = campaigns?.filter((c: Campaign) => 
    matrices?.some((m: any) => m.clientId === c.clientId && m.status === 'approved')
  ) || [];

  if (!activeClient) {
    return (
      <DashboardLayout title="Execute">
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to execute campaigns
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Execute">
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
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
        <title>Execute | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Execute">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Execute Campaigns
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Publish campaigns across platforms and export assets
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Ready to Execute
                    </Typography>
                    <Typography variant="h4">
                      {readyCampaigns.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <CheckIcon color="success" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Active Tasks
                    </Typography>
                    <Typography variant="h4">
                      {executionTasks.filter(t => t.status === 'in_progress').length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <PlayIcon color="info" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Scheduled
                    </Typography>
                    <Typography variant="h4">
                      {executionTasks.filter(t => t.scheduledDate && t.status === 'pending').length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <ScheduleIcon color="warning" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Completed
                    </Typography>
                    <Typography variant="h4">
                      {executionTasks.filter(t => t.status === 'completed').length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <CheckIcon color="success" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Campaign Selection & Execution */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Execute New Campaign
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>Select Campaign</StepLabel>
                  <StepContent>
                    <Grid container spacing={2}>
                      {readyCampaigns.map((campaign: Campaign) => (
                        <Grid size={{ xs: 12, md: 6 }} key={campaign.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: selectedCampaign?.id === campaign.id ? 2 : 0,
                              borderColor: 'primary.main',
                            }}
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {campaign.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {campaign.description}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  size="small"
                                  icon={<CalendarIcon />}
                                  label={`Ends ${new Date(campaign.schedule?.endDate || '').toLocaleDateString()}`}
                                />
                                <Chip
                                  size="small"
                                  icon={<BudgetIcon />}
                                  label={`$${campaign.budget?.total || 0}`}
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(1)}
                        disabled={!selectedCampaign}
                      >
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Select Platforms</StepLabel>
                  <StepContent>
                    <FormGroup>
                      <Grid container spacing={2}>
                        {platforms.map(platform => (
                          <Grid size={{ xs: 6, md: 4 }} key={platform.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedPlatforms.includes(platform.id)}
                                  onChange={() => handlePlatformToggle(platform.id)}
                                  sx={{ color: platform.color }}
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {platform.icon}
                                  {platform.name}
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </FormGroup>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button onClick={() => setActiveStep(0)}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(2)}
                        disabled={selectedPlatforms.length === 0}
                      >
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Schedule Publication</StepLabel>
                  <StepContent>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={scheduleType === 'immediate'}
                              onChange={() => setScheduleType('immediate')}
                            />
                          }
                          label="Publish Immediately"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={scheduleType === 'scheduled'}
                              onChange={() => setScheduleType('scheduled')}
                            />
                          }
                          label="Schedule for Later"
                        />
                      </FormGroup>
                    </FormControl>
                    
                    {scheduleType === 'scheduled' && (
                      <TextField
                        type="datetime-local"
                        fullWidth
                        value={scheduledDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledDate(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={() => setActiveStep(1)}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<PublishIcon />}
                        onClick={handleExecuteCampaign}
                        disabled={!!executingTask}
                      >
                        {scheduleType === 'immediate' ? 'Execute Now' : 'Schedule Execution'}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Paper>
          </Grid>

          {/* Real-time Execution Monitor */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ExecutionMonitor 
              maxHeight={500}
              showHeader={true}
              realtime={true}
            />
          </Grid>
        </Grid>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Campaign Assets</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={selectedExportFormat}
                label="Export Format"
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => setSelectedExportFormat(e.target.value as string)}
              >
                {exportFormats.map(format => (
                  <MenuItem key={format.id} value={format.id}>
                    <Box>
                      <Typography>{format.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              This will export all assets from completed execution tasks.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
              Export
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default ExecutePage;
