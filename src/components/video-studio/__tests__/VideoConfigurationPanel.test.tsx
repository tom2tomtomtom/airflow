import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoConfigurationPanel } from '../VideoConfigurationPanel';
import { VideoConfig, VideoTemplate, VideoConstraints } from '../types';

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

// Mock constraints for testing
const mockConstraints: VideoConstraints = {
  min_duration: 5,
  max_duration: 60,
  allowed_aspect_ratios: ['16:9', '9:16', '1:1', '4:5'],
  max_text_overlays: 5,
  supported_resolutions: ['720p', '1080p', '4K'],
};

describe('VideoConfigurationPanel', () => {
  const mockOnConfigChange = jest.fn();

  const defaultConfig: VideoConfig = {
    prompt: '',
    style: 'commercial',
    duration: 15,
    resolution: '1080p',
    aspect_ratio: '16:9',
    platform: '',
  };

  const defaultProps = {
    config: defaultConfig,
    onConfigChange: mockOnConfigChange,
    template: mockTemplate,
    constraints: mockConstraints,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render configuration form with all fields', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    expect(screen.getByLabelText('Video Prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Video Style')).toBeInTheDocument();
    expect(screen.getByLabelText('Platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolution')).toBeInTheDocument();
    expect(screen.getByLabelText('Aspect Ratio')).toBeInTheDocument();
    expect(screen.getByText(/Duration:/)).toBeInTheDocument();
  });

  it('should display current configuration values', () => {
    const configWithValues: VideoConfig = {
      prompt: 'Test video prompt',
      style: 'cinematic',
      duration: 30,
      resolution: '4K',
      aspect_ratio: '9:16',
      platform: 'youtube',
    };

    render(<VideoConfigurationPanel {...defaultProps} config={configWithValues} />);

    expect(screen.getByDisplayValue('Test video prompt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('cinematic')).toBeInTheDocument();
    expect(screen.getByDisplayValue('youtube')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4K')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9:16')).toBeInTheDocument();
    expect(screen.getByText('Duration: 30s')).toBeInTheDocument();
  });

  it('should call onConfigChange when prompt is updated', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const promptField = screen.getByLabelText('Video Prompt');
    fireEvent.change(promptField, { target: { value: 'New prompt text' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ prompt: 'New prompt text' });
  });

  it('should call onConfigChange when style is updated', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const styleSelect = screen.getByLabelText('Video Style');
    fireEvent.mouseDown(styleSelect);

    const cinematicOption = screen.getByText('Cinematic');
    fireEvent.click(cinematicOption);

    expect(mockOnConfigChange).toHaveBeenCalledWith({ style: 'cinematic' });
  });

  it('should update aspect ratio when platform changes', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const platformSelect = screen.getByLabelText('Platform');
    fireEvent.mouseDown(platformSelect);

    const tiktokOption = screen.getByText('TikTok');
    fireEvent.click(tiktokOption);

    expect(mockOnConfigChange).toHaveBeenCalledWith({
      platform: 'tiktok',
      aspect_ratio: '9:16',
    });
  });

  it('should call onConfigChange when resolution is updated', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const resolutionSelect = screen.getByLabelText('Resolution');
    fireEvent.mouseDown(resolutionSelect);

    const hdOption = screen.getByText('720p (HD)');
    fireEvent.click(hdOption);

    expect(mockOnConfigChange).toHaveBeenCalledWith({ resolution: '720p' });
  });

  it('should call onConfigChange when aspect ratio is updated', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const aspectRatioSelect = screen.getByLabelText('Aspect Ratio');
    fireEvent.mouseDown(aspectRatioSelect);

    const squareOption = screen.getByText('1:1 (Square)');
    fireEvent.click(squareOption);

    expect(mockOnConfigChange).toHaveBeenCalledWith({ aspect_ratio: '1:1' });
  });

  it('should call onConfigChange when duration slider is moved', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '25' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ duration: 25 });
  });

  it('should display duration slider with marks', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    expect(screen.getByText('5s')).toBeInTheDocument();
    expect(screen.getByText('15s')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByText('60s')).toBeInTheDocument();
  });

  it('should validate prompt is required', () => {
    const configWithEmptyPrompt = { ...defaultConfig, prompt: '' };

    render(<VideoConfigurationPanel {...defaultProps} config={configWithEmptyPrompt} />);

    const promptField = screen.getByLabelText('Video Prompt');
    expect(promptField).toHaveAttribute('required');
  });

  it('should display validation error for empty prompt', () => {
    const configWithEmptyPrompt = { ...defaultConfig, prompt: '' };

    render(<VideoConfigurationPanel {...defaultProps} config={configWithEmptyPrompt} />);

    const promptField = screen.getByLabelText('Video Prompt');

    // Trigger validation by focusing and then blurring
    fireEvent.focus(promptField);
    fireEvent.blur(promptField);

    expect(screen.getByText('Video prompt is required')).toBeInTheDocument();
  });

  it('should respect duration constraints from template', () => {
    const constrainedTemplate: VideoConstraints = {
      min_duration: 10,
      max_duration: 30,
      allowed_aspect_ratios: ['16:9'],
      max_text_overlays: 3,
      supported_resolutions: ['1080p'],
    };

    render(<VideoConfigurationPanel {...defaultProps} constraints={constrainedTemplate} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '30');
  });

  it('should limit aspect ratio options based on constraints', () => {
    const constrainedOptions: VideoConstraints = {
      min_duration: 5,
      max_duration: 60,
      allowed_aspect_ratios: ['16:9', '9:16'],
      max_text_overlays: 5,
      supported_resolutions: ['720p', '1080p'],
    };

    render(<VideoConfigurationPanel {...defaultProps} constraints={constrainedOptions} />);

    const aspectRatioSelect = screen.getByLabelText('Aspect Ratio');
    fireEvent.mouseDown(aspectRatioSelect);

    expect(screen.getByText('16:9 (Landscape)')).toBeInTheDocument();
    expect(screen.getByText('9:16 (Portrait)')).toBeInTheDocument();
    expect(screen.queryByText('1:1 (Square)')).not.toBeInTheDocument();
    expect(screen.queryByText('4:5 (Instagram)')).not.toBeInTheDocument();
  });

  it('should limit resolution options based on constraints', () => {
    const constrainedResolutions: VideoConstraints = {
      min_duration: 5,
      max_duration: 60,
      allowed_aspect_ratios: ['16:9', '9:16', '1:1', '4:5'],
      max_text_overlays: 5,
      supported_resolutions: ['720p', '1080p'],
    };

    render(<VideoConfigurationPanel {...defaultProps} constraints={constrainedResolutions} />);

    const resolutionSelect = screen.getByLabelText('Resolution');
    fireEvent.mouseDown(resolutionSelect);

    expect(screen.getByText('720p (HD)')).toBeInTheDocument();
    expect(screen.getByText('1080p (Full HD)')).toBeInTheDocument();
    expect(screen.queryByText('4K (Ultra HD)')).not.toBeInTheDocument();
  });

  it('should work without constraints provided', () => {
    render(<VideoConfigurationPanel {...defaultProps} constraints={undefined} />);

    // Should render all default options
    const resolutionSelect = screen.getByLabelText('Resolution');
    fireEvent.mouseDown(resolutionSelect);

    expect(screen.getByText('720p (HD)')).toBeInTheDocument();
    expect(screen.getByText('1080p (Full HD)')).toBeInTheDocument();
    expect(screen.getByText('4K (Ultra HD)')).toBeInTheDocument();
  });

  it('should work without template provided', () => {
    render(<VideoConfigurationPanel {...defaultProps} template={null} />);

    expect(screen.getByLabelText('Video Prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Video Style')).toBeInTheDocument();
  });

  it('should handle platform selection with no automatic aspect ratio change', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const platformSelect = screen.getByLabelText('Platform');
    fireEvent.mouseDown(platformSelect);

    const generalOption = screen.getByText('General');
    fireEvent.click(generalOption);

    expect(mockOnConfigChange).toHaveBeenCalledWith({
      platform: '',
      aspect_ratio: '16:9', // Default fallback
    });
  });

  it('should display help text for video prompt', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    expect(
      screen.getByPlaceholderText(
        'Describe what you want your video to show. Be specific about scenes, actions, and visual elements...'
      )
    ).toBeInTheDocument();
  });

  it('should handle all video style options', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const styleSelect = screen.getByLabelText('Video Style');
    fireEvent.mouseDown(styleSelect);

    expect(screen.getByText('Commercial')).toBeInTheDocument();
    expect(screen.getByText('Cinematic')).toBeInTheDocument();
    expect(screen.getByText('Documentary')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Animation')).toBeInTheDocument();
  });

  it('should handle all platform options', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    const platformSelect = screen.getByLabelText('Platform');
    fireEvent.mouseDown(platformSelect);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('should be accessible with proper labels and structure', () => {
    render(<VideoConfigurationPanel {...defaultProps} />);

    // Check that all form controls have proper labels
    expect(screen.getByLabelText('Video Prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Video Style')).toBeInTheDocument();
    expect(screen.getByLabelText('Platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolution')).toBeInTheDocument();
    expect(screen.getByLabelText('Aspect Ratio')).toBeInTheDocument();

    // Check that required fields are marked
    const promptField = screen.getByLabelText('Video Prompt');
    expect(promptField).toHaveAttribute('required');
  });
});
