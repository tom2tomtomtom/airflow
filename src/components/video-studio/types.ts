// Base TypeScript interfaces for Video Studio components
// Extracted from video-studio.tsx for component refactoring

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  preview?: string;
  duration: number;
  aspect_ratio: string;
  platform: string[];
  category: string;
  tags: string[];
}

export interface VideoJob {
  id: string;
  generation_id: string;
  variation_index: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  render_job_id?: string;
  estimated_completion?: string;
  output_url?: string;
  thumbnail_url?: string;
  created_at: string;
  error_message?: string;
}

export interface VideoConfig {
  prompt: string;
  style: string;
  duration: number;
  resolution: string;
  platform?: string;
  aspect_ratio: string;
  template_id?: string;
}

export interface ContentElement {
  text: string;
  position: 'top' | 'center' | 'bottom';
  style?: string;
  duration?: number;
}

export interface VoiceOver {
  text: string;
  voice: string;
  language: string;
}

export interface BrandElements {
  logo_url?: string;
  color_scheme?: string[];
  font_family?: string;
}

export interface ContentElements {
  text_overlays: ContentElement[];
  background_music: boolean;
  voice_over?: VoiceOver;
  brand_elements?: BrandElements;
}

// Template filtering and selection
export interface TemplateFilters {
  category?: string;
  platform?: string;
  duration?: string;
  aspect_ratio?: string;
  search?: string;
}

// Video generation states and options
export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

export interface GenerationResult {
  id: string;
  url: string;
  thumbnail?: string;
  duration: number;
  format: string;
  size: number;
}

export interface GenerationOptions {
  quality: 'draft' | 'standard' | 'high';
  format: 'mp4' | 'mov' | 'webm';
  include_subtitles?: boolean;
  include_watermark?: boolean;
}

// Export platforms for multi-platform distribution
export interface ExportPlatform {
  id: string;
  name: string;
  aspect_ratio: string;
  max_duration: number;
  recommended_resolution: string;
}

// Video constraints based on template and platform
export interface VideoConstraints {
  min_duration: number;
  max_duration: number;
  allowed_aspect_ratios: string[];
  max_text_overlays: number;
  supported_resolutions: string[];
}

// Component props interfaces

export interface VideoTemplateSelectorProps {
  templates: VideoTemplate[];
  selectedTemplate: VideoTemplate | null;
  onTemplateSelect: (template: VideoTemplate) => void;
  filters: TemplateFilters;
  onFilterChange: (filters: TemplateFilters) => void;
  loading?: boolean;
}

export interface VideoConfigurationPanelProps {
  config: VideoConfig;
  onConfigChange: (config: Partial<VideoConfig>) => void;
  template: VideoTemplate | null;
  constraints?: VideoConstraints;
}

export interface ContentElementEditorProps {
  elements: ContentElement[];
  onElementsChange: (elements: ContentElement[] | ContentElements) => void;
  template: VideoTemplate | null;
  selectedElement: string | null;
  onElementSelect: (elementId: string) => void;
  maxElements?: number;
  contentElements?: ContentElements;
  generationSettings?: GenerationSettings;
  onGenerationSettingsChange?: (settings: Partial<GenerationSettings>) => void;
}

// Generation settings interface
export interface GenerationSettings {
  variations_count: number;
  include_captions: boolean;
  auto_optimize_for_platform: boolean;
  save_to_assets: boolean;
}

export interface VideoPreviewPanelProps {
  config: VideoConfig;
  elements: ContentElements;
  template: VideoTemplate | null;
  previewUrl?: string;
  onPreviewGenerate: () => void;
  loading?: boolean;
}

export interface GenerationControlPanelProps {
  onGenerate: (options: GenerationOptions) => void;
  generationStatus: GenerationStatus;
  progress: number;
  resultUrl?: string;
  onDownload: () => void;
  onExport: (platforms: ExportPlatform[]) => void;
  videoJobs?: VideoJob[];
}

// Context and provider interfaces
export interface VideoStudioContextValue {
  // Template state
  templates: VideoTemplate[];
  selectedTemplate: VideoTemplate | null;
  filters: TemplateFilters;

  // Configuration state
  videoConfig: VideoConfig;
  contentElements: ContentElements;

  // Generation state
  generationStatus: GenerationStatus;
  progress: number;
  result: GenerationResult | null;
  videoJobs: VideoJob[];

  // UI state
  activeStep: number;
  loading: boolean;

  // Actions
  setSelectedTemplate: (template: VideoTemplate | null) => void;
  setFilters: (filters: TemplateFilters) => void;
  updateVideoConfig: (config: Partial<VideoConfig>) => void;
  updateContentElements: (elements: Partial<ContentElements>) => void;
  generateVideo: (options: GenerationOptions) => Promise<void>;
  setActiveStep: (step: number) => void;
}

export interface VideoStudioProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<VideoConfig>;
  initialElements?: Partial<ContentElements>;
}
