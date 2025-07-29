import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import {
  PlayArrow as RenderIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

interface VideoJob {
  id: string;
  generation_id: string;
  variation_index: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  render_job_id?: string;
  output_url?: string;
  error_message?: string;
  estimated_completion?: string;
  created_at: string;
}

interface VideoGenerationPanelProps {
  combinations?: any[];
  campaignId?: string;
  onComplete?: (videos: any[]) => void;
}

const platforms = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
];

const styles = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'animation', label: 'Animation' },
];

const qualities = [
  { value: 'draft', label: 'Draft (Fast)' },
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High Quality' },
];

const VideoGenerationPanel: React.FC<VideoGenerationPanelProps> = ({
  combinations = [],
  campaignId,
  onComplete,
}) => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [generating, setGenerating] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Generation settings
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('commercial');
  const [quality, setQuality] = useState('standard');
  const [duration, setDuration] = useState(15);
  const [variationsCount, setVariationsCount] = useState(3);
  const [includeVoiceOver, setIncludeVoiceOver] = useState(false);
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [voiceOverText, setVoiceOverText] = useState('');

  // Polling for job updates
  useEffect(() => {
    if (jobs.some(job => job.status === 'pending' || job.status === 'processing')) {
      const interval = setInterval(fetchJobUpdates, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [jobs]);

  const fetchJobUpdates = async () => {
    try {
      const pendingJobs = jobs.filter(
        (job: any) => job.status === 'pending' || job.status === 'processing'
      );
      if (pendingJobs.length === 0) return;

      for (const job of pendingJobs) {
        const response = await fetch(`/api/video/status?job_id=${job.id}`);
        const data = await response.json();
        if (data.success) {
          setJobs(prev => prev.map((j: any) => (j.id === job.id ? { ...j, ...data.job } : j)));
        }
      }
    } catch (error: any) {
      // Only log fetch errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching job updates:', error);
      }
    }
  };

  const generateVideos = async () => {
    if (!activeClient) {
      showNotification('Please select a client first', 'error');
      return;
    }
    if (combinations.length === 0) {
      showNotification('No combinations available to generate videos', 'warning');
      return;
    }

    setGenerating(true);
    setConfigDialogOpen(false);

    try {
      // Create a prompt from combinations
      const prompt = createPromptFromCombinations(combinations);
      const videoConfig = {
        type: campaignId ? 'campaign_based' : 'standalone',
        campaign_id: campaignId,
        video_config: {
          prompt,
          style,
          duration,
          platform,
          quality,
          aspect_ratio: getAspectRatioForPlatform(platform),
        },
        content_elements: {
          voice_over: includeVoiceOver
            ? {
                text: voiceOverText || prompt,
                voice: 'neural',
                language: 'en',
              }
            : undefined,
          background_music: true,
        },
        generation_settings: {
          variations_count: variationsCount,
          include_captions: includeCaptions,
          auto_optimize_for_platform: true,
          save_to_assets: true,
        },
      };

      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoConfig),
      });

      const data = await response.json();
      if (data.data) {
        const newJobs: VideoJob[] = data?.data?.jobs.results.map((result: any) => ({
          id: result.job_id,
          generation_id: data?.data?.generation_id,
          variation_index: 1,
          status: result.status,
          render_job_id: result.render_job_id,
          estimated_completion: result.estimated_completion,
          created_at: new Date().toISOString(),
        }));
        setJobs(newJobs);
        showNotification(`Started generation of ${newJobs.length} videos`, 'success');
      } else {
        throw new Error(data.error || 'Failed to start video generation');
      }
    } catch (error: any) {
      // Only log generation errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Video generation error:', error);
      }
      showNotification('Failed to start video generation: ' + error.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const createPromptFromCombinations = (combinations: any[]) => {
    // Extract key elements from combinations to create a prompt
    const headlines = combinations.map((c: any) => c.fields?.headline?.value).filter(Boolean);
    const copy = combinations.map((c: any) => c.fields?.copy?.value).filter(Boolean);
    const prompt = `Create a ${style} video that showcases: ${headlines.slice(0, 3).join(', ')}. Key messaging: ${copy.slice(0, 2).join('. ')}. Style should be professional and engaging for ${platform} platform.`;
    return prompt;
  };

  const getAspectRatioForPlatform = (platform: string) => {
    const ratios: Record<string, string> = {
      youtube: '16:9',
      instagram: '1:1',
      tiktok: '9:16',
      facebook: '16:9',
      linkedin: '16:9',
      twitter: '16:9',
    };
    return ratios[platform] || '16:9';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'processing':
        return <RenderIcon color="info" />;
      case 'completed':
        return <CompleteIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const downloadVideo = (job: VideoJob) => {
    if (job.output_url) {
      window.open(job.output_url, '_blank');
    }
  };

  const previewVideo = (job: VideoJob) => {
    if (job.output_url) {
      window.open(job.output_url, '_blank');
    }
  };

  const completedJobs = jobs.filter((job: any) => job.status === 'completed');
  const failedJobs = jobs.filter((job: any) => job.status === 'failed');
  const processingJobs = jobs.filter(
    (job: any) => job.status === 'processing' || job.status === 'pending'
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Video Generation</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchJobUpdates}
            disabled={generating}
          >
            Refresh Status
          </Button>
          <Button
            variant="contained"
            startIcon={<RenderIcon />}
            onClick={() => setConfigDialogOpen(true)}
            disabled={generating || combinations.length === 0}
          >
            Generate Videos
          </Button>
        </Stack>
      </Box>

      {combinations.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Configure your campaign matrix and generate combinations first to create videos.
        </Alert>
      )}

      {jobs.length > 0 && (
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {processingJobs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processing
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {completedJobs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    {failedJobs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {jobs.length > 0 && (
        <Grid container spacing={2}>
          {jobs.map((job: any) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={job.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6">Video {job.variation_index}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(job.status)}
                      <Chip
                        label={job.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(job.status) as any}
                      />
                    </Box>
                  </Box>

                  {job.status === 'processing' && job.progress && (
                    <Box mb={2}>
                      <LinearProgress variant="determinate" value={job.progress} />
                      <Typography variant="caption" color="text.secondary">
                        {job.progress}% complete
                      </Typography>
                    </Box>
                  )}

                  {job.error_message && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {job.error_message}
                    </Alert>
                  )}

                  {job.estimated_completion && job.status === 'processing' && (
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Est. completion: {new Date(job.estimated_completion).toLocaleTimeString()}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1}>
                    {job.status === 'completed' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<PreviewIcon />}
                          onClick={() => previewVideo(job)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => downloadVideo(job)}
                        >
                          Download
                        </Button>
                      </>
                    )}
                    {(job.status === 'processing' || job.status === 'pending') && (
                      <Button size="small" startIcon={<StopIcon />} color="error" disabled>
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Video Generation Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select value={platform} onChange={e => setPlatform(e.target.value)}>
                  {platforms.map((p: any) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Style</InputLabel>
                <Select value={style} onChange={e => setStyle(e.target.value)}>
                  {styles.map((s: any) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Quality</InputLabel>
                <Select value={quality} onChange={e => setQuality(e.target.value)}>
                  {qualities.map((q: any) => (
                    <MenuItem key={q.value} value={q.value}>
                      {q.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>Duration: {duration}s</Typography>
              <Slider
                value={duration}
                onChange={(_, value) => setDuration(value as number)}
                min={5}
                max={60}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>Variations: {variationsCount}</Typography>
              <Slider
                value={variationsCount}
                onChange={(_, value) => setVariationsCount(value as number)}
                min={1}
                max={5}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeCaptions}
                    onChange={e => setIncludeCaptions(e.target.checked)}
                  />
                }
                label="Include Captions"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeVoiceOver}
                    onChange={e => setIncludeVoiceOver(e.target.checked)}
                  />
                }
                label="Include Voice Over"
              />
            </Grid>
            {includeVoiceOver && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Voice Over Text"
                  value={voiceOverText}
                  onChange={e => setVoiceOverText(e.target.value)}
                  placeholder="Enter the script for voice over, or leave empty to use generated content"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button onClick={generateVideos} variant="contained" disabled={generating}>
            Start Generation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoGenerationPanel;
