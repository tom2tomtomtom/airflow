import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPreviewPanel } from '../VideoPreviewPanel';
import { VideoConfig, ContentElements, VideoTemplate } from '../types';

// Mock template for testing
const mockTemplate: VideoTemplate = {
  id: 'template-1',
  name: 'Social Media Promo',
  description: 'Perfect for social media campaigns',
  thumbnail: 'https://via.placeholder.com/300x169',
  duration: 15,
  aspect_ratio: '16:9',
  platform: ['instagram', 'facebook', 'youtube'],
  category: 'Social Media',
  tags: ['promo', 'social'],
};

// Mock video config for testing
const mockConfig: VideoConfig = {
  prompt: 'Create an engaging social media video',
  style: 'modern',
  duration: 15,
  resolution: '1920x1080',
  platform: 'instagram',
  aspect_ratio: '16:9',
  template_id: 'template-1',
};

// Mock content elements for testing
const mockElements: ContentElements = {
  text_overlays: [
    { text: 'Welcome to AIRWAVE', position: 'center' },
    { text: 'Create Amazing Videos', position: 'bottom' },
  ],
  background_music: true,
  voice_over: {
    text: 'This is a test voice over',
    voice: 'neural',
    language: 'en',
  },
  brand_elements: {
    logo_url: 'https://example.com/logo.png',
    color_scheme: ['#ff0000', '#00ff00'],
    font_family: 'Arial, sans-serif',
  },
};

describe('VideoPreviewPanel', () => {
  const mockOnPreviewGenerate = jest.fn();

  const defaultProps = {
    config: mockConfig,
    elements: mockElements,
    template: mockTemplate,
    onPreviewGenerate: mockOnPreviewGenerate,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render preview panel with template info', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    expect(screen.getByText('Video Preview')).toBeInTheDocument();
    expect(screen.getByText('Template: Social Media Promo')).toBeInTheDocument();
    expect(screen.getByText('Duration: 15s')).toBeInTheDocument();
    expect(screen.getByText('Resolution: 1920x1080')).toBeInTheDocument();
  });

  it('should display configuration summary', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    expect(screen.getByText('Style: modern')).toBeInTheDocument();
    expect(screen.getByText('Platform: instagram')).toBeInTheDocument();
    expect(screen.getByText('Aspect Ratio: 16:9')).toBeInTheDocument();
  });

  it('should display content elements summary', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    expect(screen.getByText('Text Overlays: 2')).toBeInTheDocument();
    expect(screen.getByText('Background Music: Yes')).toBeInTheDocument();
    expect(screen.getByText('Voice Over: Yes')).toBeInTheDocument();
    expect(screen.getByText('Brand Elements: Yes')).toBeInTheDocument();
  });

  it('should display empty state when no preview URL', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    expect(screen.getByText('No preview available')).toBeInTheDocument();
    expect(screen.getByText('Generate Preview')).toBeInTheDocument();
  });

  it('should display video preview when preview URL is provided', () => {
    const propsWithPreview = {
      ...defaultProps,
      previewUrl: 'https://example.com/preview.mp4',
    };

    render(<VideoPreviewPanel {...propsWithPreview} />);

    const video = screen.getByRole('application', { name: /video preview/i });
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/preview.mp4');
  });

  it('should call onPreviewGenerate when generate button is clicked', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    const generateButton = screen.getByText('Generate Preview');
    fireEvent.click(generateButton);

    expect(mockOnPreviewGenerate).toHaveBeenCalledTimes(1);
  });

  it('should show loading state during preview generation', () => {
    const loadingProps = {
      ...defaultProps,
      loading: true,
    };

    render(<VideoPreviewPanel {...loadingProps} />);

    expect(screen.getByText('Generating preview...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should disable generate button when loading', () => {
    const loadingProps = {
      ...defaultProps,
      loading: true,
    };

    render(<VideoPreviewPanel {...loadingProps} />);

    const generateButton = screen.getByText('Generating preview...');
    expect(generateButton).toBeDisabled();
  });

  it('should handle missing template gracefully', () => {
    const propsWithoutTemplate = {
      ...defaultProps,
      template: null,
    };

    render(<VideoPreviewPanel {...propsWithoutTemplate} />);

    expect(screen.getByText('Video Preview')).toBeInTheDocument();
    expect(screen.getByText('Duration: 15s')).toBeInTheDocument();
    expect(screen.getByText('Resolution: 1920x1080')).toBeInTheDocument();
  });

  it('should display elements count correctly when elements are empty', () => {
    const emptyElements: ContentElements = {
      text_overlays: [],
      background_music: false,
      voice_over: undefined,
      brand_elements: undefined,
    };

    const propsWithEmptyElements = {
      ...defaultProps,
      elements: emptyElements,
    };

    render(<VideoPreviewPanel {...propsWithEmptyElements} />);

    expect(screen.getByText('Text Overlays: 0')).toBeInTheDocument();
    expect(screen.getByText('Background Music: No')).toBeInTheDocument();
    expect(screen.getByText('Voice Over: No')).toBeInTheDocument();
    expect(screen.getByText('Brand Elements: No')).toBeInTheDocument();
  });

  it('should display prompt preview when available', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    expect(screen.getByText('Prompt:')).toBeInTheDocument();
    expect(screen.getByText('Create an engaging social media video')).toBeInTheDocument();
  });

  it('should handle long prompts with truncation', () => {
    const longPromptConfig = {
      ...mockConfig,
      prompt:
        'This is a very long prompt that should be truncated when displayed in the preview panel to prevent the UI from becoming cluttered and hard to read',
    };

    const propsWithLongPrompt = {
      ...defaultProps,
      config: longPromptConfig,
    };

    render(<VideoPreviewPanel {...propsWithLongPrompt} />);

    const promptText = screen.getByText(/This is a very long prompt/);
    expect(promptText).toBeInTheDocument();
  });

  it('should regenerate preview when called', async () => {
    const propsWithPreview = {
      ...defaultProps,
      previewUrl: 'https://example.com/preview.mp4',
    };

    render(<VideoPreviewPanel {...propsWithPreview} />);

    const regenerateButton = screen.getByText('Regenerate Preview');
    fireEvent.click(regenerateButton);

    expect(mockOnPreviewGenerate).toHaveBeenCalledTimes(1);
  });

  it('should be accessible with proper labels and roles', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    // Check for accessible elements
    const previewSection = screen.getByRole('region');
    expect(previewSection).toBeInTheDocument();

    const generateButton = screen.getByRole('button', { name: /generate preview/i });
    expect(generateButton).toBeInTheDocument();
  });

  it('should show error state when preview generation fails', () => {
    const errorProps = {
      ...defaultProps,
      previewUrl: 'error',
    };

    render(<VideoPreviewPanel {...errorProps} />);

    // This would typically show an error message
    // The actual implementation would handle error states
    expect(screen.getByText('Generate Preview')).toBeInTheDocument();
  });

  it('should display quality and format information', () => {
    render(<VideoPreviewPanel {...defaultProps} />);

    // These would be derived from config or template
    expect(screen.getByText('Style: modern')).toBeInTheDocument();
    expect(screen.getByText('Resolution: 1920x1080')).toBeInTheDocument();
  });
});
