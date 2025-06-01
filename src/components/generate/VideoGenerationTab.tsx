import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  Button,
  Stack,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Videocam as VideocamIcon,
  Style as StyleIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  SmartToy as ,
  Delete as DeleteIcon,
  Visibility as ,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getErrorMessage } from '@/utils/errorUtils';

// Enhanced interfaces
interface VideoGeneration {
  generation_id: string;
  latest_job_id: string;
  client_id: string;
  context: {
    type: 'standalone' | 'brief' | 'campaign' | 'matrix';
    id?: string;
    name?: string;
    client?: any;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_url?: string;
  asset_id?: string;
  error_message?: string;
  config: any;
  created_at: string;
  updated_at: string;
}

interface VideoGenerationJob {
  id: string;
  variation_index: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    percentage: number;
    message: string;
    status: string;
  };
  output_url?: string;
  asset_id?: string;
  error_message?: string;
  config: any;
  created_at: string;
  updated_at: string;
}

interface VideoGenerationTabProps {
  briefId?: string;
  campaignId?: string;
  matrixId?: string;
  generationType?: 'standalone' | 'brief' | 'campaign' | 'matrix';
}

// Available contexts for video generation
interface VideoContext {
  id: string;
  name: string;
  type: 'brief' | 'campaign' | 'matrix';
  description?: string;
}

const VideoGenerationTab: React.FC<VideoGenerationTabProps> = ({
  briefId,
  campaignId,
  matrixId,
  generationType = 'standalone',
}) => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // Video configuration state
  const [videoConfig, setVideoConfig] = useState({
    prompt: '',
    style: 'commercial',
    duration: 15,
    resolution: '1080p',
    platform: '',
    aspect_ratio: '16:9',
    quality: 'standard',
  });

  // Content elements state
  const [contentElements, setContentElements] = useState({
    text_overlays: [],
    background_music: false,
    voice_over: null,
    brand_elements: {},
  });

  // Generation settings state
  const [generationSettings, setGenerationSettings] = useState({
    variations_count: 1,
    include_captions: false,
    auto_optimize_for_platform: true,
    save_to_assets: true,
  });

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableContexts, setAvailableContexts] = useState<VideoContext[]>([]);
  const [selectedContext, setedContext] = useState<VideoContext | null>(null);
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [activeGeneration, setActiveGeneration] = useState<string | null>(null);
  const [generationJobs, setGenerationJobs] = useState<VideoGenerationJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState<string | null>(null);

  // Load available contexts and generations
  useEffect(() => {
    if (activeClient) {
      loadAvailableContexts();
      loadGenerations();
    }
  }, [activeClient]);

  // Set initial context based on props
  useEffect(() => {
    if (briefId && generationType === 'brief') {
      setedContext({ id: briefId, name: 'Current Brief', type: 'brief' });
    } else if (campaignId && generationType === 'campaign') {
      setedContext({ id: campaignId, name: 'Current Campaign', type: 'campaign' });
    } else if (matrixId && generationType === 'matrix') {
      setedContext({ id: matrixId, name: 'Current Matrix', type: 'matrix' });
    }
  }, [briefId, campaignId, matrixId, generationType]);

  // Auto-refresh active generations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const activeGenerations = generations.filter(gen => 
      ['pending', 'processing'].includes(gen.status)
    );

    if (activeGenerations.length > 0) {
      interval = setInterval(() => {
        activeGenerations.forEach(gen => {
          checkGenerationStatus(gen.generation_id);
        });
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generations]);

  const loadAvailableContexts = async () => {
    if (!activeClient) return;

    try {
      // Load briefs, campaigns, and matrices for context selection
      const [briefsRes, campaignsRes, matricesRes] = await Promise.all([
        fetch(`/api/briefs?client_id=${activeClient.id}&limit=20`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/campaigns?client_id=${activeClient.id}&limit=20`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/matrices?client_id=${activeClient.id}&limit=20`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
      ]);

      const [briefs, campaigns, matrices] = await Promise.all([
        briefsRes.ok ? briefsRes.json() : { data: [] },
        campaignsRes.ok ? campaignsRes.json() : { data: [] },
        matricesRes.ok ? matricesRes.json() : { data: [] },
      ]);

      const contexts: VideoContext[] = [
        ...briefs.data.map((brief: any) => ({
          id: brief.id,
          name: brief.name,
          type: 'brief' as const,
          description: brief.description,
        })),
        ...campaigns.data.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          type: 'campaign' as const,
          description: campaign.description,
        })),
        ...matrices.data.map((matrix: any) => ({
          id: matrix.id,
          name: matrix.name,
          type: 'matrix' as const,
          description: `Campaign: ${matrix.campaigns?.name}`,
        })),
      ];

      setAvailableContexts(contexts);
    } catch (error) {
      console.error('Error loading contexts:', error);
    }
  };

  const loadGenerations = async () => {
    if (!activeClient) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        client_id: activeClient.id,
        limit: '20',
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (briefId) params.append('brief_id', briefId);
      if (campaignId) params.append('campaign_id', campaignId);
      if (matrixId) params.append('matrix_id', matrixId);

      const response = await fetch(`/api/video/generations?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGenerations(data.data || []);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Error loading generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGenerationStatus = async (generationId: string) => {
    try {
      const response = await fetch(`/api/video/status?generation_id=${generationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update generation status
        setGenerations(prev => prev.map(gen => 
          gen.generation_id === generationId 
            ? { ...gen, status: data.data.progress.status }
            : gen
        ));

        // Update jobs if this is the active generation
        if (activeGeneration === generationId) {
          setGenerationJobs(data.data.jobs || []);
        }

        // Show notification on completion
        if (data.data.progress.status === 'completed') {
          showNotification('Video generation completed successfully!', 'success');
        } else if (data.data.progress.status === 'failed') {
          showNotification('Video generation failed', 'error');
        }
      }
    } catch (error) {
      console.error('Error checking generation status:', error);
    }
  };

  const handleGenerateVideo = async () => {
    if (!activeClient || !videoConfig.prompt.trim()) {
      showNotification('Please enter a video prompt', 'warning');
      return;
    }

    try {
      setIsGenerating(true);

      const generateData = {
        type: selectedContext ? selectedContext.type + '_based' : 'standalone',
        brief_id: selectedContext?.type === 'brief' ? selectedContext.id : undefined,
        campaign_id: selectedContext?.type === 'campaign' ? selectedContext.id : undefined,
        matrix_id: selectedContext?.type === 'matrix' ? selectedContext.id : undefined,
        video_config: videoConfig,
        content_elements: contentElements,
        generation_settings: generationSettings,
      };

      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(generateData),
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(
          `Video generation started with ${data.data.job_count} variation(s)`, 
          'success'
        );
        
        // Set as active generation to track progress
        setActiveGeneration(data.data.generation_id);
        
        // Reload generations
        loadGenerations();
        
        // Clear form
        setVideoConfig(prev => ({ ...prev, prompt: '' }));
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to start video generation', 'error');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification('Error starting video generation', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteGeneration = async (generationId: string) => {
    try {
      const response = await fetch(`/api/video/generations?generation_id=${generationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        showNotification('Generation deleted successfully', 'success');
        loadGenerations();
        if (activeGeneration === generationId) {
          setActiveGeneration(null);
          setGenerationJobs([]);
        }
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to delete generation', 'error');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification('Error deleting generation', 'error');
    }
  };

  const handleViewJobs = async (generationId: string) => {
    try {
      const response = await fetch(`/api/video/status?generation_id=${generationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveGeneration(generationId);
        setGenerationJobs(data.data.jobs || []);
        setShowJobDetails(generationId);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Error loading jobs:', error);
    }
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
      case 'processing': return < size={16} />;
      case 'pending': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        AI Video Generation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create professional videos using AI with brand-aware content generation and platform optimization.
      </Typography>
      
      <Grid container spacing={4}>
        {/* Generation Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Video Configuration
            </Typography>
            
            {/* Context ion */}
            {generationType === 'standalone' && availableContexts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  options={availableContexts}
                  getOptionLabel={(option) => `${option.name} (${option.type})`}
                  value={selectedContext}
                  onChange={(_, newValue) => setedContext(newValue)}
                  renderInput={(params) => (
                    <
                      {...params}
                      label="Context (Optional)"
                      placeholder=" a brief, campaign, or matrix"
                      size="small"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <ListItemIcon>
                        {option.type === 'brief' && < />}
                        {option.type === 'campaign' && <CampaignIcon />}
                        {option.type === 'matrix' && <AssessmentIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={option.name}
                        secondary={option.description}
                      />
                    </Box>
                  )}
                />
              </Box>
            )}
            
            {/* Video Prompt */}
            <Box sx={{ mb: 3 }}>
              <
                fullWidth
                multiline
                rows={4}
                label="Video Prompt"
                placeholder="Describe the video you want to generate..."
                value={videoConfig.prompt}
                onChange={(e) => setVideoConfig(prev => ({ ...prev, prompt: e.target.value }))}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Be specific about scenes, actions, style, and messaging.
              </Typography>
            </Box>
            
            {/* Style ion */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>Style</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {['cinematic', 'documentary', 'commercial', 'social_media', 'animation'].map(style => (
                  <Chip
                    key={style}
                    label={style.replace('_', ' ')}
                    onClick={() => setVideoConfig(prev => ({ ...prev, style }))}
                    color={videoConfig.style === style ? 'primary' : 'default'}
                    variant={videoConfig.style === style ? 'filled' : 'outlined'}
                    icon={<StyleIcon />}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>
            </Box>
            
            {/* Platform ion */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Platform (Optional)</InputLabel>
                <
                  value={videoConfig.platform}
                  label="Platform (Optional)"
                  onChange={(e) => setVideoConfig(prev => ({ ...prev, platform: e.target.value }))}
                >
                  <MenuItem value="">Any Platform</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="tiktok">TikTok</MenuItem>
                  <MenuItem value="facebook">Facebook</MenuItem>
                  <MenuItem value="linkedin">LinkedIn</MenuItem>
                  <MenuItem value="twitter">Twitter</MenuItem>
                </>
              </FormControl>
            </Box>
            
            {/* Duration */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Duration: {videoConfig.duration} seconds
              </Typography>
              <Slider
                value={videoConfig.duration}
                onChange={(_, newValue) => setVideoConfig(prev => ({ ...prev, duration: newValue as number }))}
                min={5}
                max={60}
                step={5}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 15, label: '15s' },
                  { value: 30, label: '30s' },
                  { value: 60, label: '60s' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            
            {/* Advanced Settings */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="small"
              >
                Advanced Settings
              </Button>
              
              <Collapse in={showAdvanced}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                  {/* Quality */}
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Quality</InputLabel>
                    <
                      value={videoConfig.quality}
                      label="Quality"
                      onChange={(e) => setVideoConfig(prev => ({ ...prev, quality: e.target.value }))}
                    >
                      <MenuItem value="draft">Draft (Fast)</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="high">High (Slow)</MenuItem>
                    </>
                  </FormControl>
                  
                  {/* Variations Count */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Variations: {generationSettings.variations_count}
                    </Typography>
                    <Slider
                      value={generationSettings.variations_count}
                      onChange={(_, newValue) => setGenerationSettings(prev => ({ 
                        ...prev, 
                        variations_count: newValue as number 
                      }))}
                      min={1}
                      max={5}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  {/* Settings Switches */}
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generationSettings.auto_optimize_for_platform}
                          onChange={(e) => setGenerationSettings(prev => ({ 
                            ...prev, 
                            auto_optimize_for_platform: e.target.checked 
                          }))}
                        />
                      }
                      label="Auto-optimize for platform"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generationSettings.save_to_assets}
                          onChange={(e) => setGenerationSettings(prev => ({ 
                            ...prev, 
                            save_to_assets: e.target.checked 
                          }))}
                        />
                      }
                      label="Save to assets"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generationSettings.include_captions}
                          onChange={(e) => setGenerationSettings(prev => ({ 
                            ...prev, 
                            include_captions: e.target.checked 
                          }))}
                        />
                      }
                      label="Include captions"
                    />
                  </Stack>
                </Box>
              </Collapse>
            </Box>
            
            {/* Generate Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateVideo}
              disabled={isGenerating || !videoConfig.prompt.trim() || !activeClient}
              startIcon={isGenerating ? < size={20} /> : <VideocamIcon />}
              sx={{ mb: 2 }}
            >
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </Button>
            
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Estimated time: {generationSettings.variations_count * 2} minutes
            </Typography>
          </Paper>
        </Grid>
        
        {/* Generated Videos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Generated Videos
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadGenerations}
                disabled={loading}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                < />
              </Box>
            ) : generations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <VideocamIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No videos generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure your settings and click "Generate Video" to create AI-generated videos
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {generations.map((generation) => (
                  <Grid item xs={12} key={generation.generation_id}>
                    <Card>
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Generation {generation.generation_id.split('-')[1]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {generation.context.type}: {generation.context.name || 'Standalone'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(generation.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={generation.status}
                              color={getStatusColor(generation.status) as any}
                              icon={getStatusIcon(generation.status)}
                              sx={{ textTransform: 'capitalize' }}
                            />
                            < size="small" onClick={() => handleViewJobs(generation.generation_id)}>
                              < />
                            </>
                            < 
                              size="small" 
                              onClick={() => handleDeleteGeneration(generation.generation_id)}
                              disabled={['pending', 'processing'].includes(generation.status)}
                            >
                              <DeleteIcon />
                            </>
                          </Stack>
                        </Box>
                        
                        {generation.output_url && (
                          <Box sx={{ mb: 2 }}>
                            <video
                              width="100%"
                              height="200"
                              controls
                              style={{ borderRadius: 8 }}
                            >
                              <source src={generation.output_url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </Box>
                        )}
                        
                        {generation.error_message && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {generation.error_message}
                          </Alert>
                        )}
                        
                        <Typography variant="body2" color="text.secondary">
                          Prompt: {generation.config?.video_config?.prompt?.substring(0, 100)}...
                        </Typography>
                      </>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Job Details Dialog */}
      <Dialog 
        open={!!showJobDetails} 
        onClose={() => setShowJobDetails(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Generation Jobs - {showJobDetails}
        </DialogTitle>
        <DialogContent>
          {generationJobs.length > 0 ? (
            <List>
              {generationJobs.map((job) => (
                <ListItem key={job.id} divider>
                  <ListItemIcon>
                    {getStatusIcon(job.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Variation ${job.variation_index}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Status: {job.progress.message}
                        </Typography>
                        {job.progress.percentage > 0 && (
                          < 
                            variant="determinate" 
                            value={job.progress.percentage} 
                            sx={{ mt: 1 }}
                          />
                        )}
                        {job.output_url && (
                          <Button
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            href={job.output_url}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Video
                          </Button>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      size="small"
                      label={`${job.progress.percentage}%`}
                      color={getStatusColor(job.status) as any}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No jobs found for this generation.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJobDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoGenerationTab;