// Video Studio components barrel export
export { VideoStudioProvider, useVideoStudio } from './VideoStudioProvider';
export { VideoTemplateSelector } from './VideoTemplateSelector';
export { VideoConfigurationPanel } from './VideoConfigurationPanel';
export { ContentElementEditor } from './ContentElementEditor';
export { VideoPreviewPanel } from './VideoPreviewPanel';
export { GenerationControlPanel } from './GenerationControlPanel';
// Re-export UnifiedErrorBoundary with video-studio context for backward compatibility
export {
  UnifiedErrorBoundary as VideoStudioErrorBoundary,
  UnifiedErrorBoundary as VideoStudioSectionBoundary,
} from '@/components/UnifiedErrorBoundary';
export { useTemplateSelection } from './hooks/useTemplateSelection';
export { useVideoConfig } from './hooks/useVideoConfig';
export { useContentElements } from './hooks/useContentElements';
export { useVideoPreview } from './hooks/useVideoPreview';
export { useVideoGeneration } from './hooks/useVideoGeneration';
export * from './types';
