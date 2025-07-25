import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormHelperText,
} from '@mui/material';
import { VideoConfigurationPanelProps, VideoConfig } from './types';

/**
 * VideoConfigurationPanel Component
 *
 * Provides video configuration controls including prompt, style, platform,
 * resolution, aspect ratio, and duration settings.
 * Extracted from VideoStudioPage to improve modularity and testability.
 * Optimized with React.memo and useCallback for performance.
 */
const VideoConfigurationPanelComponent: React.FC<VideoConfigurationPanelProps> = ({
  config,
  onConfigChange,
  template,
  constraints,
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Platform to aspect ratio mapping
  const getAspectRatioForPlatform = (platform: string): string => {
    const platformRatios: Record<string, string> = {
      youtube: '16:9',
      instagram: '1:1',
      tiktok: '9:16',
      facebook: '16:9',
      linkedin: '16:9',
      twitter: '16:9',
    };
    return platformRatios[platform] || '16:9';
  };

  // Get available options based on constraints
  const getAvailableResolutions = () => {
    const allResolutions = [
      { value: '720p', label: '720p (HD)' },
      { value: '1080p', label: '1080p (Full HD)' },
      { value: '4K', label: '4K (Ultra HD)' },
    ];

    if (!constraints?.supported_resolutions) {
      return allResolutions;
    }

    return allResolutions.filter(res => constraints.supported_resolutions.includes(res.value));
  };

  const getAvailableAspectRatios = () => {
    const allAspectRatios = [
      { value: '16:9', label: '16:9 (Landscape)' },
      { value: '9:16', label: '9:16 (Portrait)' },
      { value: '1:1', label: '1:1 (Square)' },
      { value: '4:5', label: '4:5 (Instagram)' },
    ];

    if (!constraints?.allowed_aspect_ratios) {
      return allAspectRatios;
    }

    return allAspectRatios.filter(ratio => constraints.allowed_aspect_ratios.includes(ratio.value));
  };

  // Validation
  const validatePrompt = (prompt: string): string => {
    if (!prompt.trim()) {
      return 'Video prompt is required';
    }
    return '';
  };

  // Event handlers with useCallback optimization
  const handleConfigChange = useCallback((updates: Partial<VideoConfig>) => {
    onConfigChange(updates);
  }, [onConfigChange]);

  const handlePromptChange = useCallback((prompt: string) => {
    const error = validatePrompt(prompt);
    setValidationErrors(prev => ({ ...prev, prompt: error }));
    handleConfigChange({ prompt });
  }, [handleConfigChange]);

  const handlePromptBlur = useCallback(() => {
    const error = validatePrompt(config.prompt);
    setValidationErrors(prev => ({ ...prev, prompt: error }));
  }, [config.prompt]);

  const handlePlatformChange = useCallback((platform: string) => {
    const aspectRatio = getAspectRatioForPlatform(platform);
    handleConfigChange({
      platform: platform || undefined,
      aspect_ratio: aspectRatio,
    });
  }, [handleConfigChange]);

  const handleDurationChange = useCallback((_: Event, value: number | number[]) => {
    const duration = Array.isArray(value) ? value[0] : value;
    handleConfigChange({ duration });
  }, [handleConfigChange]);

  // Duration constraints
  const minDuration = constraints?.min_duration || 5;
  const maxDuration = constraints?.max_duration || 60;

  // Duration marks for slider
  const durationMarks = [
    { value: minDuration, label: `${minDuration}s` },
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
    { value: maxDuration, label: `${maxDuration}s` },
  ].filter(mark => mark.value >= minDuration && mark.value <= maxDuration);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Configure Your Video
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Set up the basic parameters for your video generation
        </Typography>

        <Grid container spacing={3}>
          {/* Video Prompt */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Video Prompt"
              placeholder="Describe what you want your video to show. Be specific about scenes, actions, and visual elements..."
              value={config.prompt}
              onChange={e => handlePromptChange(e.target.value)}
              onBlur={handlePromptBlur}
              required
              error={!!validationErrors.prompt}
              helperText={
                validationErrors.prompt || 'Provide a detailed description of your video content'
              }
            />
          </Grid>

          {/* Video Style */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Video Style</InputLabel>
              <Select
                value={config.style}
                label="Video Style"
                onChange={e => handleConfigChange({ style: e.target.value })}
              >
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="cinematic">Cinematic</MenuItem>
                <MenuItem value="documentary">Documentary</MenuItem>
                <MenuItem value="social_media">Social Media</MenuItem>
                <MenuItem value="animation">Animation</MenuItem>
              </Select>
              <FormHelperText>Choose the visual style for your video</FormHelperText>
            </FormControl>
          </Grid>

          {/* Platform */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={config.platform || ''}
                label="Platform"
                onChange={e => handlePlatformChange(e.target.value)}
              >
                <MenuItem value="">General</MenuItem>
                <MenuItem value="youtube">YouTube</MenuItem>
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
                <MenuItem value="twitter">Twitter</MenuItem>
              </Select>
              <FormHelperText>
                Platform selection will automatically adjust aspect ratio
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* Resolution */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Resolution</InputLabel>
              <Select
                value={config.resolution}
                label="Resolution"
                onChange={e => handleConfigChange({ resolution: e.target.value })}
              >
                {getAvailableResolutions().map(resolution => (
                  <MenuItem key={resolution.value} value={resolution.value}>
                    {resolution.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Higher resolution means better quality</FormHelperText>
            </FormControl>
          </Grid>

          {/* Aspect Ratio */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value={config.aspect_ratio}
                label="Aspect Ratio"
                onChange={e => handleConfigChange({ aspect_ratio: e.target.value })}
              >
                {getAvailableAspectRatios().map(ratio => (
                  <MenuItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Video dimensions for different platforms</FormHelperText>
            </FormControl>
          </Grid>

          {/* Duration */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box>
              <Typography gutterBottom>Duration: {config.duration}s</Typography>
              <Slider
                value={config.duration}
                onChange={handleDurationChange}
                min={minDuration}
                max={maxDuration}
                step={5}
                marks={durationMarks}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}s`}
                sx={{ mt: 2, mb: 1 }}
              />
              <FormHelperText>
                Video length in seconds ({minDuration}s - {maxDuration}s)
              </FormHelperText>
            </Box>
          </Grid>
        </Grid>

        {/* Template Information */}
        {template && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Template: {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {template.description}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                Recommended: {template.aspect_ratio} • {template.duration}s •{' '}
                {template.platform.join(', ')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Validation Summary */}
        {Object.values(validationErrors).some(error => !!error) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error">
              Please fix the following errors:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              {Object.entries(validationErrors).map(([field, error]) =>
                error ? (
                  <Box component="li" key={field}>
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </Box>
                ) : null
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Memoized export to prevent unnecessary re-renders
export const VideoConfigurationPanel = React.memo(VideoConfigurationPanelComponent);
