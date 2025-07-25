import { useState, useCallback, useEffect, useRef } from 'react';
import { VideoConfig, ContentElements, VideoTemplate } from '../types';

/**
 * Custom hook for managing video preview generation and caching
 * Extracted from VideoStudioPage to improve modularity and testability
 */
export interface UseVideoPreviewReturn {
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  lastGenerated: Date | null;

  // Actions
  generatePreview: () => Promise<void>;
  clearPreview: () => void;
  retryGeneration: () => Promise<void>;

  // Status checks
  isPreviewStale: boolean;
  canGeneratePreview: boolean;
}

export interface UseVideoPreviewOptions {
  config: VideoConfig;
  elements: ContentElements;
  template: VideoTemplate | null;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
  maxRetries?: number;
}

const PREVIEW_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const DEFAULT_REFRESH_INTERVAL = 5; // 5 minutes
const DEFAULT_MAX_RETRIES = 3;

export const useVideoPreview = ({
  config,
  elements,
  template,
  autoRefresh = false,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  maxRetries = DEFAULT_MAX_RETRIES,
}: UseVideoPreviewOptions): UseVideoPreviewReturn => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current preview is stale
  const isPreviewStale = useCallback((): boolean => {
    if (!lastGenerated) return true;
    const now = new Date();
    const timeDiff = now.getTime() - lastGenerated.getTime();
    return timeDiff > PREVIEW_CACHE_DURATION;
  }, [lastGenerated]);

  // Check if we can generate a preview (has required config)
  const canGeneratePreview = useCallback((): boolean => {
    return !!(config.prompt?.trim() && config.duration > 0 && config.style?.trim() && template?.id);
  }, [config, template]);

  // Generate a hash of current configuration for cache invalidation
  const getConfigHash = useCallback((): string => {
    const configString = JSON.stringify({
      prompt: config.prompt,
      style: config.style,
      duration: config.duration,
      resolution: config.resolution,
      platform: config.platform,
      aspect_ratio: config.aspect_ratio,
      template_id: template?.id,
      text_overlays: elements.text_overlays,
      background_music: elements.background_music,
      voice_over: elements.voice_over,
      brand_elements: elements.brand_elements,
    });

    // Simple hash function for cache invalidation
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }, [config, elements, template]);

  // Mock API call for preview generation
  const mockGeneratePreview = useCallback(async (signal?: AbortSignal): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          if (signal?.aborted) {
            reject(new Error('Preview generation aborted'));
            return;
          }

          // Simulate API response
          if (Math.random() > 0.1) {
            // 90% success rate
            const mockUrl = `https://example.com/preview-${Date.now()}.mp4`;
            resolve(mockUrl);
          } else {
            reject(new Error('Preview generation failed'));
          }
        },
        2000 + Math.random() * 3000
      ); // 2-5 second delay

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Preview generation aborted'));
        });
      }
    });
  }, []);

  // Generate preview
  const generatePreview = useCallback(async (): Promise<void> => {
    if (!canGeneratePreview()) {
      setError('Missing required configuration for preview generation');
      return;
    }

    if (loading) {
      return; // Already generating
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const url = await mockGeneratePreview(abortControllerRef.current.signal);

      setPreviewUrl(url);
      setLastGenerated(new Date());
      setRetryCount(0);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('aborted')) {
          // Don't set error for aborted requests
          return;
        }

        setError(err.message);

        // Auto-retry on failure (up to max retries)
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount) * 1000;
          timeoutRef.current = setTimeout(() => {
            generatePreview();
          }, delay);
        }
      } else {
        setError('Unknown error occurred during preview generation');
      }
    } finally {
      setLoading(false);
    }
  }, [canGeneratePreview, loading, mockGeneratePreview, retryCount, maxRetries]);

  // Clear preview
  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
    setLastGenerated(null);
    setError(null);
    setRetryCount(0);

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any retry timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Retry generation (resets retry count)
  const retryGeneration = useCallback(async (): Promise<void> => {
    setRetryCount(0);
    setError(null);
    await generatePreview();
  }, [generatePreview]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(
      () => {
        if (isPreviewStale() && canGeneratePreview() && !loading) {
          generatePreview();
        }
      },
      refreshInterval * 60 * 1000
    ); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isPreviewStale, canGeneratePreview, loading, generatePreview]);

  // Track previous config hash for cache invalidation
  const prevHashRef = useRef<string | null>(null);

  // Configuration change effect - clear preview when config changes significantly
  useEffect(() => {
    const configHash = getConfigHash();

    if (prevHashRef.current && prevHashRef.current !== configHash) {
      // Configuration changed significantly, clear preview
      clearPreview();
    }

    prevHashRef.current = configHash;
  }, [getConfigHash, clearPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    loading,
    error,
    lastGenerated,

    // Actions
    generatePreview,
    clearPreview,
    retryGeneration,

    // Status checks
    isPreviewStale: isPreviewStale(),
    canGeneratePreview: canGeneratePreview(),
  };
};
