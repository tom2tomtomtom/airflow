import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Slider,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Videocam as VideocamIcon,
  Style as StyleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Interface for generated video
interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail: string;
  prompt: string;
  duration: string;
  resolution: string;
  dateCreated: string;
  status: 'completed' | 'processing' | 'failed';
  favorite: boolean;
}

interface VideoGenerationTabProps {
  videoPrompt: string;
  setVideoPrompt: (prompt: string) => void;
  videoDuration: number;
  setVideoDuration: (duration: number) => void;
  videoStyle: string;
  setVideoStyle: (style: string) => void;
  videoResolution: string;
  setVideoResolution: (resolution: string) => void;
  isGeneratingVideo: boolean;
  generatedVideos: GeneratedVideo[];
  handleGenerateVideo: () => void;
  handleToggleVideoFavorite: (id: string) => void;
}

const VideoGenerationTab: React.FC<VideoGenerationTabProps> = ({
  videoPrompt,
  setVideoPrompt,
  videoDuration,
  setVideoDuration,
  videoStyle,
  setVideoStyle,
  videoResolution,
  setVideoResolution,
  isGeneratingVideo,
  generatedVideos,
  handleGenerateVideo,
  handleToggleVideoFavorite,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate Videos
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create AI-generated videos based on your prompts and specifications.
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Video Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Prompt
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Describe the video you want to generate..."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Be specific about scenes, actions, transitions, and overall narrative.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Style
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {['Cinematic', 'Documentary', 'Commercial', 'Social Media', 'Animation'].map(style => (
                  <Chip
                    key={style}
                    label={style}
                    onClick={() => setVideoStyle(style.toLowerCase())}
                    color={videoStyle === style.toLowerCase() ? 'primary' : 'default'}
                    variant={videoStyle === style.toLowerCase() ? 'filled' : 'outlined'}
                    icon={<StyleIcon />}
                  />
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Duration (seconds)
              </Typography>
              <Slider
                value={videoDuration}
                onChange={(_, newValue) => setVideoDuration(newValue as number)}
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
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Resolution
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {['720p', '1080p', '4K'].map(resolution => (
                  <Chip
                    key={resolution}
                    label={resolution}
                    onClick={() => setVideoResolution(resolution)}
                    color={videoResolution === resolution ? 'primary' : 'default'}
                    variant={videoResolution === resolution ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo || !videoPrompt.trim()}
                startIcon={isGeneratingVideo ? <CircularProgress size={20} /> : <VideocamIcon />}
              >
                {isGeneratingVideo ? 'Generating...' : 'Generate Video'}
              </Button>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Note: Video generation may take several minutes to complete.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Generated Videos
            </Typography>
            
            {isGeneratingVideo && (
              <Box sx={{ width: '100%', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Initializing video generation...
                </Typography>
                <LinearProgress />
              </Box>
            )}
            
            <Grid container spacing={2}>
              {generatedVideos.map((video) => (
                <Grid item key={video.id} xs={12}>
                  <Card>
                    <Grid container>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height={180}
                            image={video.thumbnail || '/mock-videos/placeholder-thumb.jpg'}
                            alt={video.prompt}
                          />
                          {video.status === 'processing' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.5)',
                              }}
                            >
                              <CircularProgress color="inherit" sx={{ color: 'white' }} />
                            </Box>
                          )}
                          {video.status === 'completed' && (
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                }
                              }}
                              size="large"
                            >
                              <PlayArrowIcon fontSize="large" />
                            </IconButton>
                          )}
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)',
                              }
                            }}
                            size="small"
                            color={video.favorite ? 'error' : 'default'}
                            onClick={() => handleToggleVideoFavorite(video.id)}
                          >
                            {video.favorite ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>
                                {video.prompt.length > 50 ? video.prompt.substring(0, 50) + '...' : video.prompt}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Chip 
                                  size="small" 
                                  label={video.status === 'completed' ? 'Completed' : 
                                        video.status === 'processing' ? 'Processing' : 'Failed'} 
                                  color={video.status === 'completed' ? 'success' : 
                                        video.status === 'processing' ? 'primary' : 'error'}
                                />
                                <Chip size="small" label={video.resolution} variant="outlined" />
                                <Chip size="small" label={video.duration} variant="outlined" />
                              </Stack>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {video.prompt}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end',
                          }}>
                            {video.status === 'completed' && (
                              <>
                                <Tooltip title="Download">
                                  <IconButton size="small">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {video.status === 'processing' && (
                              <Tooltip title="Cancel">
                                <IconButton size="small">
                                  <StopIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {video.status === 'failed' && (
                              <Tooltip title="Retry">
                                <IconButton size="small">
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Save to assets">
                              <IconButton 
                                size="small" 
                                color="primary"
                                disabled={video.status !== 'completed'}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {generatedVideos.length === 0 && !isGeneratingVideo && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <VideocamIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No videos generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure your settings and click &quot;Generate Video&quot; to create AI-generated videos
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoGenerationTab;
