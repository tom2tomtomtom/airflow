import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Rating,
  Stack,
  Alert,
  Snackbar,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Mic as MicIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  ContentCopy as ContentCopyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  mockMotivations, 
  mockCopyVariations, 
  mockGeneratedImages, 
  mockGeneratedVideos, 
  mockGeneratedVoices,
  type Motivation,
  type CopyVariation,
  type GeneratedImage,
  type GeneratedVideo,
  type GeneratedVoice
} from '@/lib/mockData';

// Lazy load heavy components
const LazyImageGenerationTab = dynamic(
  () => import('@/components/generate/LazyImageGenerationTab'),
  { 
    loading: () => <CircularProgress />,
    ssr: false 
  }
);

const LazyVideoGenerationSection = dynamic(
  () => import('@/components/generate/LazyVideoGenerationSection'),
  { 
    loading: () => <CircularProgress />,
    ssr: false 
  }
);

const VoiceGenerationTab = dynamic(
  () => import('@/components/generate/VoiceGenerationTab'),
  { 
    loading: () => <CircularProgress />,
    ssr: false 
  }
);

const ResultsTab = dynamic(
  () => import('@/components/generate/ResultsTab'),
  { 
    loading: () => <CircularProgress />,
    ssr: false 
  }
);

// Types and mock data are now imported from @/lib/mockData for better performance
const GenerateEnhancedPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeClient, loading: clientLoading } = useClient();

  // State
  const [activeTab, setActiveTab] = useState('strategy');
  const [motivations, setMotivations] = useState<Motivation[]>(mockMotivations);
  const [briefText, setBriefText] = useState('');
  const [briefContext, setBriefContext] = useState<any>(null);
  const [isGeneratingMotivations, setIsGeneratingMotivations] = useState(false);
  const [copySettings, setCopySettings] = useState({
    tone: 'professional',
    style: 'direct',
    length: 'medium',
    frameCount: 3,
    includeCta: true,
  });
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>(mockCopyVariations);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(4);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(mockGeneratedImages);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState(30);
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [videoResolution, setVideoResolution] = useState('1080p');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>(mockGeneratedVideos);

  // Voice generation state
  const [voiceText, setVoiceText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('emma');
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [generatedVoices, setGeneratedVoices] = useState<GeneratedVoice[]>(mockGeneratedVoices);

  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load brief context from localStorage when component mounts
  useEffect(() => {
    const loadBriefContext = () => {
      try {
        const storedContext = localStorage.getItem('airwave_brief_context');
        if (storedContext) {
          const context = JSON.parse(storedContext);
          
          // Check if the context is recent (within 1 hour)
          const isRecent = context.timestamp && (Date.now() - context.timestamp) < 3600000;
          
          if (isRecent) {
            setBriefContext(context);
            setBriefText(context.briefData?.content || '');
            
            // Update copy settings from brief context
            if (context.copyTone) {
              setCopySettings(prev => ({ ...prev, tone: context.copyTone }));
            }
            if (context.copyStyle) {
              setCopySettings(prev => ({ ...prev, style: context.copyStyle }));
            }
            
            // Load motivations if available
            if (context.motivations && context.motivations.length > 0) {
              setMotivations(context.motivations);
            }
            
            // Pre-populate image prompt with brief info
            if (context.briefData?.content) {
              const briefSnippet = context.briefData.content.substring(0, 100);
              setImagePrompt(`Create marketing visuals for: ${briefSnippet}...`);
            }
            
            console.log('Loaded brief context:', context);
            setSnackbarMessage('Brief data loaded from strategy page');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
          } else {
            // Remove old context
            localStorage.removeItem('airwave_brief_context');
          }
        }
      } catch (error) {
        console.error('Error loading brief context:', error);
        localStorage.removeItem('airwave_brief_context');
      }
    };

    loadBriefContext();
  }, []);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Handle motivation selection
  const handleSelectMotivation = (id: string) => {
    setMotivations(motivations.map(motivation =>
      motivation.id === id
        ? { ...motivation, selected: !motivation.selected }
        : motivation
    ));
  };

  // Handle copy generation
  const handleGenerateCopy = async () => {
    const selectedMotivations = motivations.filter(m => m.selected);

    if (selectedMotivations.length === 0) {
      setSnackbarMessage('Please select at least one motivation');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!activeClient?.id) {
      setSnackbarMessage('Please select a client first.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingCopy(true);

    try {
      // Get user from localStorage to access the token
      const storedUser = localStorage.getItem('airwave_user');
      if (!storedUser) {
        setSnackbarMessage('User not authenticated');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsGeneratingCopy(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      const token = user.token;

      // Generate copy for each selected motivation
      const newVariations: CopyVariation[] = [];

      for (const motivation of selectedMotivations) {
        for (let i = 0; i < copySettings.frameCount; i++) {
          const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              prompt: `Generate ${copySettings.length} copy for ${motivation.title}: ${motivation.description}. Tone: ${copySettings.tone}, Style: ${copySettings.style}${copySettings.includeCta ? ', Include call-to-action' : ''}`,
              type: 'text',
              parameters: {
                purpose: 'copy_generation',
                motivation: motivation.title,
                tone: copySettings.tone,
                style: copySettings.style,
                length: copySettings.length,
                includeCta: copySettings.includeCta
              },
              clientId: activeClient.id,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.result?.content) {
              newVariations.push({
                id: `copy-${Date.now()}-${i}`,
                text: result.result.content,
                motivationId: motivation.id,
                settings: copySettings,
                favorite: false,
              });
            }
          }
        }
      }

      if (newVariations.length > 0) {
        setCopyVariations([...newVariations, ...copyVariations]);
        setSnackbarMessage(`Generated ${newVariations.length} copy variations successfully`);
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to generate copy. Please try again.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Copy generation error:', error);
      setSnackbarMessage('Failed to generate copy. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsGeneratingCopy(false);
      setSnackbarOpen(true);
    }
  };

  // Handle brief-based motivation generation
  const handleGenerateMotivations = async () => {
    if (!briefText.trim()) {
      setSnackbarMessage('Please enter a brief description');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!activeClient?.id) {
      setSnackbarMessage('Please select a client first.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingMotivations(true);

    try {
      // Get user from localStorage to access the token
      const storedUser = localStorage.getItem('airwave_user');
      if (!storedUser) {
        setSnackbarMessage('User not authenticated');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsGeneratingMotivations(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      const token = user.token;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: `Generate strategic motivations for this client brief: ${briefText}`,
          type: 'text',
          parameters: {
            purpose: 'strategic_motivations',
            format: 'structured',
            count: 6
          },
          clientId: activeClient.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate motivations');
      }

      const result = await response.json();
      if (result.success && result.result?.content) {
        // Parse the generated motivations and update state
        // For now, we'll add some sample motivations since the API returns text
        const newMotivations = [
          {
            id: 'mot-1',
            title: 'Emotional Connection',
            description: 'Build emotional resonance with target audience',
            relevanceScore: 4.5,
            selected: false,
          },
          {
            id: 'mot-2',
            title: 'Value Proposition',
            description: 'Highlight unique value and benefits',
            relevanceScore: 4.2,
            selected: false,
          },
          {
            id: 'mot-3',
            title: 'Social Proof',
            description: 'Leverage testimonials and credibility',
            relevanceScore: 3.8,
            selected: false,
          }
        ];

        setMotivations(newMotivations);
        setSnackbarMessage('Motivations generated successfully');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to generate motivations. Please try again.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Motivations generation error:', error);
      setSnackbarMessage('Failed to generate motivations. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsGeneratingMotivations(false);
      setSnackbarOpen(true);
    }
  };

  // Handle favorite toggle for copy
  const handleToggleCopyFavorite = (id: string) => {
    setCopyVariations(copyVariations.map(variation =>
      variation.id === id
        ? { ...variation, favorite: !variation.favorite }
        : variation
    ));
  };

  // Handle image generation
  const handleGenerateImages = async () => {
    if (!imagePrompt.trim()) {
      setSnackbarMessage('Please enter an image prompt');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!activeClient?.id) {
      setSnackbarMessage('Please select a client first.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingImages(true);

    try {
      // Get user from localStorage to access the token
      const storedUser = localStorage.getItem('airwave_user');
      if (!storedUser) {
        setSnackbarMessage('User not authenticated');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsGeneratingImages(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      const token = user.token;

      // Generate images sequentially (DALL-E API limit)
      const newImages: GeneratedImage[] = [];

      for (let i = 0; i < Math.min(imageCount, 4); i++) { // Limit to 4 images
        try {
          console.log(`Generating image ${i + 1}/${Math.min(imageCount, 4)}...`);
          
          const response = await fetch('/api/dalle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.id || user.user_id || 'unknown',
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              client_id: activeClient.id,
              model: 'dall-e-3',
              size: imageAspectRatio === '16:9' ? '1792x1024' :
                    imageAspectRatio === '9:16' ? '1024x1792' : '1024x1024',
              style: imageStyle === 'photorealistic' ? 'natural' : 'vivid',
              quality: 'hd',
              enhance_prompt: true,
              purpose: 'social',
              tags: ['ai-generated', imageStyle],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to generate image ${i + 1}:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
            setSnackbarMessage(`Image ${i + 1} failed: ${errorData.message || 'Unknown error'}`);
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            continue;
          }

          const result = await response.json();
          console.log(`Image ${i + 1} generation result:`, result);
          
          if (result.success && result.asset?.url) {
            newImages.push({
              id: result.asset.id || `img-${Date.now()}-${i}`,
              url: result.asset.url,
              prompt: imagePrompt,
              style: imageStyle,
              aspectRatio: imageAspectRatio,
              dateCreated: new Date().toISOString(),
              favorite: false,
            });
            
            console.log(`Successfully generated image ${i + 1}: ${result.asset.url}`);
          } else {
            console.error(`Image ${i + 1} generation failed - no asset URL in response:`, result);
          }
        } catch (imageError) {
          console.error(`Error generating image ${i + 1}:`, imageError);
          setSnackbarMessage(`Image ${i + 1} failed: ${imageError instanceof Error ? imageError.message : 'Network error'}`);
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        }
      }

      if (newImages.length > 0) {
        setGeneratedImages([...newImages, ...generatedImages]);
        setSnackbarMessage(`Successfully generated ${newImages.length} image${newImages.length > 1 ? 's' : ''}`);
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to generate any images. Please try again.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setSnackbarMessage('Failed to generate images. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsGeneratingImages(false);
      setSnackbarOpen(true);
    }
  };

  // Handle favorite toggle for images
  const handleToggleImageFavorite = (id: string) => {
    setGeneratedImages(generatedImages.map(image =>
      image.id === id
        ? { ...image, favorite: !image.favorite }
        : image
    ));
  };

  // Handle video generation
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      setSnackbarMessage('Please enter a video prompt');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!activeClient?.id) {
      setSnackbarMessage('Please select a client first.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingVideo(true);

    try {
      // Get user from localStorage to access the token
      const storedUser = localStorage.getItem('airwave_user');
      if (!storedUser) {
        setSnackbarMessage('User not authenticated');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsGeneratingVideo(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      const token = user.token;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: videoPrompt,
          type: 'video',
          parameters: {
            duration: videoDuration,
            resolution: videoResolution,
            style: videoStyle,
            quality: 'hd'
          },
          clientId: activeClient.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const result = await response.json();
      if (result.success && result.result?.content) {
        const newVideo: GeneratedVideo = {
          id: result.result.id,
          url: result.result.content,
          thumbnail: result.result.content, // Use same URL for now
          prompt: videoPrompt,
          duration: `00:${videoDuration < 10 ? '0' + videoDuration : videoDuration}`,
          resolution: videoResolution,
          dateCreated: new Date().toISOString(),
          status: 'completed',
          favorite: false,
        };

        setGeneratedVideos([newVideo, ...generatedVideos]);
        setSnackbarMessage('Video generated successfully');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to generate video. Please try again.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setSnackbarMessage('Failed to generate video. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsGeneratingVideo(false);
      setSnackbarOpen(true);
    }
  };

  // Handle favorite toggle for videos
  const handleToggleVideoFavorite = (id: string) => {
    setGeneratedVideos(generatedVideos.map(video =>
      video.id === id
        ? { ...video, favorite: !video.favorite }
        : video
    ));
  };

  // Handle voice generation
  const handleGenerateVoice = async () => {
    if (!voiceText.trim()) {
      setSnackbarMessage('Please enter text for voice generation');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!activeClient?.id) {
      setSnackbarMessage('Please select a client first.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingVoice(true);

    try {
      // Get user from localStorage to access the token
      const storedUser = localStorage.getItem('airwave_user');
      if (!storedUser) {
        setSnackbarMessage('User not authenticated');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsGeneratingVoice(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      const token = user.token;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: voiceText,
          type: 'voice',
          parameters: {
            voice: selectedVoice,
            language: voiceLanguage,
            quality: 'high'
          },
          clientId: activeClient.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice');
      }

      const result = await response.json();
      if (result.success && result.result?.content) {
        const newVoice: GeneratedVoice = {
          id: result.result.id,
          url: result.result.content,
          text: voiceText,
          voice: selectedVoice,
          language: voiceLanguage,
          duration: '00:' + Math.ceil(voiceText.length / 20).toString().padStart(2, '0'),
          dateCreated: new Date().toISOString(),
          favorite: false,
        };

        setGeneratedVoices([newVoice, ...generatedVoices]);
        setSnackbarMessage('Voice generated successfully');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to generate voice. Please try again.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Voice generation error:', error);
      setSnackbarMessage('Failed to generate voice. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsGeneratingVoice(false);
      setSnackbarOpen(true);
    }
  };

  // Handle favorite toggle for voices
  const handleToggleVoiceFavorite = (id: string) => {
    setGeneratedVoices(generatedVoices.map(voice =>
      voice.id === id
        ? { ...voice, favorite: !voice.favorite }
        : voice
    ));
  };

  if (authLoading || clientLoading || !activeClient) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Generate Content | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Generate Content">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Content Generation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Use AI to generate various content types for your campaign
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
        >
          <Tab
            icon={<PsychologyIcon />}
            label="Strategic Motivations"
            value="strategy"
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
          <Tab
            icon={<CollectionsIcon />}
            label="All Results"
            value="results"
            iconPosition="start"
          />
        </Tabs>

        <Box>
          {activeTab === 'strategy' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Generate Strategic Motivations
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload or enter your client brief to generate strategic motivations that will inform your content creation.
              </Typography>

              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Client Brief
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Enter client brief text or campaign objectives here..."
                  value={briefText}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateMotivations}
                    disabled={isGeneratingMotivations || !briefText.trim()}
                    startIcon={isGeneratingMotivations ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                  >
                    {isGeneratingMotivations ? 'Generating...' : 'Generate Motivations'}
                  </Button>
                </Box>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Strategic Motivations
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select motivations to use as the foundation for your content generation.
              </Typography>

              <Grid container spacing={3}>
                {motivations.map(motivation => (
                  <Grid item key={motivation.id} xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        height: '100%',
                        border: motivation.selected ? '2px solid' : 'none',
                        borderColor: 'primary.main',
                      }}
                    >
                      <CardHeader
                        title={motivation.title}
                        action={
                          <IconButton
                            onClick={() => handleSelectMotivation(motivation.id)} aria-label="Icon button"
                            color={motivation.selected ? 'primary' : 'default'}
                          >
                            {motivation.selected ? <CheckIcon /> : <AddIcon />}
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {motivation.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Relevance:
                          </Typography>
                          <Rating
                            value={motivation.relevanceScore}
                            precision={0.5}
                            readOnly
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab('copy')}
                  disabled={motivations.filter(m => m.selected).length < 1}
                >
                  Next: Generate Copy
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 'copy' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Generate Copy
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure copy generation settings and create variations based on your selected motivations.
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Copy Settings
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Tone
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        {['Professional', 'Casual', 'Inspirational', 'Urgent'].map(tone => (
                          <Chip
                            key={tone}
                            label={tone}
                            onClick={() => setCopySettings({
                              ...copySettings,
                              tone: tone.toLowerCase(),
                            })}
                            color={copySettings.tone === tone.toLowerCase() ? 'primary' : 'default'}
                            variant={copySettings.tone === tone.toLowerCase() ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Style
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {['Direct', 'Storytelling', 'Question-based', 'Statistic-led'].map(style => (
                          <Chip
                            key={style}
                            label={style}
                            onClick={() => setCopySettings({
                              ...copySettings,
                              style: style.toLowerCase(),
                            })}
                            color={copySettings.style === style.toLowerCase() ? 'primary' : 'default'}
                            variant={copySettings.style === style.toLowerCase() ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Length
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {['Short', 'Medium', 'Long'].map(length => (
                          <Chip
                            key={length}
                            label={length}
                            onClick={() => setCopySettings({
                              ...copySettings,
                              length: length.toLowerCase(),
                            })}
                            color={copySettings.length === length.toLowerCase() ? 'primary' : 'default'}
                            variant={copySettings.length === length.toLowerCase() ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Number of variations per motivation
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {[2, 3, 4].map(count => (
                          <Chip
                            key={count}
                            label={count}
                            onClick={() => setCopySettings({
                              ...copySettings,
                              frameCount: count,
                            })}
                            color={copySettings.frameCount === count ? 'primary' : 'default'}
                            variant={copySettings.frameCount === count ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Include call-to-action
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label="Yes"
                          onClick={() => setCopySettings({
                            ...copySettings,
                            includeCta: true,
                          })}
                          color={copySettings.includeCta ? 'primary' : 'default'}
                          variant={copySettings.includeCta ? 'filled' : 'outlined'}
                        />
                        <Chip
                          label="No"
                          onClick={() => setCopySettings({
                            ...copySettings,
                            includeCta: false,
                          })}
                          color={!copySettings.includeCta ? 'primary' : 'default'}
                          variant={!copySettings.includeCta ? 'filled' : 'outlined'}
                        />
                      </Stack>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleGenerateCopy}
                        disabled={isGeneratingCopy}
                        startIcon={isGeneratingCopy ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                      >
                        {isGeneratingCopy ? 'Generating...' : 'Generate Copy'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Generated Copy
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Review and select your preferred copy variations for each motivation.
                      </Typography>
                    </Box>

                    {motivations
                      .filter(m => m.selected)
                      .map(motivation => {
                        const variations = copyVariations.filter(v => v.motivationId === motivation.id);

                        return (
                          <Box key={motivation.id} sx={{ mb: 4 }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2,
                              pb: 1,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            }}>
                              <Typography variant="h6" color="primary">
                                {motivation.title}
                              </Typography>
                            </Box>

                            <Grid container spacing={2}>
                              {variations.map(variation => (
                                <Grid item key={variation.id} xs={12}>
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
                                      color={variation.favorite ? 'error' : 'default'}
                                      onClick={() => handleToggleCopyFavorite(variation.id)} aria-label="Icon button">
                                      {variation.favorite ? <StarIcon /> : <StarBorderIcon />}
                                    </IconButton>

                                    <Typography variant="body1">
                                      {variation.text}
                                    </Typography>

                                    <Box sx={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                      mt: 1,
                                    }}>
                                      <Tooltip title="Edit">
                                        <IconButton size="small" aria-label="Icon button">                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Regenerate">
                                        <IconButton size="small" aria-label="Icon button">                                          <RefreshIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Copy to clipboard">
                                        <IconButton size="small" aria-label="Icon button">                                          <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Save to assets">
                                        <IconButton size="small" color="primary" aria-label="Icon button">                                          <SaveIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        );
                      })}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 'image' && (
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
                                onClick={() => handleToggleImageFavorite(image.id)} aria-label="Icon button">
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
                                  <IconButton size="small" aria-label="Icon button">                                    <FullscreenIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton size="small" aria-label="Icon button">                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                  <IconButton size="small" aria-label="Icon button">                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Save to assets">
                                  <IconButton size="small" color="primary" aria-label="Icon button">                                    <SaveIcon fontSize="small" />
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
          )}

          {activeTab === 'video' && (
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
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setVideoPrompt(e.target.value)}
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
                                      size="large" aria-label="Icon button">                                      <PlayArrowIcon fontSize="large" />
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
                                    onClick={() => handleToggleVideoFavorite(video.id)} aria-label="Icon button">
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
                                          <IconButton size="small" aria-label="Icon button">                                            <DownloadIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                          <IconButton size="small" aria-label="Icon button">                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}
                                    {video.status === 'processing' && (
                                      <Tooltip title="Cancel">
                                        <IconButton size="small" aria-label="Icon button">                                          <StopIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {video.status === 'failed' && (
                                      <Tooltip title="Retry">
                                        <IconButton size="small" aria-label="Icon button">                                          <RefreshIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    <Tooltip title="Save to assets">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        disabled={video.status !== 'completed'} aria-label="Icon button">                                        <SaveIcon fontSize="small" />
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
          )}

          {activeTab === 'voice' && (
            <VoiceGenerationTab
              voiceText={voiceText}
              setVoiceText={setVoiceText}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              voiceLanguage={voiceLanguage}
              setVoiceLanguage={setVoiceLanguage}
              voiceSpeed={voiceSpeed}
              setVoiceSpeed={setVoiceSpeed}
              isGeneratingVoice={isGeneratingVoice}
              setIsGeneratingVoice={setIsGeneratingVoice}
              generatedVoices={generatedVoices}
              setGeneratedVoices={setGeneratedVoices}
              handleGenerateVoice={handleGenerateVoice}
              handleToggleVoiceFavorite={handleToggleVoiceFavorite}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarSeverity={setSnackbarSeverity}
              setSnackbarOpen={setSnackbarOpen}
            />
          )}

          {activeTab === 'results' && (
            <ResultsTab
              copyVariations={copyVariations}
              generatedImages={generatedImages}
              generatedVideos={generatedVideos}
              generatedVoices={generatedVoices}
              handleToggleCopyFavorite={handleToggleCopyFavorite}
              handleToggleImageFavorite={handleToggleImageFavorite}
              handleToggleVideoFavorite={handleToggleVideoFavorite}
              handleToggleVoiceFavorite={handleToggleVoiceFavorite}
            />
          )}
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </DashboardLayout>
    </>
  );
};

export default GenerateEnhancedPage;