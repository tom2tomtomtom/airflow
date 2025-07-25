import { useState, useCallback, useEffect } from 'react';
import {
  ContentElement,
  ContentElements,
  VoiceOver,
  BrandElements,
  GenerationSettings,
} from '../types';

/**
 * Custom hook for managing content elements state
 * Extracted from VideoStudioPage to improve modularity and testability
 */
export interface UseContentElementsReturn {
  contentElements: ContentElements;
  generationSettings: GenerationSettings;
  textOverlays: ContentElement[];
  selectedElement: string | null;

  // Text overlay actions
  addTextOverlay: () => void;
  updateTextOverlay: (index: number, updates: Partial<ContentElement>) => void;
  removeTextOverlay: (index: number) => void;
  selectElement: (elementId: string) => void;

  // Content elements actions
  updateContentElements: (updates: Partial<ContentElements>) => void;
  resetContentElements: () => void;

  // Audio actions
  toggleBackgroundMusic: () => void;
  toggleVoiceOver: () => void;
  updateVoiceOver: (updates: Partial<VoiceOver>) => void;

  // Brand elements actions
  updateBrandElements: (updates: Partial<BrandElements>) => void;

  // Generation settings actions
  updateGenerationSettings: (updates: Partial<GenerationSettings>) => void;

  // Validation
  validateElements: () => Record<string, string>;
  isValid: boolean;
}

const DEFAULT_CONTENT_ELEMENTS: ContentElements = {
  text_overlays: [],
  background_music: true,
  voice_over: undefined,
  brand_elements: undefined,
};

const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  variations_count: 1,
  include_captions: false,
  auto_optimize_for_platform: true,
  save_to_assets: true,
};

export const useContentElements = (
  initialContentElements: Partial<ContentElements> = {},
  initialGenerationSettings: Partial<GenerationSettings> = {},
  maxElements: number = 10
): UseContentElementsReturn => {
  const [contentElements, setContentElements] = useState<ContentElements>({
    ...DEFAULT_CONTENT_ELEMENTS,
    ...initialContentElements,
  });

  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    ...DEFAULT_GENERATION_SETTINGS,
    ...initialGenerationSettings,
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Text overlay actions
  const addTextOverlay = useCallback(() => {
    if (contentElements.text_overlays.length >= maxElements) {
      return;
    }

    const newOverlay: ContentElement = {
      text: '',
      position: 'center',
    };

    setContentElements(prev => ({
      ...prev,
      text_overlays: [...prev.text_overlays, newOverlay],
    }));

    // Select the new element
    setSelectedElement(contentElements.text_overlays.length.toString());
  }, [contentElements.text_overlays.length, maxElements]);

  const updateTextOverlay = useCallback((index: number, updates: Partial<ContentElement>) => {
    setContentElements(prev => {
      const updatedOverlays = [...prev.text_overlays];
      updatedOverlays[index] = { ...updatedOverlays[index], ...updates };
      return {
        ...prev,
        text_overlays: updatedOverlays,
      };
    });
  }, []);

  const removeTextOverlay = useCallback(
    (index: number) => {
      setContentElements(prev => ({
        ...prev,
        text_overlays: prev.text_overlays.filter((_, i) => i !== index),
      }));

      // Reset selection if removed element was selected
      if (selectedElement === index.toString()) {
        setSelectedElement(null);
      }
    },
    [selectedElement]
  );

  const selectElement = useCallback((elementId: string) => {
    setSelectedElement(elementId);
  }, []);

  // Content elements actions
  const updateContentElements = useCallback((updates: Partial<ContentElements>) => {
    setContentElements(prev => ({ ...prev, ...updates }));
  }, []);

  const resetContentElements = useCallback(() => {
    setContentElements({
      ...DEFAULT_CONTENT_ELEMENTS,
      ...initialContentElements,
    });
    setSelectedElement(null);
  }, [initialContentElements]);

  // Audio actions
  const toggleBackgroundMusic = useCallback(() => {
    setContentElements(prev => ({
      ...prev,
      background_music: !prev.background_music,
    }));
  }, []);

  const toggleVoiceOver = useCallback(() => {
    setContentElements(prev => {
      if (prev.voice_over) {
        return {
          ...prev,
          voice_over: undefined,
        };
      } else {
        return {
          ...prev,
          voice_over: {
            text: '',
            voice: 'neural',
            language: 'en',
          },
        };
      }
    });
  }, []);

  const updateVoiceOver = useCallback((updates: Partial<VoiceOver>) => {
    setContentElements(prev => {
      if (!prev.voice_over) return prev;

      return {
        ...prev,
        voice_over: {
          ...prev.voice_over,
          ...updates,
        },
      };
    });
  }, []);

  // Brand elements actions
  const updateBrandElements = useCallback((updates: Partial<BrandElements>) => {
    setContentElements(prev => ({
      ...prev,
      brand_elements: {
        ...prev.brand_elements,
        ...updates,
      },
    }));
  }, []);

  // Generation settings actions
  const updateGenerationSettings = useCallback((updates: Partial<GenerationSettings>) => {
    setGenerationSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Validation
  const validateElements = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate text overlays
    contentElements.text_overlays.forEach((overlay, index) => {
      if (!overlay.text.trim()) {
        errors[`textOverlay${index}`] = `Text overlay ${index + 1} cannot be empty`;
      } else if (overlay.text.length > 100) {
        errors[`textOverlay${index}`] =
          `Text overlay ${index + 1} must be less than 100 characters`;
      }
    });

    // Validate voice over
    if (contentElements.voice_over) {
      if (!contentElements.voice_over.text.trim()) {
        errors.voiceOver = 'Voice over text cannot be empty';
      } else if (contentElements.voice_over.text.length > 1000) {
        errors.voiceOver = 'Voice over text must be less than 1000 characters';
      }
    }

    // Validate brand elements
    if (contentElements.brand_elements?.logo_url) {
      const logoUrl = contentElements.brand_elements.logo_url;
      try {
        new URL(logoUrl);
      } catch {
        errors.logoUrl = 'Logo URL must be a valid URL';
      }
    }

    // Validate generation settings
    if (generationSettings.variations_count < 1 || generationSettings.variations_count > 10) {
      errors.variations = 'Variations count must be between 1 and 10';
    }

    return errors;
  }, [contentElements, generationSettings]);

  const isValid = useCallback((): boolean => {
    const errors = validateElements();
    return Object.keys(errors).length === 0;
  }, [validateElements]);

  // Auto-expand first text overlay when added
  useEffect(() => {
    if (contentElements.text_overlays.length === 1 && selectedElement === null) {
      setSelectedElement('0');
    }
  }, [contentElements.text_overlays.length, selectedElement]);

  return {
    contentElements,
    generationSettings,
    textOverlays: contentElements.text_overlays,
    selectedElement,

    // Text overlay actions
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    selectElement,

    // Content elements actions
    updateContentElements,
    resetContentElements,

    // Audio actions
    toggleBackgroundMusic,
    toggleVoiceOver,
    updateVoiceOver,

    // Brand elements actions
    updateBrandElements,

    // Generation settings actions
    updateGenerationSettings,

    // Validation
    validateElements,
    isValid: isValid(),
  };
};
