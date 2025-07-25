import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GenerationOptions,
  GenerationStatus,
  GenerationResult,
  VideoJob,
  VideoConfig,
  ContentElements,
  VideoTemplate,
} from '../types';

/**
 * Custom hook for managing video generation workflow and progress tracking
 * Extracted from VideoStudioPage to improve modularity and testability
 */
export interface UseVideoGenerationReturn {
  // Status and progress
  generationStatus: GenerationStatus;
  progress: number;
  result: GenerationResult | null;
  error: string | null;
  videoJobs: VideoJob[];
  estimatedCompletion: Date | null;

  // Actions
  generateVideo: (options: GenerationOptions) => Promise<void>;
  retryGeneration: () => Promise<void>;
  cancelGeneration: () => void;
  clearResult: () => void;
  downloadVideo: () => void;

  // Job management
  getJobById: (jobId: string) => VideoJob | null;
  getCompletedJobs: () => VideoJob[];
  getFailedJobs: () => VideoJob[];

  // Generation validation
  canGenerate: boolean;
  isGenerating: boolean;
}

export interface UseVideoGenerationOptions {
  config: VideoConfig;
  elements: ContentElements;
  template: VideoTemplate | null;
  maxRetries?: number;
  pollInterval?: number; // milliseconds
  onGenerationComplete?: (result: GenerationResult) => void;
  onGenerationError?: (error: string) => void;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_POLL_INTERVAL = 2000; // 2 seconds
const GENERATION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const useVideoGeneration = ({
  config,
  elements,
  template,
  maxRetries = DEFAULT_MAX_RETRIES,
  pollInterval = DEFAULT_POLL_INTERVAL,
  onGenerationComplete,
  onGenerationError,
}: UseVideoGenerationOptions): UseVideoGenerationReturn => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);
  const [lastGenerationOptions, setLastGenerationOptions] = useState<GenerationOptions | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentGenerationIdRef = useRef<string | null>(null);

  // Check if we can generate a video
  const canGenerate = useCallback((): boolean => {
    return !!(
      config.prompt?.trim() &&
      config.duration > 0 &&
      config.style?.trim() &&
      template?.id &&
      generationStatus !== 'generating'
    );
  }, [config, template, generationStatus]);

  const isGenerating = generationStatus === 'generating';

  // Mock API call for video generation
  const mockStartGeneration = useCallback(
    async (
      options: GenerationOptions,
      signal?: AbortSignal
    ): Promise<{ generationId: string; jobs: VideoJob[] }> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => {
            if (signal?.aborted) {
              reject(new Error('Generation cancelled'));
              return;
            }

            // Simulate generation failure (10% chance)
            if (Math.random() > 0.9) {
              reject(new Error('Failed to start video generation'));
              return;
            }

            const generationId = `gen-${Date.now()}`;
            const variationsCount = Math.min(
              options.quality === 'high' ? 3 : options.quality === 'standard' ? 2 : 1,
              5
            );

            const jobs: VideoJob[] = Array.from({ length: variationsCount }, (_, index) => ({
              id: `job-${generationId}-${index}`,
              generation_id: generationId,
              variation_index: index,
              status: 'pending',
              progress: 0,
              render_job_id: `render-${Date.now()}-${index}`,
              created_at: new Date().toISOString(),
            }));

            resolve({ generationId, jobs });
          },
          1000 + Math.random() * 2000
        ); // 1-3 second delay

        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Generation cancelled'));
          });
        }
      });
    },
    []
  );

  // Mock API call for checking generation status
  const mockCheckGenerationStatus = useCallback(
    async (generationId: string, signal?: AbortSignal): Promise<VideoJob[]> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (signal?.aborted) {
            reject(new Error('Status check cancelled'));
            return;
          }

          // Simulate updated job statuses
          setVideoJobs(prevJobs => {
            return prevJobs.map(job => {
              if (job.generation_id !== generationId) return job;

              // Simulate progress
              let newProgress = job.progress + Math.random() * 15 + 5; // 5-20% increment
              let newStatus = job.status;

              if (newProgress >= 100) {
                newProgress = 100;
                // 95% success rate for completed jobs
                newStatus = Math.random() > 0.05 ? 'completed' : 'failed';
              } else if (job.status === 'pending' && newProgress > 10) {
                newStatus = 'processing';
              }

              const updatedJob: VideoJob = {
                ...job,
                status: newStatus,
                progress: newProgress,
                ...(newStatus === 'completed' && {
                  output_url: `https://example.com/video-${job.id}.mp4`,
                  thumbnail_url: `https://example.com/thumb-${job.id}.jpg`,
                }),
                ...(newStatus === 'failed' && {
                  error_message: 'Video generation failed due to processing error',
                }),
                ...(newStatus === 'processing' && {
                  estimated_completion: new Date(
                    Date.now() + (100 - newProgress) * 60000
                  ).toISOString(),
                }),
              };

              return updatedJob;
            });
          });

          resolve(videoJobs);
        }, 500); // 0.5 second delay

        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Status check cancelled'));
          });
        }
      });
    },
    [videoJobs]
  );

  // Calculate overall progress from jobs
  const calculateOverallProgress = useCallback((jobs: VideoJob[]): number => {
    if (jobs.length === 0) return 0;
    const totalProgress = jobs.reduce((sum, job) => sum + job.progress, 0);
    return Math.round(totalProgress / jobs.length);
  }, []);

  // Update estimated completion time
  const updateEstimatedCompletion = useCallback((jobs: VideoJob[]) => {
    const processingJobs = jobs.filter(
      job => job.status === 'processing' && job.estimated_completion
    );
    if (processingJobs.length > 0) {
      // Use the latest estimated completion time
      const latestEstimate = processingJobs
        .map(job => new Date(job.estimated_completion!))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      setEstimatedCompletion(latestEstimate);
    } else {
      setEstimatedCompletion(null);
    }
  }, []);

  // Check if generation is complete
  const checkGenerationComplete = useCallback((jobs: VideoJob[]): boolean => {
    return (
      jobs.length > 0 && jobs.every(job => job.status === 'completed' || job.status === 'failed')
    );
  }, []);

  // Check if generation has any successful results
  const hasSuccessfulResults = useCallback((jobs: VideoJob[]): boolean => {
    return jobs.some(job => job.status === 'completed' && job.output_url);
  }, []);

  // Poll generation status
  const pollGenerationStatus = useCallback(
    async (generationId: string) => {
      if (!abortControllerRef.current) return;

      try {
        await mockCheckGenerationStatus(generationId, abortControllerRef.current.signal);

        // Update progress based on current jobs
        const currentProgress = calculateOverallProgress(videoJobs);
        setProgress(currentProgress);

        // Update estimated completion
        updateEstimatedCompletion(videoJobs);

        // Check if generation is complete
        if (checkGenerationComplete(videoJobs)) {
          if (hasSuccessfulResults(videoJobs)) {
            // Find the first successful job for the main result
            const successfulJob = videoJobs.find(
              job => job.status === 'completed' && job.output_url
            );
            if (successfulJob) {
              const generationResult: GenerationResult = {
                id: successfulJob.id,
                url: successfulJob.output_url!,
                thumbnail: successfulJob.thumbnail_url,
                duration: config.duration,
                format: lastGenerationOptions?.format || 'mp4',
                size: Math.round(config.duration * 1024 * 1024 * 0.5), // Estimate 0.5MB per second
              };

              setResult(generationResult);
              setGenerationStatus('completed');
              setProgress(100);

              if (onGenerationComplete) {
                onGenerationComplete(generationResult);
              }
            }
          } else {
            // All jobs failed
            setGenerationStatus('error');
            setError('All video generation attempts failed');

            if (onGenerationError) {
              onGenerationError('All video generation attempts failed');
            }
          }

          // Clear polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else {
          // Continue polling
          pollIntervalRef.current = setTimeout(() => {
            pollGenerationStatus(generationId);
          }, pollInterval);
        }
      } catch (err) {
        if (err instanceof Error && !err.message.includes('cancelled')) {
          console.error('Error polling generation status:', err);
          // Continue polling on error (network issues, etc.)
          pollIntervalRef.current = setTimeout(() => {
            pollGenerationStatus(generationId);
          }, pollInterval * 2); // Double the interval on error
        }
      }
    },
    [
      mockCheckGenerationStatus,
      calculateOverallProgress,
      updateEstimatedCompletion,
      checkGenerationComplete,
      hasSuccessfulResults,
      videoJobs,
      config.duration,
      lastGenerationOptions?.format,
      onGenerationComplete,
      onGenerationError,
      pollInterval,
    ]
  );

  // Start video generation
  const generateVideo = useCallback(
    async (options: GenerationOptions): Promise<void> => {
      if (!canGenerate()) {
        setError('Missing required configuration for video generation');
        return;
      }

      if (isGenerating) {
        return; // Already generating
      }

      // Cancel any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setGenerationStatus('generating');
      setProgress(0);
      setError(null);
      setResult(null);
      setLastGenerationOptions(options);
      setRetryCount(0);

      // Set generation timeout
      timeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setGenerationStatus('error');
          setError('Generation timed out');

          if (onGenerationError) {
            onGenerationError('Generation timed out');
          }
        }
      }, GENERATION_TIMEOUT);

      try {
        const { generationId, jobs } = await mockStartGeneration(
          options,
          abortControllerRef.current.signal
        );

        currentGenerationIdRef.current = generationId;
        setVideoJobs(jobs);

        // Start polling for status updates
        pollGenerationStatus(generationId);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('cancelled')) {
            // Don't set error for cancelled requests
            setGenerationStatus('idle');
            return;
          }

          setError(err.message);
          setGenerationStatus('error');

          // Auto-retry on failure (up to max retries)
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, retryCount + 1) * 1000;
            setTimeout(() => {
              generateVideo(options);
            }, delay);
          } else if (onGenerationError) {
            onGenerationError(err.message);
          }
        } else {
          const errorMessage = 'Unknown error occurred during video generation';
          setError(errorMessage);
          setGenerationStatus('error');

          if (onGenerationError) {
            onGenerationError(errorMessage);
          }
        }
      } finally {
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    },
    [
      canGenerate,
      isGenerating,
      mockStartGeneration,
      pollGenerationStatus,
      retryCount,
      maxRetries,
      onGenerationError,
    ]
  );

  // Retry generation
  const retryGeneration = useCallback(async (): Promise<void> => {
    if (lastGenerationOptions) {
      setRetryCount(0);
      setError(null);
      await generateVideo(lastGenerationOptions);
    }
  }, [lastGenerationOptions, generateVideo]);

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setGenerationStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  // Clear result
  const clearResult = useCallback(() => {
    setResult(null);
    setGenerationStatus('idle');
    setProgress(0);
    setError(null);
    setVideoJobs([]);
    setEstimatedCompletion(null);
  }, []);

  // Download video
  const downloadVideo = useCallback(() => {
    if (result?.url) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = `video-${result.id}.${result.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [result]);

  // Job management utilities
  const getJobById = useCallback(
    (jobId: string): VideoJob | null => {
      return videoJobs.find(job => job.id === jobId) || null;
    },
    [videoJobs]
  );

  const getCompletedJobs = useCallback((): VideoJob[] => {
    return videoJobs.filter(job => job.status === 'completed');
  }, [videoJobs]);

  const getFailedJobs = useCallback((): VideoJob[] => {
    return videoJobs.filter(job => job.status === 'failed');
  }, [videoJobs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    // Status and progress
    generationStatus,
    progress,
    result,
    error,
    videoJobs,
    estimatedCompletion,

    // Actions
    generateVideo,
    retryGeneration,
    cancelGeneration,
    clearResult,
    downloadVideo,

    // Job management
    getJobById,
    getCompletedJobs,
    getFailedJobs,

    // Generation validation
    canGenerate: canGenerate(),
    isGenerating,
  };
};
