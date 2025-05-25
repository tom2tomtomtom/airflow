import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
  Mic as MicIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  ContentCopy as ContentCopyIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

// Interfaces for generated content
interface CopyVariation {
  id: string;
  text: string;
  motivationId: string;
  favorite: boolean;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  dateCreated: string;
  favorite: boolean;
}

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

interface GeneratedVoice {
  id: string;
  url: string;
  text: string;
  voice: string;
  language: string;
  duration: string;
  dateCreated: string;
  favorite: boolean;
}

interface ResultsTabProps {
  copyVariations: CopyVariation[];
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  generatedVoices: GeneratedVoice[];
  handleToggleCopyFavorite: (id: string) => void;
  handleToggleImageFavorite: (id: string) => void;
  handleToggleVideoFavorite: (id: string) => void;
  handleToggleVoiceFavorite: (id: string) => void;
}

const ResultsTab: React.FC<ResultsTabProps> = ({
  copyVariations,
  generatedImages,
  generatedVideos,
  generatedVoices,
  handleToggleCopyFavorite,
  handleToggleImageFavorite,
  handleToggleVideoFavorite,
  handleToggleVoiceFavorite,
}) => {
  const [resultType, setResultType] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  
  // Filter results based on type and favorites
  const filteredCopy = copyVariations.filter(item => 
    (resultType === 'all' || resultType === 'copy') && 
    (!showFavoritesOnly || item.favorite)
  );
  
  const filteredImages = generatedImages.filter(item => 
    (resultType === 'all' || resultType === 'image') && 
    (!showFavoritesOnly || item.favorite)
  );
  
  const filteredVideos = generatedVideos.filter(item => 
    (resultType === 'all' || resultType === 'video') && 
    (!showFavoritesOnly || item.favorite)
  );
  
  const filteredVoices = generatedVoices.filter(item => 
    (resultType === 'all' || resultType === 'voice') && 
    (!showFavoritesOnly || item.favorite)
  );
  
  // Check if there are any results
  const hasResults = filteredCopy.length > 0 || filteredImages.length > 0 || 
                    filteredVideos.length > 0 || filteredVoices.length > 0;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generated Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        View and manage all your generated content in one place.
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Tabs
              value={resultType}
              onChange={(_, newValue) => setResultType(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<FolderIcon />} 
                label="All Content" 
                value="all" 
                iconPosition="start"
              />
              <Tab 
                icon={<TextFieldsIcon />} 
                label="Copy" 
                value="copy" 
                iconPosition="start"
              />
              <Tab 
                icon={<ImageIcon />} 
                label="Images" 
                value="image" 
                iconPosition="start"
              />
              <Tab 
                icon={<VideocamIcon />} 
                label="Videos" 
                value="video" 
                iconPosition="start"
              />
              <Tab 
                icon={<MicIcon />} 
                label="Voiceovers" 
                value="voice" 
                iconPosition="start"
              />
            </Tabs>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant={showFavoritesOnly ? "contained" : "outlined"}
              startIcon={showFavoritesOnly ? <StarIcon /> : <StarBorderIcon />}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              size="small"
            >
              {showFavoritesOnly ? "Showing Favorites" : "Show Favorites Only"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {hasResults ? (
        <Box>
          {/* Copy Results */}
          {filteredCopy.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TextFieldsIcon sx={{ mr: 1 }} /> Copy
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {filteredCopy.map(copy => (
                  <Grid item key={copy.id} xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        position: 'relative',
                        pl: 4,
                      }}
                    >
                      <IconButton
                        sx={{ 
                          position: 'absolute', 
                          left: 8, 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                        }}
                        color={copy.favorite ? 'error' : 'default'}
                        onClick={() => handleToggleCopyFavorite(copy.id)}
                      >
                        {copy.favorite ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                      
                      <Typography variant="body1">
                        {copy.text}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        mt: 1,
                      }}>
                        <Tooltip title="Copy to clipboard">
                          <IconButton size="small">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Save to assets">
                          <IconButton size="small" color="primary">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Image Results */}
          {filteredImages.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ImageIcon sx={{ mr: 1 }} /> Images
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {filteredImages.map(image => (
                  <Grid item key={image.id} xs={12} sm={6} md={4}>
                    <Card>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height={200}
                          image={image.url || '/mock-images/placeholder.jpg'}
                          alt={image.prompt}
                        />
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
                          color={image.favorite ? 'error' : 'default'}
                          onClick={() => handleToggleImageFavorite(image.id)}
                        >
                          {image.favorite ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Box>
                      <CardContent>
                        <Typography variant="body2" noWrap>
                          {image.prompt}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}>
                          <Chip size="small" label={image.style} />
                          <Chip size="small" label={image.aspectRatio} variant="outlined" />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          mt: 2,
                        }}>
                          <Tooltip title="View full size">
                            <IconButton size="small">
                              <FullscreenIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Save to assets">
                            <IconButton size="small" color="primary">
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Video Results */}
          {filteredVideos.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <VideocamIcon sx={{ mr: 1 }} /> Videos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {filteredVideos.map(video => (
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
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'flex-end',
                              mt: 2,
                            }}>
                              {video.status === 'completed' && (
                                <>
                                  <Tooltip title="Download">
                                    <IconButton size="small">
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Save to assets">
                                    <IconButton size="small" color="primary">
                                      <SaveIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Voice Results */}
          {filteredVoices.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <MicIcon sx={{ mr: 1 }} /> Voiceovers
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                {filteredVoices.map(voice => (
                  <Card key={voice.id} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="subtitle1" gutterBottom>
                            {voice.text.length > 100 ? voice.text.substring(0, 100) + '...' : voice.text}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {voice.text}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Chip size="small" label={voice.voice} />
                                <Chip size="small" label={voice.language} variant="outlined" />
                              </Stack>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Duration: {voice.duration}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                              <IconButton color="primary">
                                <PlayArrowIcon />
                              </IconButton>
                              
                              <Box>
                                <IconButton
                                  size="small"
                                  color={voice.favorite ? 'error' : 'default'}
                                  onClick={() => handleToggleVoiceFavorite(voice.id)}
                                >
                                  {voice.favorite ? <StarIcon /> : <StarBorderIcon />}
                                </IconButton>
                                <IconButton size="small">
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="primary">
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No content found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {showFavoritesOnly 
              ? "You don't have any favorite content yet. Mark items as favorites to see them here."
              : "Generate content using the other tabs to see it displayed here."}
          </Typography>
          {showFavoritesOnly && (
            <Button
              variant="outlined"
              onClick={() => setShowFavoritesOnly(false)}
            >
              Show All Content
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ResultsTab;
