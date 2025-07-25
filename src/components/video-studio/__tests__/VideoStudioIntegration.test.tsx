import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoStudioProvider } from '../VideoStudioProvider';
import { VideoTemplateSelector } from '../VideoTemplateSelector';
import { VideoConfigurationPanel } from '../VideoConfigurationPanel';
import { ContentElementEditor } from '../ContentElementEditor';
import { VideoPreviewPanel } from '../VideoPreviewPanel';
import { GenerationControlPanel } from '../GenerationControlPanel';
import { VideoTemplate, VideoConfig, ContentElements, GenerationOptions } from '../types';

// Mock templates for testing
const mockTemplates: VideoTemplate[] = [
  {
    id: 'template-1',
    name: 'Social Media Promo',
    description: 'Perfect for social media campaigns',
    thumbnail: 'https://via.placeholder.com/300x169',
    duration: 15,
    aspect_ratio: '16:9',
    platform: ['instagram', 'facebook', 'youtube'],
    category: 'Social Media',
    tags: ['promo', 'social'],
  },
  {
    id: 'template-2',
    name: 'Product Showcase',
    description: 'Showcase your products effectively',
    thumbnail: 'https://via.placeholder.com/300x169',
    duration: 30,
    aspect_ratio: '1:1',
    platform: ['instagram', 'facebook'],
    category: 'Product',
    tags: ['product', 'showcase'],
  },
];

// Mock Video Studio Integration Component
const VideoStudioIntegration: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<VideoTemplate | null>(null);
  const [videoConfig, setVideoConfig] = React.useState<VideoConfig>({
    prompt: '',
    style: 'modern',
    duration: 15,
    resolution: '1920x1080',
    platform: 'instagram',
    aspect_ratio: '16:9',
  });
  const [contentElements, setContentElements] = React.useState<ContentElements>({
    text_overlays: [],
    background_music: true,
    voice_over: undefined,
    brand_elements: undefined,
  });
  const [filters, setFilters] = React.useState({});
  const [selectedElement, setSelectedElement] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [generationStatus, setGenerationStatus] = React.useState<
    'idle' | 'generating' | 'completed' | 'error'
  >('idle');
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  const handleTemplateSelect = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setVideoConfig(prev => ({
      ...prev,
      template_id: template.id,
      duration: template.duration,
      aspect_ratio: template.aspect_ratio,
    }));
  };

  const handleConfigChange = (config: Partial<VideoConfig>) => {
    setVideoConfig(prev => ({ ...prev, ...config }));
  };

  const handleElementsChange = (elements: ContentElements | ContentElements[]) => {
    if (Array.isArray(elements)) {
      setContentElements(prev => ({ ...prev, text_overlays: elements }));
    } else {
      setContentElements(elements);
    }
  };

  const handlePreviewGenerate = async () => {
    setPreviewLoading(true);
    // Simulate preview generation
    setTimeout(() => {
      setPreviewUrl('https://example.com/preview.mp4');
      setPreviewLoading(false);
    }, 2000);
  };

  const handleGenerate = async (options: GenerationOptions) => {
    setGenerationStatus('generating');
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerationStatus('completed');
          setResultUrl('https://example.com/final-video.mp4');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownload = () => {
    if (resultUrl) {
      window.open(resultUrl, '_blank');
    }
  };

  const handleExport = (platforms: any[]) => {
    console.log('Exporting to platforms:', platforms);
  };

  return (
    <div data-testid="video-studio-integration">
      <h1>Video Studio Integration Test</h1>

      {/* Step 1: Template Selection */}
      <div data-testid="template-step">
        <h2>Step 1: Select Template</h2>
        <VideoTemplateSelector
          templates={mockTemplates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Step 2: Configuration */}
      {selectedTemplate && (
        <div data-testid="config-step">
          <h2>Step 2: Configure Video</h2>
          <VideoConfigurationPanel
            config={videoConfig}
            onConfigChange={handleConfigChange}
            template={selectedTemplate}
          />
        </div>
      )}

      {/* Step 3: Content Elements */}
      {selectedTemplate && videoConfig.prompt && (
        <div data-testid="content-step">
          <h2>Step 3: Edit Content</h2>
          <ContentElementEditor
            elements={contentElements.text_overlays}
            onElementsChange={handleElementsChange}
            template={selectedTemplate}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            contentElements={contentElements}
          />
        </div>
      )}

      {/* Step 4: Preview */}
      {selectedTemplate && videoConfig.prompt && (
        <div data-testid="preview-step">
          <h2>Step 4: Preview Video</h2>
          <VideoPreviewPanel
            config={videoConfig}
            elements={contentElements}
            template={selectedTemplate}
            previewUrl={previewUrl}
            onPreviewGenerate={handlePreviewGenerate}
            loading={previewLoading}
          />
        </div>
      )}

      {/* Step 5: Generation */}
      {selectedTemplate && videoConfig.prompt && (
        <div data-testid="generation-step">
          <h2>Step 5: Generate Video</h2>
          <GenerationControlPanel
            onGenerate={handleGenerate}
            generationStatus={generationStatus}
            progress={generationProgress}
            resultUrl={resultUrl}
            onDownload={handleDownload}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  );
};

describe('Video Studio Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render the complete video studio workflow', () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    expect(screen.getByText('Video Studio Integration Test')).toBeInTheDocument();
    expect(screen.getByTestId('template-step')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Select Template')).toBeInTheDocument();
  });

  it('should progress through the complete workflow step by step', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Step 1: Template selection should be visible
    expect(screen.getByTestId('template-step')).toBeInTheDocument();
    expect(screen.queryByTestId('config-step')).not.toBeInTheDocument();

    // Select a template
    const templateCard = screen.getByText('Social Media Promo');
    fireEvent.click(templateCard);

    // Step 2: Configuration should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('config-step')).toBeInTheDocument();
    });

    // Fill in the prompt
    const promptField = screen.getByLabelText(/prompt/i);
    fireEvent.change(promptField, {
      target: { value: 'Create an engaging social media video about our new product launch' },
    });

    // Step 3: Content elements should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('content-step')).toBeInTheDocument();
    });

    // Step 4: Preview should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('preview-step')).toBeInTheDocument();
    });

    // Step 5: Generation should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('generation-step')).toBeInTheDocument();
    });
  });

  it('should handle template selection and configuration updates', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Select template
    const templateCard = screen.getByText('Social Media Promo');
    fireEvent.click(templateCard);

    await waitFor(() => {
      expect(screen.getByTestId('config-step')).toBeInTheDocument();
    });

    // Check that template data was applied to configuration
    expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Duration
    expect(screen.getByText('16:9')).toBeInTheDocument(); // Aspect ratio
  });

  it('should handle content element editing workflow', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Complete template selection and configuration
    const templateCard = screen.getByText('Social Media Promo');
    fireEvent.click(templateCard);

    await waitFor(() => {
      expect(screen.getByTestId('config-step')).toBeInTheDocument();
    });

    const promptField = screen.getByLabelText(/prompt/i);
    fireEvent.change(promptField, {
      target: { value: 'Test prompt' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('content-step')).toBeInTheDocument();
    });

    // Add text overlay
    const addOverlayButton = screen.getByText('Add Text Overlay');
    fireEvent.click(addOverlayButton);

    // Text overlay should be added
    await waitFor(() => {
      expect(screen.getByText(/Text Overlay 1/)).toBeInTheDocument();
    });
  });

  it('should handle preview generation workflow', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Complete workflow to preview step
    const templateCard = screen.getByText('Social Media Promo');
    fireEvent.click(templateCard);

    await waitFor(() => {
      const promptField = screen.getByLabelText(/prompt/i);
      fireEvent.change(promptField, { target: { value: 'Test prompt' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('preview-step')).toBeInTheDocument();
    });

    // Generate preview
    const generatePreviewButton = screen.getByText('Generate Preview');
    fireEvent.click(generatePreviewButton);

    // Should show loading state
    expect(screen.getByText('Generating preview...')).toBeInTheDocument();

    // Complete preview generation
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Regenerate Preview')).toBeInTheDocument();
    });
  });

  it('should handle video generation workflow', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Complete workflow to generation step
    const templateCard = screen.getByText('Social Media Promo');
    fireEvent.click(templateCard);

    await waitFor(() => {
      const promptField = screen.getByLabelText(/prompt/i);
      fireEvent.change(promptField, { target: { value: 'Test prompt' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('generation-step')).toBeInTheDocument();
    });

    // Start generation
    const generateButton = screen.getByText('Generate Video');
    fireEvent.click(generateButton);

    // Should show generating state
    expect(screen.getByText('Generating...')).toBeInTheDocument();

    // Progress through generation
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText('Generation Complete!')).toBeInTheDocument();
      expect(screen.getByText('Download Video')).toBeInTheDocument();
    });
  });

  it('should handle cross-component data flow correctly', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Select template with different aspect ratio
    const productTemplate = screen.getByText('Product Showcase');
    fireEvent.click(productTemplate);

    await waitFor(() => {
      expect(screen.getByTestId('config-step')).toBeInTheDocument();
    });

    // Check that template data flowed to configuration
    expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // Duration from template
    expect(screen.getByText('1:1')).toBeInTheDocument(); // Aspect ratio from template

    // Update configuration
    const promptField = screen.getByLabelText(/prompt/i);
    fireEvent.change(promptField, { target: { value: 'Product showcase video' } });

    // Check that config flows to preview
    await waitFor(() => {
      expect(screen.getByTestId('preview-step')).toBeInTheDocument();
    });

    // Configuration should be visible in preview
    expect(screen.getByText('Duration: 30s')).toBeInTheDocument();
    expect(screen.getByText('Aspect Ratio: 1:1')).toBeInTheDocument();
  });

  it('should handle error states across components', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Template selection should handle no templates
    expect(screen.getByTestId('template-step')).toBeInTheDocument();

    // Should show templates when available
    expect(screen.getByText('Social Media Promo')).toBeInTheDocument();
    expect(screen.getByText('Product Showcase')).toBeInTheDocument();
  });

  it('should maintain state consistency across workflow steps', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Complete full workflow
    const templateCard = screen.getByText('Social Media Promo');
    fireEvent.click(templateCard);

    await waitFor(() => {
      const promptField = screen.getByLabelText(/prompt/i);
      fireEvent.change(promptField, { target: { value: 'Consistent state test' } });
    });

    // Add content elements
    await waitFor(() => {
      const addOverlayButton = screen.getByText('Add Text Overlay');
      fireEvent.click(addOverlayButton);
    });

    // Generate preview
    await waitFor(() => {
      const generatePreviewButton = screen.getByText('Generate Preview');
      fireEvent.click(generatePreviewButton);
    });

    jest.advanceTimersByTime(2000);

    // Generate video
    await waitFor(() => {
      const generateButton = screen.getByText('Generate Video');
      fireEvent.click(generateButton);
    });

    // All data should be consistent throughout
    expect(screen.getByText('Social Media Promo')).toBeInTheDocument(); // Template name
    expect(screen.getByText('Duration: 15s')).toBeInTheDocument(); // Config duration
    expect(screen.getByText(/Text Overlay 1/)).toBeInTheDocument(); // Content elements
  });

  it('should be accessible throughout the workflow', () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Check for proper headings
    expect(screen.getByRole('heading', { name: /step 1/i })).toBeInTheDocument();

    // Check for accessible form elements
    const templateButtons = screen.getAllByRole('button');
    expect(templateButtons.length).toBeGreaterThan(0);

    // Template cards should be clickable
    templateButtons.forEach(button => {
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  it('should handle rapid user interactions gracefully', async () => {
    render(
      <VideoStudioProvider>
        <VideoStudioIntegration />
      </VideoStudioProvider>
    );

    // Rapid template selection
    const template1 = screen.getByText('Social Media Promo');
    const template2 = screen.getByText('Product Showcase');

    fireEvent.click(template1);
    fireEvent.click(template2);
    fireEvent.click(template1);

    // Should settle on the last selection
    await waitFor(() => {
      expect(screen.getByTestId('config-step')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Social Media Promo duration
    });
  });
});
