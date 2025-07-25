import { useState, useCallback, useEffect } from 'react';
import { VideoTemplate, TemplateFilters } from '../types';

/**
 * Custom hook for managing template selection state
 * Extracted from VideoStudioPage to improve modularity and testability
 */
export interface UseTemplateSelectionReturn {
  templates: VideoTemplate[];
  selectedTemplate: VideoTemplate | null;
  filters: TemplateFilters;
  loading: boolean;
  error: string | null;
  setSelectedTemplate: (template: VideoTemplate | null) => void;
  setFilters: (filters: TemplateFilters) => void;
  loadTemplates: () => Promise<void>;
  clearSelection: () => void;
  clearFilters: () => void;
}

export const useTemplateSelection = (
  initialFilters: TemplateFilters = {}
): UseTemplateSelectionReturn => {
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates from API
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates');

      if (!response.ok) {
        throw new Error(`Failed to load templates: ${response.status}`);
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      console.error('Error loading templates:', err);

      // Fallback to mock data for development
      const mockTemplates: VideoTemplate[] = [
        {
          id: 'template-1',
          name: 'Social Media Promo',
          description: 'Perfect for social media campaigns with dynamic text and animations',
          thumbnail: 'https://via.placeholder.com/300x169/4f46e5/ffffff?text=Social+Promo',
          duration: 15,
          aspect_ratio: '16:9',
          platform: ['instagram', 'facebook', 'youtube'],
          category: 'Social Media',
          tags: ['promo', 'social', 'dynamic'],
        },
        {
          id: 'template-2',
          name: 'Product Showcase',
          description: 'Showcase your products with elegant transitions and branding',
          thumbnail: 'https://via.placeholder.com/300x169/e91e63/ffffff?text=Product+Showcase',
          duration: 20,
          aspect_ratio: '16:9',
          platform: ['youtube', 'linkedin', 'facebook'],
          category: 'Product',
          tags: ['product', 'showcase', 'elegant'],
        },
        {
          id: 'template-3',
          name: 'TikTok Vertical',
          description: 'Vertical format optimized for TikTok and Instagram Stories',
          thumbnail: 'https://via.placeholder.com/169x300/ff9800/ffffff?text=TikTok+Vertical',
          duration: 10,
          aspect_ratio: '9:16',
          platform: ['tiktok', 'instagram'],
          category: 'Vertical',
          tags: ['vertical', 'tiktok', 'stories'],
        },
        {
          id: 'template-4',
          name: 'Corporate Presentation',
          description: 'Professional template for corporate communications',
          thumbnail: 'https://via.placeholder.com/300x169/2196f3/ffffff?text=Corporate',
          duration: 30,
          aspect_ratio: '16:9',
          platform: ['linkedin', 'youtube'],
          category: 'Corporate',
          tags: ['corporate', 'professional', 'presentation'],
        },
      ];

      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear template selection
  const clearSelection = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Validate selected template still exists in templates
  useEffect(() => {
    if (selectedTemplate && templates.length > 0) {
      const templateExists = templates.some(t => t.id === selectedTemplate.id);
      if (!templateExists) {
        setSelectedTemplate(null);
      }
    }
  }, [templates, selectedTemplate]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    selectedTemplate,
    filters,
    loading,
    error,
    setSelectedTemplate,
    setFilters,
    loadTemplates,
    clearSelection,
    clearFilters,
  };
};
