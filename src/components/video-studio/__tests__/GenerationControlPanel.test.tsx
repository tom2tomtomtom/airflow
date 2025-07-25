import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenerationControlPanel } from '../GenerationControlPanel';
import { GenerationStatus, VideoJob, ExportPlatform } from '../types';

// Mock export platforms for testing
const mockExportPlatforms: ExportPlatform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    aspect_ratio: '16:9',
    max_duration: 3600,
    recommended_resolution: '1920x1080',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    aspect_ratio: '1:1',
    max_duration: 60,
    recommended_resolution: '1080x1080',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    aspect_ratio: '9:16',
    max_duration: 180,
    recommended_resolution: '1080x1920',
  },
];

// Mock video jobs for testing
const mockVideoJobs: VideoJob[] = [
  {
    id: 'job-1',
    generation_id: 'gen-1',
    variation_index: 0,
    status: 'completed',
    progress: 100,
    render_job_id: 'render-1',
    estimated_completion: '2025-07-25T15:30:00Z',
    output_url: 'https://example.com/video1.mp4',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    created_at: '2025-07-25T15:00:00Z',
  },
  {
    id: 'job-2',
    generation_id: 'gen-1',
    variation_index: 1,
    status: 'processing',
    progress: 75,
    render_job_id: 'render-2',
    estimated_completion: '2025-07-25T15:35:00Z',
    created_at: '2025-07-25T15:00:00Z',
  },
  {
    id: 'job-3',
    generation_id: 'gen-1',
    variation_index: 2,
    status: 'failed',
    progress: 0,
    error_message: 'Rendering failed due to invalid template',
    created_at: '2025-07-25T15:00:00Z',
  },
];

describe('GenerationControlPanel', () => {
  const mockOnGenerate = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnExport = jest.fn();

  const defaultProps = {
    onGenerate: mockOnGenerate,
    generationStatus: 'idle' as GenerationStatus,
    progress: 0,
    onDownload: mockOnDownload,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render generation controls in idle state', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    expect(screen.getByText('Generate Video')).toBeInTheDocument();
    expect(screen.getByText('Quality Settings')).toBeInTheDocument();
    expect(screen.getByText('Output Format')).toBeInTheDocument();
  });

  it('should display quality options', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should display format options', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    expect(screen.getByText('MP4')).toBeInTheDocument();
    expect(screen.getByText('MOV')).toBeInTheDocument();
    expect(screen.getByText('WEBM')).toBeInTheDocument();
  });

  it('should display generation options toggles', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    expect(screen.getByText('Include Subtitles')).toBeInTheDocument();
    expect(screen.getByText('Include Watermark')).toBeInTheDocument();
  });

  it('should call onGenerate with correct options when generate button is clicked', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    // Select high quality
    const highQualityOption = screen.getByText('High');
    fireEvent.click(highQualityOption);

    // Select MOV format
    const movFormatOption = screen.getByText('MOV');
    fireEvent.click(movFormatOption);

    // Toggle subtitles
    const subtitlesToggle = screen.getByRole('checkbox', { name: /include subtitles/i });
    fireEvent.click(subtitlesToggle);

    // Click generate
    const generateButton = screen.getByText('Generate Video');
    fireEvent.click(generateButton);

    expect(mockOnGenerate).toHaveBeenCalledWith({
      quality: 'high',
      format: 'mov',
      include_subtitles: true,
      include_watermark: false,
    });
  });

  it('should disable generate button during generation', () => {
    const propsWithGenerating = {
      ...defaultProps,
      generationStatus: 'generating' as GenerationStatus,
      progress: 50,
    };

    render(<GenerationControlPanel {...propsWithGenerating} />);

    const generateButton = screen.getByText('Generating...');
    expect(generateButton).toBeDisabled();
  });

  it('should show progress bar during generation', () => {
    const propsWithProgress = {
      ...defaultProps,
      generationStatus: 'generating' as GenerationStatus,
      progress: 75,
    };

    render(<GenerationControlPanel {...propsWithProgress} />);

    expect(screen.getByText('Generating: 75%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show completed state with download button', () => {
    const propsWithCompleted = {
      ...defaultProps,
      generationStatus: 'completed' as GenerationStatus,
      progress: 100,
      resultUrl: 'https://example.com/video.mp4',
    };

    render(<GenerationControlPanel {...propsWithCompleted} />);

    expect(screen.getByText('Generation Complete!')).toBeInTheDocument();
    expect(screen.getByText('Download Video')).toBeInTheDocument();
    expect(screen.getByText('Export to Platforms')).toBeInTheDocument();
  });

  it('should call onDownload when download button is clicked', () => {
    const propsWithCompleted = {
      ...defaultProps,
      generationStatus: 'completed' as GenerationStatus,
      progress: 100,
      resultUrl: 'https://example.com/video.mp4',
    };

    render(<GenerationControlPanel {...propsWithCompleted} />);

    const downloadButton = screen.getByText('Download Video');
    fireEvent.click(downloadButton);

    expect(mockOnDownload).toHaveBeenCalledTimes(1);
  });

  it('should show error state', () => {
    const propsWithError = {
      ...defaultProps,
      generationStatus: 'error' as GenerationStatus,
      progress: 0,
    };

    render(<GenerationControlPanel {...propsWithError} />);

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should allow retry after error', () => {
    const propsWithError = {
      ...defaultProps,
      generationStatus: 'error' as GenerationStatus,
      progress: 0,
    };

    render(<GenerationControlPanel {...propsWithError} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should call onGenerate with default options for retry
    expect(mockOnGenerate).toHaveBeenCalledWith({
      quality: 'standard',
      format: 'mp4',
      include_subtitles: false,
      include_watermark: false,
    });
  });

  it('should display video jobs when provided', () => {
    const propsWithJobs = {
      ...defaultProps,
      videoJobs: mockVideoJobs,
    };

    render(<GenerationControlPanel {...propsWithJobs} />);

    expect(screen.getByText('Generation History')).toBeInTheDocument();
    expect(screen.getByText('Variation 1')).toBeInTheDocument();
    expect(screen.getByText('Variation 2')).toBeInTheDocument();
    expect(screen.getByText('Variation 3')).toBeInTheDocument();
  });

  it('should show different statuses for video jobs', () => {
    const propsWithJobs = {
      ...defaultProps,
      videoJobs: mockVideoJobs,
    };

    render(<GenerationControlPanel {...propsWithJobs} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Processing (75%)')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should show download buttons for completed jobs', () => {
    const propsWithJobs = {
      ...defaultProps,
      videoJobs: mockVideoJobs,
    };

    render(<GenerationControlPanel {...propsWithJobs} />);

    // Should have download buttons for completed jobs
    const downloadButtons = screen.getAllByText('Download');
    expect(downloadButtons).toHaveLength(1); // Only one completed job
  });

  it('should show error messages for failed jobs', () => {
    const propsWithJobs = {
      ...defaultProps,
      videoJobs: mockVideoJobs,
    };

    render(<GenerationControlPanel {...propsWithJobs} />);

    expect(screen.getByText('Rendering failed due to invalid template')).toBeInTheDocument();
  });

  it('should open export dialog when export button is clicked', async () => {
    const propsWithCompleted = {
      ...defaultProps,
      generationStatus: 'completed' as GenerationStatus,
      progress: 100,
      resultUrl: 'https://example.com/video.mp4',
    };

    render(<GenerationControlPanel {...propsWithCompleted} />);

    const exportButton = screen.getByText('Export to Platforms');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Export to Platforms')).toBeInTheDocument();
    });

    // Should show platform options
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('should handle platform selection in export dialog', async () => {
    const propsWithCompleted = {
      ...defaultProps,
      generationStatus: 'completed' as GenerationStatus,
      progress: 100,
      resultUrl: 'https://example.com/video.mp4',
    };

    render(<GenerationControlPanel {...propsWithCompleted} />);

    // Open export dialog
    const exportButton = screen.getByText('Export to Platforms');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Export to Platforms')).toBeInTheDocument();
    });

    // Select YouTube and Instagram
    const youtubeCheckbox = screen.getByRole('checkbox', { name: /youtube/i });
    const instagramCheckbox = screen.getByRole('checkbox', { name: /instagram/i });

    fireEvent.click(youtubeCheckbox);
    fireEvent.click(instagramCheckbox);

    // Confirm export
    const confirmButton = screen.getByText('Export Selected');
    fireEvent.click(confirmButton);

    expect(mockOnExport).toHaveBeenCalledWith([
      mockExportPlatforms[0], // YouTube
      mockExportPlatforms[1], // Instagram
    ]);
  });

  it('should show estimated completion time during generation', () => {
    const propsWithEstimate = {
      ...defaultProps,
      generationStatus: 'generating' as GenerationStatus,
      progress: 30,
    };

    render(<GenerationControlPanel {...propsWithEstimate} />);

    expect(screen.getByText(/estimated completion/i)).toBeInTheDocument();
  });

  it('should be accessible with proper labels and roles', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    // Check for accessible elements
    const generateButton = screen.getByRole('button', { name: /generate video/i });
    expect(generateButton).toBeInTheDocument();

    // Check quality radio group
    const qualityGroup = screen.getByRole('radiogroup');
    expect(qualityGroup).toBeInTheDocument();

    // Check checkboxes for options
    const subtitlesCheckbox = screen.getByRole('checkbox', { name: /include subtitles/i });
    const watermarkCheckbox = screen.getByRole('checkbox', { name: /include watermark/i });
    expect(subtitlesCheckbox).toBeInTheDocument();
    expect(watermarkCheckbox).toBeInTheDocument();
  });

  it('should handle generation options state correctly', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    // Initially should have default options
    const standardQuality = screen.getByRole('radio', { name: /standard/i });
    expect(standardQuality).toBeChecked();

    // Change to draft quality
    const draftQuality = screen.getByRole('radio', { name: /draft/i });
    fireEvent.click(draftQuality);
    expect(draftQuality).toBeChecked();

    // Toggle watermark
    const watermarkToggle = screen.getByRole('checkbox', { name: /include watermark/i });
    fireEvent.click(watermarkToggle);
    expect(watermarkToggle).toBeChecked();
  });

  it('should show generation duration estimate', () => {
    render(<GenerationControlPanel {...defaultProps} />);

    // Should show estimated time for different quality levels
    expect(screen.getByText(/estimated time/i)).toBeInTheDocument();
  });

  it('should disable export when no result URL', () => {
    const propsWithoutResult = {
      ...defaultProps,
      generationStatus: 'completed' as GenerationStatus,
      progress: 100,
      // No resultUrl provided
    };

    render(<GenerationControlPanel {...propsWithoutResult} />);

    const exportButton = screen.getByText('Export to Platforms');
    expect(exportButton).toBeDisabled();
  });
});
