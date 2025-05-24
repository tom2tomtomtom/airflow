import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CardActionArea,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Divider,
  IconButton,
  Chip,
  Rating,
  Stack,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Videocam as VideocamIcon,
  Collections as CollectionsIcon,
  Tune as TuneIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  AspectRatio as AspectRatioIcon,
  FormatColorFill as ColorIcon,
  Style as StyleIcon,
  Palette as PaletteIcon,
  Brush as BrushIcon,
  Crop as CropIcon,
  Fullscreen as FullscreenIcon,
  SettingsVoice as SettingsVoiceIcon,
  Speed as SpeedIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Audiotrack as AudiotrackIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';
import VoiceGenerationTab from '@/components/generate/VoiceGenerationTab';
import ResultsTab from '@/components/generate/ResultsTab';

// Types
interface Motivation {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  selected: boolean;
}

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

// Mock data for motivations
const mockMotivations: Motivation[] = [
  {
    id: 'm1',
    title: 'Sustainable Weight Loss Journey',
    description: 'Focus on the long-term benefits of sustainable weight loss practices, emphasizing lifestyle changes over quick fixes. Appeal to customers seeking lasting results.',
    relevanceScore: 4.5,
    selected: true,
  },
  {
    id: 'm2',
    title: 'Science-Backed Solutions',
    description: 'Highlight the scientific research and evidence supporting our weight loss programs. Appeal to analytical customers who value proven methods.',
    relevanceScore: 4.8,
    selected: true,
  },
  {
    id: 'm3',
    title: 'Community Support',
    description: 'Emphasize the community aspect of weight loss, including group support, shared experiences, and the journey with like-minded individuals.',
    relevanceScore: 3.9,
    selected: false,
  },
  {
    id: 'm4',
    title: 'Personal Transformation',
    description: 'Focus on the holistic transformation beyond weight loss, including improved confidence, energy levels, and overall quality of life.',
    relevanceScore: 4.2,
    selected: true,
  },
  {
    id: 'm5',
    title: 'Expert Guidance',
    description: 'Highlight the professional support from nutritionists, fitness experts, and health coaches that guide customers through their weight loss journey.',
    relevanceScore: 4.0,
    selected: true,
  },
];

// Mock data for copy variations
const mockCopyVariations: CopyVariation[] = [
  {
    id: 'c1',
    text: 'Transform your life with our science-backed weight loss program, designed for sustainable results that last.',
    motivationId: 'm1',
    favorite: true,
  },
  {
    id: 'c2',
    text: 'Achieve lasting weight loss with methods validated by scientific research and expert nutritionists.',
    motivationId: 'm2',
    favorite: false,
  },
  {
    id: 'c3',
    text: 'Experience the difference of our sustainable approach to weight loss, where healthy habits replace quick fixes.',
    motivationId: 'm1',
    favorite: false,
  },
  {
    id: 'c4',
    text: 'Backed by science, supported by experts. Our weight loss program delivers results you can measure and maintain.',
    motivationId: 'm2',
    favorite: true,
  },
];

// Mock data for generated images
const mockGeneratedImages: GeneratedImage[] = [
  {
    id: 'img1',
    url: '/mock-images/weight-loss-1.jpg',
    prompt: 'A person celebrating their weight loss journey, showing before and after transformation',
    style: 'Photorealistic',
    aspectRatio: '1:1',
    dateCreated: '2023-05-15T10:30:00Z',
    favorite: true,
  },
  {
    id: 'img2',
    url: '/mock-images/weight-loss-2.jpg',
    prompt: 'A nutritionist explaining a healthy meal plan to a client',
    style: 'Cinematic',
    aspectRatio: '16:9',
    dateCreated: '2023-05-15T11:15:00Z',
    favorite: false,
  },
];

// Mock data for generated videos
const mockGeneratedVideos: GeneratedVideo[] = [
  {
    id: 'vid1',
    url: '/mock-videos/weight-loss-journey.mp4',
    thumbnail: '/mock-videos/weight-loss-journey-thumb.jpg',
    prompt: 'A montage showing a person\'s weight loss journey over 3 months',
    duration: '00:30',
    resolution: '1080p',
    dateCreated: '2023-05-16T09:45:00Z',
    status: 'completed',
    favorite: true,
  },
  {
    id: 'vid2',
    url: '/mock-videos/nutrition-tips.mp4',
    thumbnail: '/mock-videos/nutrition-tips-thumb.jpg',
    prompt: 'A nutritionist sharing 5 quick tips for healthy eating habits',
    duration: '00:45',
    resolution: '720p',
    dateCreated: '2023-05-16T10:30:00Z',
    status: 'processing',
    favorite: false,
  },
];

// Mock data for generated voices
const mockGeneratedVoices: GeneratedVoice[] = [
  {
    id: 'voice1',
    url: '/mock-voices/weight-loss-intro.mp3',
    text: 'Welcome to your sustainable weight loss journey. Our science-backed approach focuses on long-term results through healthy lifestyle changes.',
    voice: 'Emma',
    language: 'English (US)',
    duration: '00:15',
    dateCreated: '2023-05-17T14:20:00Z',
    favorite: true,
  },
  {
    id: 'voice2',
    url: '/mock-voices/expert-advice.mp3',
    text: 'Our team of certified nutritionists and fitness experts will guide you through every step of your personalized weight loss program.',
    voice: 'James',
    language: 'English (UK)',
    duration: '00:12',
    dateCreated: '2023-05-17T14:35:00Z',
    favorite: false,
  },
];

const GenerateEnhancedPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeClient, loading: clientLoading } = useClient();

  // State
  const [activeTab, setActiveTab] = useState('strategy');
  const [motivations, setMotivations] = useState<Motivation[]>(mockMotivations);
  const [briefText, setBriefText] = useState('');
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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
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
  const handleGenerateCopy = () => {
    const selectedMotivationIds = motivations
      .filter(m => m.selected)
      .map(m => m.id);

    if (selectedMotivationIds.length === 0) {
      setSnackbarMessage('Please select at least one motivation');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingCopy(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to generate copy
      setIsGeneratingCopy(false);
      setSnackbarMessage('Copy generated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };

  // Handle brief-based motivation generation
  const handleGenerateMotivations = () => {
    if (!briefText.trim()) {
      setSnackbarMessage('Please enter a brief description');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingMotivations(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to OpenAI
      setIsGeneratingMotivations(false);
      setSnackbarMessage('Motivations generated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
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
  const handleGenerateImages = () => {
    if (!imagePrompt.trim()) {
      setSnackbarMessage('Please enter an image prompt');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingImages(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to an image generation service
      setIsGeneratingImages(false);
      setSnackbarMessage('Images generated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Add new generated images to the list
      const newImages: GeneratedImage[] = Array.from({ length: imageCount }, (_, i) => ({
        id: `img-new-${Date.now()}-${i}`,
        url: '/mock-images/generated-image.jpg',
        prompt: imagePrompt,
        style: imageStyle,
        aspectRatio: imageAspectRatio,
        dateCreated: new Date().toISOString(),
        favorite: false,
      }));

      setGeneratedImages([...newImages, ...generatedImages]);
    }, 3000);
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
  const handleGenerateVideo = () => {
    if (!videoPrompt.trim()) {
      setSnackbarMessage('Please enter a video prompt');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingVideo(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to a video generation service
      setIsGeneratingVideo(false);
      setSnackbarMessage('Video generation started. This may take a few minutes.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Add new generated video to the list (in processing state)
      const newVideo: GeneratedVideo = {
        id: `vid-new-${Date.now()}`,
        url: '',
        thumbnail: '/mock-videos/processing-thumb.jpg',
        prompt: videoPrompt,
        duration: `00:${videoDuration < 10 ? '0' + videoDuration : videoDuration}`,
        resolution: videoResolution,
        dateCreated: new Date().toISOString(),
        status: 'processing',
        favorite: false,
      };

      setGeneratedVideos([newVideo, ...generatedVideos]);

      // Simulate video completion after 5 seconds
      setTimeout(() => {
        setGeneratedVideos(prev => prev.map(video =>
          video.id === newVideo.id
            ? {
                ...video,
                status: 'completed',
                url: '/mock-videos/generated-video.mp4',
                thumbnail: '/mock-videos/generated-video-thumb.jpg',
              }
            : video
        ));

        setSnackbarMessage('Video generation completed');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }, 5000);
    }, 2000);
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
  const handleGenerateVoice = () => {
    if (!voiceText.trim()) {
      setSnackbarMessage('Please enter text for voice generation');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingVoice(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to a voice generation service
      setIsGeneratingVoice(false);
      setSnackbarMessage('Voice generated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Add new generated voice to the list
      const newVoice: GeneratedVoice = {
        id: `voice-new-${Date.now()}`,
        url: '/mock-voices/generated-voice.mp3',
        text: voiceText,
        voice: selectedVoice,
        language: voiceLanguage,
        duration: '00:' + Math.ceil(voiceText.length / 20).toString().padStart(2, '0'),
        dateCreated: new Date().toISOString(),
        favorite: false,
      };

      setGeneratedVoices([newVoice, ...generatedVoices]);
    }, 2000);
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
                  onChange={(e) => setBriefText(e.target.value)}
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
                            onClick={() => handleSelectMotivation(motivation.id)}
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
                                      onClick={() => handleToggleCopyFavorite(variation.id)}
                                    >
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
                                        <IconButton size="small">
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Regenerate">
                                        <IconButton size="small">
                                          <RefreshIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Copy to clipboard">
                                        <IconButton size="small">
                                          <ContentCopyIcon fontSize="small" />
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
                          Configure your settings and click "Generate Images" to create AI-generated images
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
                        onChange={(e, newValue) => setVideoDuration(newValue as number)}
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
                          Configure your settings and click "Generate Video" to create AI-generated videos
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