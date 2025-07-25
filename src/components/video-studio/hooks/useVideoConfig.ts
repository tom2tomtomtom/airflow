import { useState, useCallback, useEffect } from 'react';
import { VideoConfig, VideoTemplate, VideoConstraints } from '../types';

/**
 * Custom hook for managing video configuration state
 * Extracted from VideoStudioPage to improve modularity and testability
 */
export interface UseVideoConfigReturn {
  config: VideoConfig;
  updateConfig: (updates: Partial<VideoConfig>) => void;
  resetConfig: () => void;
  validateConfig: () => Record<string, string>;
  isValid: boolean;
  applyTemplateDefaults: (template: VideoTemplate) => void;
  applyConstraints: (constraints: VideoConstraints) => void;
}

const DEFAULT_CONFIG: VideoConfig = {
  prompt: '',
  style: 'commercial',
  duration: 15,
  resolution: '1080p',
  aspect_ratio: '16:9',
  platform: undefined,
  template_id: undefined,
};

export const useVideoConfig = (initialConfig: Partial<VideoConfig> = {}): UseVideoConfigReturn => {
  const [config, setConfig] = useState<VideoConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  // Validation rules
  const validateConfig = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Prompt validation
    if (!config.prompt.trim()) {
      errors.prompt = 'Video prompt is required';
    } else if (config.prompt.trim().length < 10) {
      errors.prompt = 'Video prompt must be at least 10 characters';
    } else if (config.prompt.trim().length > 1000) {
      errors.prompt = 'Video prompt must be less than 1000 characters';
    }

    // Duration validation
    if (config.duration < 5) {
      errors.duration = 'Duration must be at least 5 seconds';
    } else if (config.duration > 300) {
      errors.duration = 'Duration must be less than 300 seconds';
    }

    // Style validation
    const validStyles = ['commercial', 'cinematic', 'documentary', 'social_media', 'animation'];
    if (!validStyles.includes(config.style)) {
      errors.style = 'Invalid video style selected';
    }

    // Resolution validation
    const validResolutions = ['720p', '1080p', '4K'];
    if (!validResolutions.includes(config.resolution)) {
      errors.resolution = 'Invalid resolution selected';
    }

    // Aspect ratio validation
    const validAspectRatios = ['16:9', '9:16', '1:1', '4:5'];
    if (!validAspectRatios.includes(config.aspect_ratio)) {
      errors.aspect_ratio = 'Invalid aspect ratio selected';
    }

    return errors;
  }, [config]);

  // Check if configuration is valid
  const isValid = useCallback((): boolean => {
    const errors = validateConfig();
    return Object.keys(errors).length === 0;
  }, [validateConfig]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<VideoConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset configuration to defaults
  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG, ...initialConfig });
  }, [initialConfig]);

  // Apply template defaults to configuration
  const applyTemplateDefaults = useCallback((template: VideoTemplate) => {
    setConfig(prev => ({
      ...prev,
      template_id: template.id,
      duration: template.duration,
      aspect_ratio: template.aspect_ratio,
      // Set platform to first supported platform if current platform not supported
      platform: template.platform.includes(prev.platform || '')
        ? prev.platform
        : template.platform[0],
    }));
  }, []);

  // Apply constraints to configuration
  const applyConstraints = useCallback((constraints: VideoConstraints) => {
    setConfig(prev => {
      const updatedConfig = { ...prev };

      // Constrain duration
      if (prev.duration < constraints.min_duration) {
        updatedConfig.duration = constraints.min_duration;
      } else if (prev.duration > constraints.max_duration) {
        updatedConfig.duration = constraints.max_duration;
      }

      // Constrain aspect ratio
      if (!constraints.allowed_aspect_ratios.includes(prev.aspect_ratio)) {
        updatedConfig.aspect_ratio = constraints.allowed_aspect_ratios[0];
      }

      // Constrain resolution
      if (!constraints.supported_resolutions.includes(prev.resolution)) {
        updatedConfig.resolution = constraints.supported_resolutions[0];
      }

      return updatedConfig;
    });
  }, []);

  // Auto-apply platform-specific aspect ratio when platform changes
  useEffect(() => {
    if (config.platform) {
      const platformRatios: Record<string, string> = {
        youtube: '16:9',
        instagram: '1:1',
        tiktok: '9:16',
        facebook: '16:9',
        linkedin: '16:9',
        twitter: '16:9',
      };

      const recommendedRatio = platformRatios[config.platform];
      if (recommendedRatio && recommendedRatio !== config.aspect_ratio) {
        // Only auto-update if the current ratio is a default or doesn't match platform
        const isDefaultRatio = config.aspect_ratio === '16:9';
        if (isDefaultRatio || !Object.values(platformRatios).includes(config.aspect_ratio)) {
          setConfig(prev => ({ ...prev, aspect_ratio: recommendedRatio }));
        }
      }
    }
  }, [config.platform, config.aspect_ratio]);

  return {
    config,
    updateConfig,
    resetConfig,
    validateConfig,
    isValid: isValid(),
    applyTemplateDefaults,
    applyConstraints,
  };
};
