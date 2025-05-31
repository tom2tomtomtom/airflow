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
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  Style as StyleIcon,
  AspectRatio as AspectRatioIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

// Interface for generated image
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  dateCreated: string;
  favorite: boolean;
}

interface ImageGenerationTabProps {
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  imageStyle: string;
  setImageStyle: (style: string) => void;
  imageAspectRatio: string;
  setImageAspectRatio: (ratio: string) => void;
  imageCount: number;
  setImageCount: (count: number) => void;
  isGeneratingImages: boolean;
  generatedImages: GeneratedImage[];
  handleGenerateImages: () => void;
  handleToggleImageFavorite: (id: string) => void;
}

const ImageGenerationTab: React.FC<ImageGenerationTabProps> = ({
  imagePrompt,
  setImagePrompt,
  imageStyle,
  setImageStyle,
  imageAspectRatio,
  setImageAspectRatio,
  imageCount,
  setImageCount,
  isGeneratingImages,
  generatedImages,
  handleGenerateImages,
  handleToggleImageFavorite,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate Images
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create custom images based on your prompts and brand guidelines.
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Image Settings
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
                placeholder="Describe the image you want to generate..."
                value={imagePrompt}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setImagePrompt(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Be specific about details, style, mood, lighting, and composition.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Style
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {['Photorealistic', 'Cinematic', 'Artistic', 'Cartoon', '3D Render'].map(style => (
                  <Chip
                    key={style}
                    label={style}
                    onClick={() => setImageStyle(style.toLowerCase())}
                    color={imageStyle === style.toLowerCase() ? 'primary' : 'default'}
                    variant={imageStyle === style.toLowerCase() ? 'filled' : 'outlined'}
                    icon={<StyleIcon />}
                  />
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Aspect Ratio
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {[
                  { label: 'Square (1:1)', value: '1:1' },
                  { label: 'Portrait (4:5)', value: '4:5' },
                  { label: 'Landscape (16:9)', value: '16:9' },
                  { label: 'Vertical (9:16)', value: '9:16' },
                ].map(ratio => (
                  <Chip
                    key={ratio.value}
                    label={ratio.label}
                    onClick={() => setImageAspectRatio(ratio.value)}
                    color={imageAspectRatio === ratio.value ? 'primary' : 'default'}
                    variant={imageAspectRatio === ratio.value ? 'filled' : 'outlined'}
                    icon={<AspectRatioIcon />}
                  />
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Number of Images
              </Typography>
              <Stack direction="row" spacing={1}>
                {[1, 2, 4, 6].map(count => (
                  <Chip
                    key={count}
                    label={count}
                    onClick={() => setImageCount(count)}
                    color={imageCount === count ? 'primary' : 'default'}
                    variant={imageCount === count ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || !imagePrompt.trim()}
                startIcon={isGeneratingImages ? <CircularProgress size={20} /> : <ImageIcon />}
              >
                {isGeneratingImages ? 'Generating...' : 'Generate Images'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Generated Images
            </Typography>
            
            {isGeneratingImages && (
              <Box sx={{ width: '100%', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Generating {imageCount} images...
                </Typography>
                <LinearProgress />
              </Box>
            )}
            
            <Grid container spacing={2}>
              {generatedImages.map((image) => (
                <Grid item key={image.id} xs={12} sm={6} md={imageCount > 2 ? 6 : 12}>
                  <Card>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height={imageAspectRatio === '1:1' ? 200 : 
                                imageAspectRatio === '4:5' ? 250 :
                                imageAspectRatio === '16:9' ? 150 : 300}
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
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
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
            
            {generatedImages.length === 0 && !isGeneratingImages && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No images generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure your settings and click &quot;Generate Images&quot; to create AI-generated images
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImageGenerationTab;