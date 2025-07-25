import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  VideoStudioContextValue,
  VideoStudioProviderProps,
  VideoTemplate,
  VideoConfig,
  ContentElements,
  TemplateFilters,
  GenerationStatus,
  GenerationResult,
  VideoJob,
  GenerationOptions,
} from './types';

const VideoStudioContext = createContext<VideoStudioContextValue | null>(null);

export const useVideoStudio = (): VideoStudioContextValue => {
  const context = useContext(VideoStudioContext);
  if (!context) {
    throw new Error('useVideoStudio must be used within a VideoStudioProvider');
  }
  return context;
};

export const VideoStudioProvider: React.FC<VideoStudioProviderProps> = ({
  children,
  initialConfig,
  initialElements,
}) => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // Template state
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>({});

  // Configuration state
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    prompt: '',
    style: 'commercial',
    duration: 15,
    resolution: '1080p',
    aspect_ratio: '16:9',
    ...initialConfig,
  });

  const [contentElements, setContentElements] = useState<ContentElements>({
    text_overlays: [],
    background_music: true,
    voice_over: undefined,
    brand_elements: activeClient
      ? {
          logo_url: activeClient.logo,
          color_scheme: [activeClient.primaryColor, activeClient.secondaryColor],
        }
      : undefined,
    ...initialElements,
  });

  // Generation state
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);

  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const templateData = await response.json();
          setTemplates(templateData.templates || []);
        } else {
          showNotification('Failed to load templates', 'error');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        showNotification('Error loading templates', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [showNotification]);

  // Update brand elements when active client changes
  useEffect(() => {
    if (activeClient) {
      setContentElements(prev => ({
        ...prev,
        brand_elements: {
          logo_url: activeClient.logo,
          color_scheme: [activeClient.primaryColor, activeClient.secondaryColor],
        },
      }));
    }
  }, [activeClient]);

  // Action handlers
  const updateVideoConfig = useCallback((config: Partial<VideoConfig>) => {
    setVideoConfig(prev => ({ ...prev, ...config }));
  }, []);

  const updateContentElements = useCallback((elements: Partial<ContentElements>) => {
    setContentElements(prev => ({ ...prev, ...elements }));
  }, []);

  const generateVideo = useCallback(
    async (options: GenerationOptions) => {
      if (!selectedTemplate) {
        showNotification('Please select a template first', 'error');
        return;
      }

      setGenerationStatus('generating');
      setProgress(0);
      setResult(null);

      try {
        const response = await fetch('/api/video/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_id: selectedTemplate.id,
            config: videoConfig,
            content_elements: contentElements,
            generation_options: options,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Poll for generation status
          const jobId = data.generation_id;
          await pollGenerationStatus(jobId);
        } else {
          throw new Error(data.error || 'Video generation failed');
        }
      } catch (error) {
        console.error('Video generation error:', error);
        setGenerationStatus('error');
        showNotification(
          error instanceof Error ? error.message : 'Video generation failed',
          'error'
        );
      }
    },
    [selectedTemplate, videoConfig, contentElements, showNotification]
  );

  const pollGenerationStatus = useCallback(
    async (jobId: string) => {
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;

      const poll = async (): Promise<void> => {
        try {
          const response = await fetch(`/api/video/status/${jobId}`);
          const data = await response.json();

          setProgress(data.progress || 0);
          setVideoJobs(data.jobs || []);

          if (data.status === 'completed') {
            setGenerationStatus('completed');
            setResult({
              id: jobId,
              url: data.output_url,
              thumbnail: data.thumbnail_url,
              duration: data.duration || videoConfig.duration,
              format: 'mp4',
              size: data.file_size || 0,
            });
            showNotification('Video generation completed!', 'success');
            return;
          }

          if (data.status === 'failed') {
            setGenerationStatus('error');
            showNotification(data.error || 'Video generation failed', 'error');
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            setGenerationStatus('error');
            showNotification('Video generation timed out', 'error');
          }
        } catch (error) {
          console.error('Status polling error:', error);
          setGenerationStatus('error');
          showNotification('Error checking video status', 'error');
        }
      };

      await poll();
    },
    [videoConfig.duration, showNotification]
  );

  const contextValue: VideoStudioContextValue = {
    // Template state
    templates,
    selectedTemplate,
    filters,

    // Configuration state
    videoConfig,
    contentElements,

    // Generation state
    generationStatus,
    progress,
    result,
    videoJobs,

    // UI state
    activeStep,
    loading,

    // Actions
    setSelectedTemplate,
    setFilters,
    updateVideoConfig,
    updateContentElements,
    generateVideo,
    setActiveStep,
  };

  return <VideoStudioContext.Provider value={contextValue}>{children}</VideoStudioContext.Provider>;
};
