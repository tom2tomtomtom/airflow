import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  Grid,
  Alert,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  Style as StyleIcon,
  AspectRatio as AspectRatioIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  dateCreated: string;
  favorite: boolean;
}

interface AIImageGeneratorProps {
  onImageGenerated?: (image: GeneratedImage) => void;
  showSettings?: boolean;
  maxImages?: number;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  showSettings = true,
  maxImages = 6,
}) => {
  const { user } = useAuth();
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImages = async () => {
    if (!imagePrompt.trim()) {
      showNotification('Please enter an image prompt', 'error');
      return;
    }

    if (!activeClient?.id) {
      showNotification('Please select a client first', 'error');
      return;
    }

    if (!user?.id) {
      showNotification('User not authenticated', 'error');
      return;
    }

    setIsGeneratingImages(true);
    setError(null);

    try {
      const newImages: GeneratedImage[] = [];
      const imagesToGenerate = Math.min(imageCount, maxImages);

      for (let i = 0; i < imagesToGenerate; i++) {
        try {
          // Generating image ${i + 1}/${imagesToGenerate}

          const response = await fetch('/api/dalle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.id,
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              client_id: activeClient.id,
              model: 'dall-e-3',
              size: imageAspectRatio === '16:9' 
                ? '1792x1024' 
                : imageAspectRatio === '9:16' 
                ? '1024x1792' 
                : '1024x1024',
              style: imageStyle === 'photorealistic' ? 'natural' : 'vivid',
              quality: 'hd',
              enhance_prompt: true,
              purpose: 'social',
              tags: ['ai-generated', imageStyle],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            // Failed to generate image ${i + 1}
            showNotification(`Image ${i + 1} failed: ${errorData.message || 'Unknown error'}`, 'warning');
            continue;
          }

          const result = await response.json();
          // Image generation result received

          if (result.success && result.asset?.url) {
            const newImage: GeneratedImage = {
              id: result.asset.id || `img-${Date.now()}-${i}`,
              url: result.asset.url,
              prompt: imagePrompt,
              style: imageStyle,
              aspectRatio: imageAspectRatio,
              dateCreated: new Date().toISOString(),
              favorite: false,
            };

            newImages.push(newImage);
            // Successfully generated image

            // Call callback if provided
            if (onImageGenerated) {
              onImageGenerated(newImage);
            }
          } else {
            // Image generation failed - no asset URL in response
          }
        } catch (imageError) {
          // Error generating image
          showNotification(
            `Image ${i + 1} failed: ${imageError instanceof Error ? imageError.message : 'Network error'}`,
            'warning'
          );
        }
      }

      if (newImages.length > 0) {
        setGeneratedImages([...newImages, ...generatedImages]);
        showNotification(
          `Successfully generated ${newImages.length} image${newImages.length > 1 ? 's' : ''}`,
          'success'
        );
      } else {
        setError('Failed to generate any images. Please try again.');
        showNotification('Failed to generate any images. Please try again.', 'error');
      }
    } catch (error) {
      // Image generation error occurred
      setError('Failed to generate images. Please try again.');
      showNotification('Failed to generate images. Please try again.', 'error');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleToggleImageFavorite = (id: string) => {
    setGeneratedImages(
      generatedImages.map((image) =>
        image.id === id ? { ...image, favorite: !image.favorite } : image
      )
    );
  };

  const handleViewImageFullSize = (image: GeneratedImage) => {
    window.open(image.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `airwave-generated-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('Image downloaded successfully', 'success');
    } catch (error) {
      // Download error occurred
      showNotification('Failed to download image', 'error');
    }
  };

  const handleRegenerateImage = (image: GeneratedImage) => {
    setImagePrompt(image.prompt);
    setImageStyle(image.style);
    setImageAspectRatio(image.aspectRatio);
    setImageCount(1);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        AI Image Generator
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create custom images using DALL-E 3 based on your prompts and brand guidelines.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {showSettings && (
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
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
                  onChange={(e) => setImagePrompt(e.target.value)}
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
                  {['Photorealistic', 'Cinematic', 'Artistic', 'Cartoon', '3D Render'].map((style) => (
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
                  ].map((ratio) => (
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
                  {[1, 2, 4, Math.min(6, maxImages)].map((count) => (
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
        )}

        <Grid xs={12} md={showSettings ? 8 : 12}>
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
                <Grid
                  xs={12}
                  sm={6}
                  md={imageCount > 2 ? 6 : 12}
                  key={image.id}
                >
                  <Card>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height={
                          imageAspectRatio === '1:1'
                            ? 200
                            : imageAspectRatio === '4:5'
                            ? 250
                            : imageAspectRatio === '16:9'
                            ? 150
                            : 300
                        }
                        image={image.url}
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
                          },
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
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Chip size="small" label={image.style} />
                        <Chip size="small" label={image.aspectRatio} variant="outlined" />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mt: 2,
                        }}
                      >
                        <Tooltip title="View full size">
                          <IconButton
                            size="small"
                            onClick={() => handleViewImageFullSize(image)}
                          >
                            <FullscreenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Regenerate with same prompt">
                          <IconButton
                            size="small"
                            onClick={() => handleRegenerateImage(image)}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadImage(image)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Saved to assets automatically">
                          <IconButton size="small" color="primary" disabled>
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

export default AIImageGenerator;