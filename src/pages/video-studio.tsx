import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { Box, Typography, Stepper, Step, StepLabel, Button, Paper, Alert } from '@mui/material';
import { ArrowBack, ArrowForward, VideoLibrary } from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

// Import all extracted video studio components
import {
  VideoStudioProvider,
  VideoTemplateSelector,
  VideoConfigurationPanel,
  ContentElementEditor,
  VideoPreviewPanel,
  GenerationControlPanel,
  useTemplateSelection,
  useVideoConfig,
  useContentElements,
  useVideoPreview,
  useVideoGeneration,
  GenerationOptions,
  ExportPlatform,
} from '@/components/video-studio';
import { VideoStudioSectionBoundary } from '@/components/video-studio/ErrorBoundary';

// Define the steps in the video creation workflow
const WORKFLOW_STEPS = [
  'Select Template',
  'Configure Video',
  'Edit Content',
  'Preview',
  'Generate',
];

/**
 * VideoStudioPage - Refactored version using extracted components
 *
 * This is the new, clean implementation that replaces the monolithic 1,257-line component
 * with a composition of focused, reusable components. Each step of the workflow is now
 * handled by dedicated components with their own state management hooks.
 */
const VideoStudioPage: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // Workflow state
  const [activeStep, setActiveStep] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Initialize custom hooks for each workflow section
  const templateSelection = useTemplateSelection();

  const videoConfig = useVideoConfig({
    style: 'commercial',
    duration: 15,
    resolution: '1080p',
    aspect_ratio: '16:9',
    platform: 'instagram',
  });

  const contentElements = useContentElements(
    // Initialize with client branding if available
    activeClient
      ? {
          brand_elements: {
            logo_url: activeClient.logo,
            color_scheme: [activeClient.primaryColor, activeClient.secondaryColor],
          },
        }
      : {},
    {
      variations_count: 1,
      include_captions: false,
      auto_optimize_for_platform: true,
      save_to_assets: true,
    }
  );

  const videoPreview = useVideoPreview({
    config: videoConfig.config,
    elements: contentElements.contentElements,
    template: templateSelection.selectedTemplate,
    autoRefresh: false,
  });

  const videoGeneration = useVideoGeneration({
    config: videoConfig.config,
    elements: contentElements.contentElements,
    template: templateSelection.selectedTemplate,
    onGenerationComplete: _result => {
      showNotification('Video generation completed successfully!', 'success');
    },
    onGenerationError: error => {
      showNotification(`Video generation failed: ${error}`, 'error');
    },
  });

  // Handle template selection and update config accordingly
  useEffect(() => {
    if (templateSelection.selectedTemplate) {
      videoConfig.updateConfig({
        template_id: templateSelection.selectedTemplate.id,
        duration: templateSelection.selectedTemplate.duration,
        aspect_ratio: templateSelection.selectedTemplate.aspect_ratio,
      });
    }
  }, [templateSelection.selectedTemplate, videoConfig]);

  // Step validation logic with useMemo optimization
  const canProceedToStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Template selection
        return true;
      case 1: // Configuration
        return !!templateSelection.selectedTemplate;
      case 2: // Content editing
        return !!templateSelection.selectedTemplate && !!videoConfig.config.prompt?.trim();
      case 3: // Preview
        return !!templateSelection.selectedTemplate && !!videoConfig.config.prompt?.trim();
      case 4: // Generation
        return !!templateSelection.selectedTemplate && !!videoConfig.config.prompt?.trim();
      default:
        return false;
    }
  }, [templateSelection.selectedTemplate, videoConfig.config.prompt]);

  const getStepStatus = useCallback((step: number): 'completed' | 'active' | 'disabled' => {
    if (step < activeStep) return 'completed';
    if (step === activeStep) return 'active';
    if (canProceedToStep(step)) return 'active';
    return 'disabled';
  }, [activeStep, canProceedToStep]);

  // Navigation handlers with useCallback optimization
  const handleNext = useCallback(() => {
    if (activeStep < WORKFLOW_STEPS.length - 1 && canProceedToStep(activeStep + 1)) {
      setActiveStep(activeStep + 1);
    }
  }, [activeStep, canProceedToStep]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  const handleStepClick = useCallback((step: number) => {
    if (canProceedToStep(step)) {
      setActiveStep(step);
    }
  }, [canProceedToStep]);

  // Generation handlers with useCallback optimization
  const handleGenerate = useCallback(async (options: GenerationOptions) => {
    try {
      await videoGeneration.generateVideo(options);
    } catch (error) {
      // Error is already handled by the videoGeneration hook
    }
  }, [videoGeneration]);

  const handleDownload = useCallback(() => {
    videoGeneration.downloadVideo();
  }, [videoGeneration]);

  const handleExport = useCallback((platforms: ExportPlatform[]) => {
    // In a real implementation, this would handle platform-specific exports
    showNotification(`Exporting to ${platforms.length} platform(s)...`, 'info');
  }, [showNotification]);

  // Render the appropriate step content with error boundaries - optimized with useMemo
  const renderStepContent = useMemo(() => {
    switch (activeStep) {
      case 0: // Template Selection
        return (
          <VideoStudioSectionBoundary section="Template Selection">
            <VideoTemplateSelector
              templates={templateSelection.templates}
              selectedTemplate={templateSelection.selectedTemplate}
              onTemplateSelect={templateSelection.setSelectedTemplate}
              filters={templateSelection.filters}
              onFilterChange={templateSelection.setFilters}
              loading={templateSelection.loading}
            />
          </VideoStudioSectionBoundary>
        );

      case 1: // Video Configuration
        return (
          <VideoStudioSectionBoundary section="Video Configuration">
            <VideoConfigurationPanel
              config={videoConfig.config}
              onConfigChange={videoConfig.updateConfig}
              template={templateSelection.selectedTemplate}
              constraints={{
                min_duration: 5,
                max_duration: 60,
                allowed_aspect_ratios: ['16:9', '1:1', '9:16'],
                max_text_overlays: 5,
                supported_resolutions: ['720p', '1080p', '4K'],
              }}
            />
          </VideoStudioSectionBoundary>
        );

      case 2: // Content Elements
        return (
          <VideoStudioSectionBoundary section="Content Elements">
            <ContentElementEditor
              elements={contentElements.textOverlays}
              onElementsChange={elements => {
                if (Array.isArray(elements)) {
                  contentElements.updateContentElements({ text_overlays: elements });
                } else {
                  contentElements.updateContentElements(elements);
                }
              }}
              template={templateSelection.selectedTemplate}
              selectedElement={selectedElement}
              onElementSelect={setSelectedElement}
              maxElements={10}
              contentElements={contentElements.contentElements}
              generationSettings={contentElements.generationSettings}
              onGenerationSettingsChange={contentElements.updateGenerationSettings}
            />
          </VideoStudioSectionBoundary>
        );

      case 3: // Preview
        return (
          <VideoStudioSectionBoundary section="Video Preview">
            <VideoPreviewPanel
              config={videoConfig.config}
              elements={contentElements.contentElements}
              template={templateSelection.selectedTemplate}
              previewUrl={videoPreview.previewUrl || undefined}
              onPreviewGenerate={videoPreview.generatePreview}
              loading={videoPreview.loading}
            />
          </VideoStudioSectionBoundary>
        );

      case 4: // Generation
        return (
          <VideoStudioSectionBoundary section="Video Generation">
            <GenerationControlPanel
              onGenerate={handleGenerate}
              generationStatus={videoGeneration.generationStatus}
              progress={videoGeneration.progress}
              resultUrl={videoGeneration.result?.url}
              onDownload={handleDownload}
              onExport={handleExport}
              videoJobs={videoGeneration.videoJobs}
            />
          </VideoStudioSectionBoundary>
        );

      default:
        return null;
    }
  }, [
    activeStep,
    templateSelection.templates,
    templateSelection.selectedTemplate,
    templateSelection.setSelectedTemplate,
    templateSelection.filters,
    templateSelection.setFilters,
    templateSelection.loading,
    videoConfig.config,
    videoConfig.updateConfig,
    contentElements,
    selectedElement,
    videoPreview.previewUrl,
    videoPreview.generatePreview,
    videoPreview.loading,
    videoGeneration.generationStatus,
    videoGeneration.progress,
    videoGeneration.result,
    videoGeneration.videoJobs,
    handleGenerate,
    handleDownload,
    handleExport,
  ]);

  return (
    <>
      <Head>
        <title>Video Studio - AIRWAVE</title>
        <meta name="description" content="Create stunning videos with AI-powered templates" />
      </Head>

      <DashboardLayout>
        <VideoStudioProvider>
          <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <VideoLibrary sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Video Studio
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Create professional videos using AI-powered templates and customization tools
              </Typography>
            </Box>

            {/* Progress Stepper */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {WORKFLOW_STEPS.map((label, index) => (
                  <Step
                    key={label}
                    completed={getStepStatus(index) === 'completed'}
                    disabled={getStepStatus(index) === 'disabled'}
                  >
                    <StepLabel
                      onClick={() => handleStepClick(index)}
                      sx={{
                        cursor: canProceedToStep(index) ? 'pointer' : 'default',
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          fontWeight: activeStep === index ? 600 : 400,
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step Navigation Buttons */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  variant="outlined"
                >
                  Back
                </Button>

                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {WORKFLOW_STEPS.length}
                </Typography>

                <Button
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                  disabled={
                    activeStep === WORKFLOW_STEPS.length - 1 || !canProceedToStep(activeStep + 1)
                  }
                  variant="contained"
                >
                  {activeStep === WORKFLOW_STEPS.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </Box>
            </Paper>

            {/* Step Content */}
            <Paper sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h5" gutterBottom>
                {WORKFLOW_STEPS[activeStep]}
              </Typography>

              {/* Show validation messages */}
              {activeStep > 0 && !canProceedToStep(activeStep) && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Please complete the previous steps before proceeding.
                </Alert>
              )}

              {/* Render the current step content */}
              <Box sx={{ mt: 3 }}>{renderStepContent}</Box>
            </Paper>

            {/* Error Display */}
            {(templateSelection.error || videoPreview.error || videoGeneration.error) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {templateSelection.error || videoPreview.error || videoGeneration.error}
              </Alert>
            )}

            {/* Debug Information (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <Paper sx={{ p: 2, mt: 4, backgroundColor: 'grey.50' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Debug Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Selected Template: {templateSelection.selectedTemplate?.name || 'None'} | Config
                  Valid: {videoConfig.config.prompt ? 'Yes' : 'No'} | Elements Valid:{' '}
                  {contentElements.isValid ? 'Yes' : 'No'} | Can Generate:{' '}
                  {videoGeneration.canGenerate ? 'Yes' : 'No'}
                </Typography>
              </Paper>
            )}
          </Box>
        </VideoStudioProvider>
      </DashboardLayout>
    </>
  );
};

export default VideoStudioPage;
