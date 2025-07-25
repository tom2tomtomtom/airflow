import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoPreview } from '../useVideoPreview';
import { VideoConfig, ContentElements, VideoTemplate } from '../../types';

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

describe('useVideoPreview', () => {
  const defaultOptions = {
    config: mockConfig,
    elements: mockElements,
    template: mockTemplate,
    autoRefresh: false,
    maxRetries: 2,
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
    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    expect(result.current.previewUrl).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastGenerated).toBeNull();
    expect(result.current.isPreviewStale).toBe(true);
    expect(result.current.canGeneratePreview).toBe(true);
  });

  it('should detect when preview can be generated', () => {
    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    expect(result.current.canGeneratePreview).toBe(true);
  });

  it('should detect when preview cannot be generated (missing prompt)', () => {
    const invalidConfig = {
      ...mockConfig,
      prompt: '',
    };

    const { result } = renderHook(() => 
      useVideoPreview({
        ...defaultOptions,
        config: invalidConfig,
      })
    );

    expect(result.current.canGeneratePreview).toBe(false);
  });

  it('should detect when preview cannot be generated (missing template)', () => {
    const { result } = renderHook(() => 
      useVideoPreview({
        ...defaultOptions,
        template: null,
      })
    );

    expect(result.current.canGeneratePreview).toBe(false);
  });

  it('should generate preview successfully', async () => {
    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    act(() => {
      result.current.generatePreview();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Fast-forward timers to complete the mock API call
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    expect(result.current.previewUrl).toContain('preview-');
    expect(result.current.lastGenerated).toBeInstanceOf(Date);
    expect(result.current.error).toBeNull();
  });

  it('should handle preview generation error', async () => {
    // Mock Math.random to force an error (return > 0.9 to trigger the 10% error case)
    jest.spyOn(Math, 'random').mockReturnValue(0.95);

    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    act(() => {
      result.current.generatePreview();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    expect(result.current.previewUrl).toBeNull();
    expect(result.current.error).toBe('Preview generation failed');

    // Restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should retry on failure up to max retries', async () => {
    // Mock Math.random to always force errors
    jest.spyOn(Math, 'random').mockReturnValue(0.95);

    const { result } = renderHook(() => useVideoPreview({
      ...defaultOptions,
      maxRetries: 2,
    }));

    act(() => {
      result.current.generatePreview();
    });

    // Wait for initial failure
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    expect(result.current.error).toBe('Preview generation failed');

    // Should trigger first retry after 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
    });

    // Complete first retry
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    // Should trigger second retry after 2 seconds
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
    });

    // Complete second retry
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    // Should not retry again (reached max retries)
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Preview generation failed');

    // Restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should clear preview', () => {
    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    // Set some initial state
    act(() => {
      result.current.generatePreview();
    });

    act(() => {
      result.current.clearPreview();
    });

    expect(result.current.previewUrl).toBeNull();
    expect(result.current.lastGenerated).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should retry generation and reset retry count', async () => {
    // Mock Math.random to force initial error then success
    let callCount = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 0.95 : 0.05; // First call fails, second succeeds
    });

    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    // Initial generation (should fail)
    act(() => {
      result.current.generatePreview();
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    expect(result.current.error).toBe('Preview generation failed');

    // Retry generation (should succeed)
    act(() => {
      result.current.retryGeneration();
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    expect(result.current.previewUrl).toContain('preview-');
    expect(result.current.error).toBeNull();

    // Restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should detect stale preview', () => {
    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    // Initially stale (no preview generated)
    expect(result.current.isPreviewStale).toBe(true);
    
    act(() => {
      // Generate a preview to test stale detection
      result.current.generatePreview();
    });

    // Fast forward to complete generation, then mock the timestamp
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // After generation, preview should not be stale (just generated)
    expect(result.current.isPreviewStale).toBe(false);
  });

  it('should prevent generation when missing required config', async () => {
    const invalidConfig = {
      ...mockConfig,
      prompt: '',
    };

    const { result } = renderHook(() => 
      useVideoPreview({
        ...defaultOptions,
        config: invalidConfig,
      })
    );

    act(() => {
      result.current.generatePreview();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Missing required configuration for preview generation');
  });

  it('should prevent multiple simultaneous generations', async () => {
    const { result } = renderHook(() => useVideoPreview(defaultOptions));

    // Start first generation
    act(() => {
      result.current.generatePreview();
    });

    expect(result.current.loading).toBe(true);

    // Try to start second generation (should be ignored)
    act(() => {
      result.current.generatePreview();
    });

    // Should still be loading from first generation only
    expect(result.current.loading).toBe(true);

    // Complete the generation
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    expect(result.current.previewUrl).toContain('preview-');
  });

  it('should clear preview when configuration changes significantly', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useVideoPreview({ ...defaultOptions, config }),
      { initialProps: { config: mockConfig } }
    );

    // Generate initial preview
    act(() => {
      result.current.generatePreview();
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.previewUrl).toContain('preview-');

    // Change config significantly
    const newConfig = {
      ...mockConfig,
      prompt: 'Completely different prompt',
    };

    rerender({ config: newConfig });

    // Preview should be cleared due to config change
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.lastGenerated).toBeNull();
  });

  it('should cleanup resources on unmount', () => {
    const { result, unmount } = renderHook(() => useVideoPreview(defaultOptions));

    // Start generation
    act(() => {
      result.current.generatePreview();
    });

    expect(result.current.loading).toBe(true);

    // Unmount should cleanup without errors
    unmount();

    // Advance timers to ensure no memory leaks
    act(() => {
      jest.advanceTimersByTime(10000);
    });
  });
});