import { getErrorMessage } from '@/utils/errorUtils';
// Creatomate Integration Service
// This service handles video generation using the Creatomate API

import axios from 'axios';
import React from 'react';

export interface CreatomateTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  tags: string[];
  preview: string;
}

export interface CreatomateModification {
  [elementName: string]: string | number | boolean | {
    source?: string;
    text?: string;
    color?: string;
    fontSize?: number;
    [key: string]: any;
  };
}

export interface CreatomateRenderOptions {
  templateId: string;
  modifications: CreatomateModification;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreatomateRenderResponse {
  id: string;
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  url?: string;
  error?: string;
  progress?: number;
  createdAt: string;
  completedAt?: string;
}

class CreatomateService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Use server-side API key (not NEXT_PUBLIC_)
    this.apiKey = process.env.CREATOMATE_API_KEY || '';
    this.baseUrl = 'https://api.creatomate.com/v1';
  }

  /**
   * Get all available templates
   */
  async getTemplates(): Promise<CreatomateTemplate[]> {
    try {
      // In demo mode, return mock templates
      if (!this.apiKey || this.apiKey === 'demo') {
        return this.getMockTemplates();
      }

      const response = await axios.get(`${this.baseUrl}/templates`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error fetching Creatomate templates:', error);
      return this.getMockTemplates();
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<CreatomateTemplate | null> {
    try {
      if (!this.apiKey || this.apiKey === 'demo') {
        const templates = this.getMockTemplates();
        return templates.find(t => t.id === templateId) || null;
      }

      const response = await axios.get(`${this.baseUrl}/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error fetching Creatomate template:', error);
      return null;
    }
  }

  /**
   * Render a video using a template
   */
  async renderVideo(options: CreatomateRenderOptions): Promise<CreatomateRenderResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'demo') {
        return this.mockRenderVideo(options);
      }

      const response = await axios.post(
        `${this.baseUrl}/renders`,
        {
          template_id: options.templateId,
          modifications: options.modifications,
          webhook_url: options.webhookUrl,
          metadata: options.metadata,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        createdAt: response.data.created_at,
      };
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error rendering video:', error);
      throw new Error('Failed to start video rendering');
    }
  }

  /**
   * Get render status
   */
  async getRenderStatus(renderId: string): Promise<CreatomateRenderResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'demo') {
        return this.mockGetRenderStatus(renderId);
      }

      const response = await axios.get(`${this.baseUrl}/renders/${renderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return {
        id: response.data.id,
        status: response.data.status,
        url: response.data.url,
        progress: response.data.progress,
        error: response.data.error,
        createdAt: response.data.created_at,
        completedAt: response.data.completed_at,
      };
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error getting render status:', error);
      throw new Error('Failed to get render status');
    }
  }

  /**
   * Create AI-powered video variations
   */
  async generateVideoVariations(
    _templateId: string,
    baseModifications: CreatomateModification,
    variationCount: number = 3
  ): Promise<CreatomateModification[]> {
    const variations: CreatomateModification[] = [];
    
    // Generate variations based on the base modifications
    for (let i = 0; i < variationCount; i++) {
      const variation: CreatomateModification = { ...baseModifications };
      
      // Vary text content
      Object.keys(variation).forEach(key => {
        if (typeof variation[key] === 'object' && variation[key].text) {
          variation[key] = {
            ...variation[key],
            text: this.generateTextVariation(variation[key].text as string, i),
          };
        }
      });
      
      // Vary colors
      Object.keys(variation).forEach(key => {
        if (typeof variation[key] === 'object' && variation[key].color) {
          variation[key] = {
            ...variation[key],
            color: this.generateColorVariation(variation[key].color as string, i),
          };
        }
      });
      
      variations.push(variation);
    }
    
    return variations;
  }

  /**
   * Mock templates for demo mode
   */
  private getMockTemplates(): CreatomateTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Instagram Story - Product Showcase',
        width: 1080,
        height: 1920,
        duration: 15,
        frameRate: 30,
        tags: ['instagram', 'story', 'product', 'vertical'],
        preview: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=540&h=960&fit=crop',
      },
      {
        id: 'template-2',
        name: 'Facebook Ad - Sales Promotion',
        width: 1200,
        height: 628,
        duration: 10,
        frameRate: 30,
        tags: ['facebook', 'ad', 'promotion', 'horizontal'],
        preview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=314&fit=crop',
      },
      {
        id: 'template-3',
        name: 'YouTube Intro - Brand Animation',
        width: 1920,
        height: 1080,
        duration: 5,
        frameRate: 60,
        tags: ['youtube', 'intro', 'brand', 'animation'],
        preview: 'https://images.unsplash.com/photo-1626903264858-be7b5b3e2e18?w=960&h=540&fit=crop',
      },
      {
        id: 'template-4',
        name: 'TikTok Video - Fitness Challenge',
        width: 1080,
        height: 1920,
        duration: 30,
        frameRate: 30,
        tags: ['tiktok', 'fitness', 'challenge', 'vertical'],
        preview: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=540&h=960&fit=crop',
      },
      {
        id: 'template-5',
        name: 'LinkedIn Post - Company Update',
        width: 1200,
        height: 1200,
        duration: 20,
        frameRate: 24,
        tags: ['linkedin', 'corporate', 'update', 'square'],
        preview: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=600&fit=crop',
      },
    ];
  }

  /**
   * Mock render video for demo mode
   */
  private async mockRenderVideo(_options: CreatomateRenderOptions): Promise<CreatomateRenderResponse> {
    // Simulate async render initiation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `render-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Mock get render status for demo mode
   */
  private async mockGetRenderStatus(renderId: string): Promise<CreatomateRenderResponse> {
    // Simulate different stages based on time
    const renderIdParts = renderId.split('-');
    const createdAt = renderIdParts.length > 1 ? parseInt(renderIdParts[1] || '0') : 0;
    const elapsed = Date.now() - createdAt;
    
    if (elapsed < 5000) {
      return {
        id: renderId,
        status: 'rendering',
        progress: Math.min(90, (elapsed / 5000) * 100),
        createdAt: new Date(createdAt).toISOString(),
      };
    } else {
      return {
        id: renderId,
        status: 'completed',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        progress: 100,
        createdAt: new Date(createdAt).toISOString(),
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate text variations
   */
  private generateTextVariation(baseText: string, index: number): string {
    const variations = [
      baseText,
      `${baseText} - Limited Time`,
      `Don't Miss: ${baseText}`,
      `🔥 ${baseText} 🔥`,
      `NEW: ${baseText}`,
    ];
    
    return variations[index % variations.length] || baseText;
  }

  /**
   * Generate color variations
   */
  private generateColorVariation(baseColor: string, index: number): string {
    const variations = [
      baseColor,
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#F7DC6F', // Yellow
    ];
    
    return variations[index % variations.length] || baseColor;
  }
}

// Export singleton instance
export const creatomateService = new CreatomateService();

// Export hooks for React components
export const useCreatomateTemplates = () => {
  const [templates, setTemplates] = React.useState<CreatomateTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await creatomateService.getTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading, error };
};

export const useCreatomateRender = () => {
  const [rendering, setRendering] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const renderVideo = async (options: CreatomateRenderOptions): Promise<CreatomateRenderResponse> => {
    try {
      setRendering(true);
      setError(null);
      setProgress(0);

      // Start render
      const render = await creatomateService.renderVideo(options);

      // Poll for status
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const status = await creatomateService.getRenderStatus(render.id);
            
            if (status.progress) {
              setProgress(status.progress);
            }

            if (status.status === 'completed') {
              clearInterval(pollInterval);
              setRendering(false);
              resolve(status);
            } else if (status.status === 'failed') {
              clearInterval(pollInterval);
              const errorMessage = status.error || 'Render failed';
              setError(errorMessage);
              setRendering(false);
              reject(new Error(errorMessage));
            }
          } catch (err) {
            clearInterval(pollInterval);
            const errorMessage = err instanceof Error ? err.message : 'Failed to check render status';
            setError(errorMessage);
            setRendering(false);
            reject(new Error(errorMessage));
          }
        }, 2000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start render';
      setError(errorMessage);
      setRendering(false);
      throw new Error(errorMessage);
    }
  };

  return { renderVideo, rendering, progress, error };
};