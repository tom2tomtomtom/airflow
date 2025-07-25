import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Download,
  Share,
  Refresh,
  CheckCircle,
  Error,
  Schedule,
  VideoLibrary,
  Settings,
} from '@mui/icons-material';
import { GenerationControlPanelProps, GenerationOptions, ExportPlatform, VideoJob } from './types';

// Mock export platforms (in real app, these would come from props or API)
const EXPORT_PLATFORMS: ExportPlatform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    aspect_ratio: '16:9',
    max_duration: 3600,
    recommended_resolution: '1920x1080',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    aspect_ratio: '1:1',
    max_duration: 60,
    recommended_resolution: '1080x1080',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    aspect_ratio: '9:16',
    max_duration: 180,
    recommended_resolution: '1080x1920',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    aspect_ratio: '16:9',
    max_duration: 1200,
    recommended_resolution: '1920x1080',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    aspect_ratio: '16:9',
    max_duration: 140,
    recommended_resolution: '1280x720',
  },
];

/**
 * GenerationControlPanel Component
 *
 * Provides controls for video generation including quality settings, format options,
 * generation progress tracking, and result management with export capabilities.
 * Extracted from VideoStudioPage to improve modularity and testability.
 */
export const GenerationControlPanel: React.FC<GenerationControlPanelProps> = ({
  onGenerate,
  generationStatus,
  progress,
  resultUrl,
  onDownload,
  onExport,
  videoJobs = [],
}) => {
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    quality: 'standard',
    format: 'mp4',
    include_subtitles: false,
    include_watermark: false,
  });

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Helper function to get estimated generation time
  const getEstimatedTime = (quality: GenerationOptions['quality']): string => {
    const times = {
      draft: '2-3 minutes',
      standard: '5-8 minutes',
      high: '10-15 minutes',
    };
    return times[quality];
  };

  // Helper function to get generation status icon
  const getStatusIcon = (status: VideoJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="primary" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  // Helper function to format job status
  const formatJobStatus = (job: VideoJob): string => {
    switch (job.status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return `Processing (${job.progress}%)`;
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  // Handle generation option changes
  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGenerationOptions(prev => ({
      ...prev,
      quality: event.target.value as GenerationOptions['quality'],
    }));
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGenerationOptions(prev => ({
      ...prev,
      format: event.target.value as GenerationOptions['format'],
    }));
  };

  const handleOptionToggle =
    (option: keyof Pick<GenerationOptions, 'include_subtitles' | 'include_watermark'>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGenerationOptions(prev => ({
        ...prev,
        [option]: event.target.checked,
      }));
    };

  // Handle generation
  const handleGenerate = () => {
    onGenerate(generationOptions);
  };

  // Handle retry generation
  const handleRetry = () => {
    onGenerate(generationOptions);
  };

  // Handle export dialog
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
    setSelectedPlatforms([]);
  };

  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
    setSelectedPlatforms([]);
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  const handleConfirmExport = () => {
    const platformsToExport = EXPORT_PLATFORMS.filter(platform =>
      selectedPlatforms.includes(platform.id)
    );
    onExport(platformsToExport);
    setExportDialogOpen(false);
    setSelectedPlatforms([]);
  };

  // Handle individual job download
  const handleJobDownload = (job: VideoJob) => {
    if (job.output_url) {
      window.open(job.output_url, '_blank');
    }
  };

  const isGenerating = generationStatus === 'generating';
  const isCompleted = generationStatus === 'completed';
  const isError = generationStatus === 'error';
  const canExport = isCompleted && !!resultUrl;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <VideoLibrary color="primary" />
          <Typography variant="h6">Generate Video</Typography>
        </Box>

        {/* Generation Options */}
        <Box mb={4}>
          <Grid container spacing={3}>
            {/* Quality Settings */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Settings fontSize="small" />
                    Quality Settings
                  </Box>
                </FormLabel>
                <RadioGroup value={generationOptions.quality} onChange={handleQualityChange} row>
                  <FormControlLabel
                    value="draft"
                    control={<Radio />}
                    label="Draft"
                    disabled={isGenerating}
                  />
                  <FormControlLabel
                    value="standard"
                    control={<Radio />}
                    label="Standard"
                    disabled={isGenerating}
                  />
                  <FormControlLabel
                    value="high"
                    control={<Radio />}
                    label="High"
                    disabled={isGenerating}
                  />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary">
                  Estimated time: {getEstimatedTime(generationOptions.quality)}
                </Typography>
              </FormControl>
            </Grid>

            {/* Output Format */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Output Format</FormLabel>
                <RadioGroup value={generationOptions.format} onChange={handleFormatChange} row>
                  <FormControlLabel
                    value="mp4"
                    control={<Radio />}
                    label="MP4"
                    disabled={isGenerating}
                  />
                  <FormControlLabel
                    value="mov"
                    control={<Radio />}
                    label="MOV"
                    disabled={isGenerating}
                  />
                  <FormControlLabel
                    value="webm"
                    control={<Radio />}
                    label="WEBM"
                    disabled={isGenerating}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Additional Options */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Options
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generationOptions.include_subtitles}
                      onChange={handleOptionToggle('include_subtitles')}
                      disabled={isGenerating}
                    />
                  }
                  label="Include Subtitles"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generationOptions.include_watermark}
                      onChange={handleOptionToggle('include_watermark')}
                      disabled={isGenerating}
                    />
                  }
                  label="Include Watermark"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Generation Status */}
        <Box mb={3}>
          {generationStatus === 'idle' && (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleGenerate}
              fullWidth
            >
              Generate Video
            </Button>
          )}

          {isGenerating && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Generating: {progress}%</Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated completion: {getEstimatedTime(generationOptions.quality)}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
              <Button variant="outlined" disabled fullWidth>
                Generating...
              </Button>
            </Box>
          )}

          {isCompleted && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Generation Complete!
              </Alert>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={onDownload}
                    fullWidth
                  >
                    Download Video
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={handleOpenExportDialog}
                    disabled={!canExport}
                    fullWidth
                  >
                    Export to Platforms
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {isError && (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                Generation Failed
              </Alert>
              <Button
                variant="contained"
                color="error"
                startIcon={<Refresh />}
                onClick={handleRetry}
                fullWidth
              >
                Try Again
              </Button>
            </Box>
          )}
        </Box>

        {/* Video Jobs History */}
        {videoJobs.length > 0 && (
          <Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Generation History
            </Typography>
            <List>
              {videoJobs.map((job, index) => (
                <ListItem key={job.id} component={Paper} sx={{ mb: 1, p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mr={2}>
                    {getStatusIcon(job.status)}
                  </Box>
                  <ListItemText
                    primary={`Variation ${job.variation_index + 1}`}
                    secondary={
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={formatJobStatus(job)}
                            size="small"
                            color={
                              job.status === 'completed'
                                ? 'success'
                                : job.status === 'failed'
                                  ? 'error'
                                  : 'primary'
                            }
                            variant="outlined"
                          />
                          {job.estimated_completion && job.status === 'processing' && (
                            <Typography variant="caption" color="text.secondary">
                              ETA: {new Date(job.estimated_completion).toLocaleTimeString()}
                            </Typography>
                          )}
                        </Box>
                        {job.error_message && (
                          <Typography variant="caption" color="error" display="block">
                            {job.error_message}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {job.status === 'completed' && job.output_url && (
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleJobDownload(job)}
                      >
                        Download
                      </Button>
                    )}
                    {job.status === 'processing' && (
                      <LinearProgress
                        variant="determinate"
                        value={job.progress}
                        sx={{ width: 100 }}
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Export to Platforms</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select the platforms where you want to export your video.
            </Typography>
            <List>
              {EXPORT_PLATFORMS.map(platform => (
                <ListItem
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                      />
                    }
                    label={platform.name}
                    sx={{ pointerEvents: 'none' }}
                  />
                  <ListItemText
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Aspect Ratio: {platform.aspect_ratio}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Max Duration: {platform.max_duration}s
                        </Typography>
                        <Typography variant="caption" display="block">
                          Resolution: {platform.recommended_resolution}
                        </Typography>
                      </Box>
                    }
                    sx={{ ml: 2 }}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExportDialog}>Cancel</Button>
            <Button
              onClick={handleConfirmExport}
              variant="contained"
              disabled={selectedPlatforms.length === 0}
            >
              Export Selected
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};
