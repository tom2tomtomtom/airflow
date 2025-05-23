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
} from '@mui/material';
import {
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Mic as MicIcon,
  Psychology as PsychologyIcon,
  Videocam as VideocamIcon,
  Collections as CollectionsIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';
import StrategicMotivationsTab from '@/components/generate/StrategicMotivationsTab';
import CopyGenerationTab from '@/components/generate/CopyGenerationTab';
import ImageGenerationTab from '@/components/generate/ImageGenerationTab';
import VideoGenerationTab from '@/components/generate/VideoGenerationTab';
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
    prompt: "A montage showing a person's weight loss journey over 3 months",
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

const GenerateNewPage: React.FC = () => {
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
            <StrategicMotivationsTab
              motivations={motivations}
              briefText={briefText}
              setBriefText={setBriefText}
              isGeneratingMotivations={isGeneratingMotivations}
              handleGenerateMotivations={handleGenerateMotivations}
              handleSelectMotivation={handleSelectMotivation}
            />
          )}

          {activeTab === 'copy' && (
            <CopyGenerationTab
              motivations={motivations}
              copyVariations={copyVariations}
              copySettings={copySettings}
              setCopySettings={setCopySettings}
              isGeneratingCopy={isGeneratingCopy}
              handleGenerateCopy={handleGenerateCopy}
              handleToggleCopyFavorite={handleToggleCopyFavorite}
            />
          )}

          {activeTab === 'image' && (
            <ImageGenerationTab
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
              imageStyle={imageStyle}
              setImageStyle={setImageStyle}
              imageAspectRatio={imageAspectRatio}
              setImageAspectRatio={setImageAspectRatio}
              imageCount={imageCount}
              setImageCount={setImageCount}
              isGeneratingImages={isGeneratingImages}
              generatedImages={generatedImages}
              handleGenerateImages={handleGenerateImages}
              handleToggleImageFavorite={handleToggleImageFavorite}
            />
          )}

          {activeTab === 'video' && (
            <VideoGenerationTab
              videoPrompt={videoPrompt}
              setVideoPrompt={setVideoPrompt}
              videoDuration={videoDuration}
              setVideoDuration={setVideoDuration}
              videoStyle={videoStyle}
              setVideoStyle={setVideoStyle}
              videoResolution={videoResolution}
              setVideoResolution={setVideoResolution}
              isGeneratingVideo={isGeneratingVideo}
              generatedVideos={generatedVideos}
              handleGenerateVideo={handleGenerateVideo}
              handleToggleVideoFavorite={handleToggleVideoFavorite}
            />
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

export default GenerateNewPage;
