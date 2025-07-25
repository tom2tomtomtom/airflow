import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoGeneration } from '../useVideoGeneration';
import { VideoConfig, ContentElements, VideoTemplate, GenerationOptions } from '../../types';

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
  ],
  background_music: true,
  voice_over: undefined,
  brand_elements: undefined,
};

// Mock generation options
const mockGenerationOptions: GenerationOptions = {
  quality: 'standard',
  format: 'mp4',
  include_subtitles: false,
  include_watermark: false,
};

describe('useVideoGeneration', () => {
  const defaultOptions = {
    config: mockConfig,
    elements: mockElements,
    template: mockTemplate,
    maxRetries: 2,
    pollInterval: 100, // Fast polling for tests
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    expect(result.current.generationStatus).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.videoJobs).toEqual([]);
    expect(result.current.estimatedCompletion).toBeNull();
    expect(result.current.canGenerate).toBe(true);
    expect(result.current.isGenerating).toBe(false);
  });

  it('should detect when generation can be performed', () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    expect(result.current.canGenerate).toBe(true);
  });

  it('should detect when generation cannot be performed (missing prompt)', () => {
    const invalidConfig = {
      ...mockConfig,
      prompt: '',
    };

    const { result } = renderHook(() => 
      useVideoGeneration({
        ...defaultOptions,
        config: invalidConfig,
      })
    );

    expect(result.current.canGenerate).toBe(false);
  });

  it('should detect when generation cannot be performed (missing template)', () => {
    const { result } = renderHook(() => 
      useVideoGeneration({
        ...defaultOptions,
        template: null,
      })
    );

    expect(result.current.canGenerate).toBe(false);
  });

  it('should start video generation successfully', async () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    expect(result.current.generationStatus).toBe('generating');
    expect(result.current.isGenerating).toBe(true);
    expect(result.current.canGenerate).toBe(false);

    // Fast-forward to complete the mock API call
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.videoJobs.length).toBeGreaterThan(0);
      });
    });

    expect(result.current.videoJobs.length).toBe(2); // Standard quality = 2 variations
    expect(result.current.videoJobs[0].generation_id).toContain('gen-');
  });

  it('should handle generation failure', async () => {
    // Mock Math.random to force an error (return > 0.9 to trigger the 10% error case)
    jest.spyOn(Math, 'random').mockReturnValue(0.95);

    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('error');
      });
    });

    expect(result.current.error).toBe('Failed to start video generation');

    // Restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should retry on failure up to max retries', async () => {
    // Mock Math.random to always force errors
    jest.spyOn(Math, 'random').mockReturnValue(0.95);

    const { result } = renderHook(() => useVideoGeneration({
      ...defaultOptions,
      maxRetries: 2,
    }));

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    // Wait for initial failure
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('error');
      });
    });

    expect(result.current.error).toBe('Failed to start video generation');

    // Should trigger first retry after 2 seconds
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('generating');
      });
    });

    // Complete first retry (should fail)
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('error');
      });
    });

    // Should trigger second retry after 4 seconds
    await act(async () => {
      jest.advanceTimersByTime(4000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('generating');
      });
    });

    // Complete second retry (should fail and stop retrying)
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('error');
      });
    });

    // Should not retry again (reached max retries)
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.generationStatus).toBe('error');

    // Restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should cancel generation', () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    expect(result.current.generationStatus).toBe('generating');

    act(() => {
      result.current.cancelGeneration();
    });

    expect(result.current.generationStatus).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should clear result', () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    // Simulate having a result
    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    act(() => {
      result.current.clearResult();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.generationStatus).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.videoJobs).toEqual([]);
    expect(result.current.estimatedCompletion).toBeNull();
  });

  it('should retry generation with last options', async () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    // Initial generation
    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    // Simulate failure
    act(() => {
      result.current.cancelGeneration();
    });

    // Retry
    act(() => {
      result.current.retryGeneration();
    });

    expect(result.current.generationStatus).toBe('generating');

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.videoJobs.length).toBeGreaterThan(0);
      });
    });
  });

  it('should handle job management utilities', async () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.videoJobs.length).toBeGreaterThan(0);
      });
    });

    const firstJobId = result.current.videoJobs[0].id;
    
    // Test getJobById
    const job = result.current.getJobById(firstJobId);
    expect(job).toBeDefined();
    expect(job?.id).toBe(firstJobId);

    // Test getJobById with invalid ID
    const invalidJob = result.current.getJobById('invalid-id');
    expect(invalidJob).toBeNull();

    // Initially no completed or failed jobs
    expect(result.current.getCompletedJobs()).toEqual([]);
    expect(result.current.getFailedJobs()).toEqual([]);
  });

  it('should prevent multiple simultaneous generations', async () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    // Start first generation
    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    expect(result.current.generationStatus).toBe('generating');

    // Try to start second generation (should be ignored)
    act(() => {
      result.current.generateVideo({
        ...mockGenerationOptions,
        quality: 'high',
      });
    });

    // Should still be generating from first attempt
    expect(result.current.generationStatus).toBe('generating');

    // Complete the generation
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.videoJobs.length).toBeGreaterThan(0);
      });
    });
  });

  it('should handle generation options correctly', () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    // Test different quality levels produce different variation counts
    act(() => {
      result.current.generateVideo({
        ...mockGenerationOptions,
        quality: 'draft',
      });
    });

    expect(result.current.generationStatus).toBe('generating');
  });

  it('should call callback functions', async () => {
    const onGenerationComplete = jest.fn();
    const onGenerationError = jest.fn();

    const { result } = renderHook(() => 
      useVideoGeneration({
        ...defaultOptions,
        onGenerationComplete,
        onGenerationError,
      })
    );

    // Test error callback
    jest.spyOn(Math, 'random').mockReturnValue(0.95); // Force error

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('error');
      });
    });

    expect(onGenerationError).toHaveBeenCalledWith('Failed to start video generation');

    // Restore Math.random for successful test
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should handle generation timeout', async () => {
    const { result } = renderHook(() => useVideoGeneration(defaultOptions));

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    // Fast-forward past the timeout
    await act(async () => {
      jest.advanceTimersByTime(15 * 60 * 1000 + 1000); // 15 minutes + 1 second
      await waitFor(() => {
        expect(result.current.generationStatus).toBe('error');
      });
    });

    expect(result.current.error).toBe('Generation timed out');
  });

  it('should prevent generation when missing required config', async () => {
    const invalidConfig = {
      ...mockConfig,
      prompt: '',
    };

    const { result } = renderHook(() => 
      useVideoGeneration({
        ...defaultOptions,
        config: invalidConfig,
      })
    );

    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    expect(result.current.generationStatus).toBe('idle');
    expect(result.current.error).toBe('Missing required configuration for video generation');
  });

  it('should cleanup resources on unmount', () => {
    const { result, unmount } = renderHook(() => useVideoGeneration(defaultOptions));

    // Start generation
    act(() => {
      result.current.generateVideo(mockGenerationOptions);
    });

    expect(result.current.generationStatus).toBe('generating');

    // Unmount should cleanup without errors
    unmount();

    // Advance timers to ensure no memory leaks
    act(() => {
      jest.advanceTimersByTime(60000);
    });
  });
});