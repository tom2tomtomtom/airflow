import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  VideoLibrary,
  AccessTime,
  AspectRatio,
  Palette,
} from '@mui/icons-material';
import { VideoPreviewPanelProps } from './types';

/**
 * VideoPreviewPanel Component
 *
 * Displays video preview with configuration summary and preview generation controls.
 * Shows current video settings, content elements summary, and handles preview generation.
 * Extracted from VideoStudioPage to improve modularity and testability.
 */
export const VideoPreviewPanel: React.FC<VideoPreviewPanelProps> = ({
  config,
  elements,
  template,
  previewUrl,
  onPreviewGenerate,
  loading = false,
}) => {
  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to format boolean display
  const formatYesNo = (value: boolean): string => {
    return value ? 'Yes' : 'No';
  };

  // Helper function to get elements count
  const getElementsCount = () => {
    return {
      textOverlays: elements.text_overlays.length,
      hasBackgroundMusic: elements.background_music,
      hasVoiceOver: !!elements.voice_over,
      hasBrandElements:
        !!elements.brand_elements?.logo_url || !!elements.brand_elements?.font_family,
    };
  };

  const elementsCount = getElementsCount();

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <VideoLibrary color="primary" />
          <Typography variant="h6">Video Preview</Typography>
        </Box>

        {/* Template Information */}
        {template && (
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Template: {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {template.description}
            </Typography>
          </Box>
        )}

        {/* Video Configuration Summary */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Configuration Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">Duration: {config.duration}s</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AspectRatio fontSize="small" color="action" />
                <Typography variant="body2">Resolution: {config.resolution}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Palette fontSize="small" color="action" />
                <Typography variant="body2">Style: {config.style}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" mb={1}>
                Platform: {config.platform || 'Not specified'}
              </Typography>
              <Typography variant="body2" mb={1}>
                Aspect Ratio: {config.aspect_ratio}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Content Elements Summary */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Content Elements
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip
                label={`Text Overlays: ${elementsCount.textOverlays}`}
                size="small"
                variant="outlined"
                color={elementsCount.textOverlays > 0 ? 'primary' : 'default'}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip
                label={`Background Music: ${formatYesNo(elementsCount.hasBackgroundMusic)}`}
                size="small"
                variant="outlined"
                color={elementsCount.hasBackgroundMusic ? 'primary' : 'default'}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip
                label={`Voice Over: ${formatYesNo(elementsCount.hasVoiceOver)}`}
                size="small"
                variant="outlined"
                color={elementsCount.hasVoiceOver ? 'primary' : 'default'}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip
                label={`Brand Elements: ${formatYesNo(elementsCount.hasBrandElements)}`}
                size="small"
                variant="outlined"
                color={elementsCount.hasBrandElements ? 'primary' : 'default'}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Prompt Preview */}
        {config.prompt && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Prompt:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                {truncateText(config.prompt)}
              </Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Preview Display */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Preview
          </Typography>

          {loading && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Generating preview...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {!loading && previewUrl && previewUrl !== 'error' ? (
            <Box>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                <video
                  src={previewUrl}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  role="application"
                  aria-label="Video preview"
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onPreviewGenerate}
                disabled={loading}
                fullWidth
              >
                Regenerate Preview
              </Button>
            </Box>
          ) : (
            !loading && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'grey.50',
                }}
              >
                <VideoLibrary sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  No preview available
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={onPreviewGenerate}
                  disabled={loading}
                >
                  {loading ? 'Generating preview...' : 'Generate Preview'}
                </Button>
              </Paper>
            )
          )}
        </Box>

        {/* Preview Quality Information */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Preview videos are generated at reduced quality for faster loading. Final video will be
            rendered at full quality.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
