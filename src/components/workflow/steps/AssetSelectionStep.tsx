import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Remove as RemoveIcon,
  Image as ImageIcon,
  AutoAwesome as AutoAwesomeIcon} from '@mui/icons-material';
import { useWorkflow } from '../WorkflowProvider';
import { StepComponentProps, Asset as WorkflowAsset } from '@/lib/workflow/workflow-types';
import AssetBrowser from '@/components/AssetBrowser';
import { AIImageGenerator } from '@/components/AIImageGenerator';

// Asset Browser Asset interface (from AssetBrowser.tsx)
interface BrowserAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'voice';
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  dateCreated: string;
  clientId: string;
  userId: string;
  favorite?: boolean;
  metadata?: Record<string, any>;
  size?: number;
  mimeType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface AssetSelectionStepProps extends StepComponentProps {}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({
  onNext,
  onPrevious}) => {
  const { state, actions } = useWorkflow();
  const {
    briefData,
    selectedAssets,
    processing,
    lastError,
    clientId} = state;

  const [activeTab, setActiveTab] = useState(0);
  const [generatingAssets, setGeneratingAssets] = useState(false);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Convert BrowserAsset to WorkflowAsset
  const convertBrowserAssetToWorkflowAsset = (browserAsset: BrowserAsset): WorkflowAsset => {
    // Map browser asset types to workflow asset types
    let workflowType: 'image' | 'video' | 'template' | 'copy';
    if (browserAsset.type === 'voice' || browserAsset.type === 'text') {
      workflowType = 'copy';
    } else {
      workflowType = browserAsset.type as 'image' | 'video';
    }

    return {
      id: browserAsset.id,
      type: workflowType,
      url: browserAsset.url,
      content: browserAsset.type === 'text' ? browserAsset.description : undefined,
      metadata: {
        ...browserAsset.metadata,
        name: browserAsset.name,
        description: browserAsset.description,
        tags: browserAsset.tags,
        thumbnailUrl: browserAsset.thumbnailUrl,
        size: browserAsset.size,
        mimeType: browserAsset.mimeType,
        duration: browserAsset.duration,
        width: browserAsset.width,
        height: browserAsset.height,
        dateCreated: browserAsset.dateCreated,
        favorite: browserAsset.favorite },
      selected: false };
  };

  // Handle asset selection from AssetBrowser
  const handleAssetBrowserSelect = useCallback((browserAsset: BrowserAsset) => {
    const workflowAsset = convertBrowserAssetToWorkflowAsset(browserAsset);
    const isSelected = selectedAssets.some(a => a.id === workflowAsset.id);

    if (isSelected) {
      actions.removeAsset(workflowAsset.id);
    } else {
      actions.selectAsset({ ...workflowAsset, selected: true });
    }
  }, [selectedAssets, actions, convertBrowserAssetToWorkflowAsset]);

  // Handle AI image generation
  const handleAIImageGenerated = useCallback((generatedAsset: any) => {
    // Convert the generated asset to workflow format
    const workflowAsset: WorkflowAsset = {
      id: generatedAsset.id || `ai-${Date.now()}`,
      type: 'image',
      url: generatedAsset.url,
      metadata: {
        ...generatedAsset.metadata,
        name: generatedAsset.name,
        description: generatedAsset.description || 'AI Generated Image',
        aiGenerated: true,
        ai_prompt: generatedAsset.ai_prompt,
        tags: generatedAsset.tags || ['ai-generated'] },
      selected: false };

    // Add to selected assets
    actions.selectAsset({ ...workflowAsset, selected: true });
    setShowAIGenerator(false);
  }, [actions]);

  // Handle opening asset browser
  const handleOpenAssetBrowser = useCallback(() => {
    setShowAssetBrowser(true);
  }, []);

  // Handle opening AI generator
  const handleOpenAIGenerator = useCallback(() => {
    setShowAIGenerator(true);
  }, []);

  // Generate smart prompts based on brief data and motivations
  const generateSmartPrompts = useCallback(() => {
    if (!briefData) return [];

    const selectedMotivations = state?.motivations?.filter((m: any) => m.selected);

    const prompts = [];

    // Base prompt from brief
    const baseContext = `${briefData.product || briefData.service || briefData.title} for ${briefData.targetAudience}`;

    // Add prompts based on selected motivations
    selectedMotivations.forEach((motivation: any) => {
      prompts.push({
        title: `${motivation.title} - Hero Image`,
        prompt: `Professional marketing image for ${baseContext}, focusing on ${motivation.description.toLowerCase()}, modern and clean design, high quality photography style`});
    });

    // Add general prompts based on brief
    if (briefData.platforms?.includes('social')) {
      prompts.push({
        title: 'Social Media Visual',
        prompt: `Eye-catching social media image for ${baseContext}, vibrant colors, engaging composition, optimized for social platforms`});
    }

    if (briefData.valueProposition) {
      prompts.push({
        title: 'Value Proposition Visual',
        prompt: `Visual representation of ${briefData.valueProposition} for ${baseContext}, professional, trustworthy, modern design`});
    }

    // Add industry-specific prompts
    if (briefData.industry) {
      prompts.push({
        title: `${briefData.industry} Industry Visual`,
        prompt: `Professional ${briefData.industry} industry image for ${baseContext}, clean, modern, industry-appropriate styling`});
    }

    return prompts.slice(0, 5); // Limit to 5 suggestions
  }, [briefData]);

  const smartPrompts = generateSmartPrompts();

  // Handle next step
  const handleNext = useCallback(() => {
    if (selectedAssets.length === 0) {
      actions.setError('Please select at least one asset to continue');
      return;
    }

    actions.clearError();
    onNext?.();
  }, [selectedAssets.length, actions, onNext]);

  // Clear error
  const handleClearError = useCallback(() => {
    actions.clearError();
  }, [actions]);

  // Remove asset from selection
  const handleRemoveAsset = useCallback((assetId: string) => {
    actions.removeAsset(assetId);
  }, [actions]);

  // Get asset display name
  const getAssetDisplayName = (asset: WorkflowAsset) => {
    return asset.metadata?.name || asset.metadata?.title || `Asset ${asset.id}`;
  };

  // Get asset counts by type
  const getAssetCounts = () => {
    const counts = { image: 0, video: 0, copy: 0, template: 0 };
    selectedAssets.forEach((asset: any) => {
      counts[asset.type] = (counts[asset.type] || 0) + 1;
    });
    return counts;
  };

  const assetCounts = getAssetCounts();

  // Render selected assets summary
  const renderSelectedAssets = () => (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {selectedAssets.map((asset: any) => (
        <Box key={asset.id}>
          <Card
            sx={{
              border: 1,
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
              position: 'relative'}}
          >
            {/* Asset Preview */}
            <Box
              sx={{
                height: 150,
                backgroundImage: asset.url ? `url(${asset.url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                bgcolor: asset.url ? 'transparent' : 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'}}
            >
              {!asset.url && (
                <Typography variant="h6" color="text.secondary">
                  {asset.type.toUpperCase()}
                </Typography>
              )}

              {/* Remove Button */}
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark'}}}
                size="small"
                onClick={() => handleRemoveAsset(asset.id)}
              >
                <RemoveIcon />
              </IconButton>

              {/* AI Generated Badge */}
              {asset.metadata?.aiGenerated && (
                <Chip
                  label="AI Generated"
                  size="small"
                  color="secondary"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8}}
                />
              )}
            </Box>

            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {getAssetDisplayName(asset)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {asset.metadata?.description || `${asset.type} asset`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Asset Selection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose images, videos, and other assets for your campaign. You can browse existing assets or generate new ones with AI.
      </Typography>

      {/* Error Alert */}
      {lastError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={handleClearError}
        >
          {lastError}
        </Alert>
      )}

      {/* Asset Actions */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleOpenAssetBrowser}
            startIcon={<ImageIcon />}
          >
            Browse Assets
          </Button>

          <Button
            variant="outlined"
            onClick={handleOpenAIGenerator}
            startIcon={<AutoAwesomeIcon />}
            disabled={!briefData}
          >
            Generate AI Images
          </Button>
        </Box>

        {/* Selection Summary */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Selected Assets ({selectedAssets.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Images: ${assetCounts.image}`}
              color={assetCounts.image > 0 ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label={`Videos: ${assetCounts.video}`}
              color={assetCounts.video > 0 ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label={`Other: ${assetCounts.copy + assetCounts.template}`}
              color={(assetCounts.copy + assetCounts.template) > 0 ? 'primary' : 'default'}
              size="small"
            />
          </Box>
          {selectedAssets.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No assets selected yet. Use the buttons above to browse or generate assets.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Selected Assets Display */}
      {selectedAssets.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Selected Assets
          </Typography>
          {renderSelectedAssets()}
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onPrevious}
          startIcon={<ArrowBackIcon />}
        >
          Back to Copy
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={<ArrowForwardIcon />}
          disabled={selectedAssets.length === 0}
        >
          Continue to Templates ({selectedAssets.length} assets)
        </Button>
      </Box>

      {/* Asset Browser Dialog */}
      <Dialog
        open={showAssetBrowser}
        onClose={() => setShowAssetBrowser(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Browse Assets
        </DialogTitle>
        <DialogContent>
          <AssetBrowser
            clientId={clientId || undefined}
            onAssetSelect={handleAssetBrowserSelect}
            selectionMode={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssetBrowser(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Image Generator Dialog */}
      <Dialog
        open={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Generate AI Images
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            {/* Smart Prompt Suggestions */}
            {smartPrompts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Suggested Prompts Based on Your Brief
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click any suggestion to use it as a starting point for your image generation.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {smartPrompts.map((suggestion, index) => (
                    <Box key={index}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          border: 1,
                          borderColor: 'divider'}}
                        onClick={() => {
                          // This would need to be passed to AIImageGenerator
                          // For now, we'll show the prompt in the dialog
                        }}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {suggestion.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {suggestion.prompt}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <AIImageGenerator
              clientId={clientId || ''}
              onImageGenerated={handleAIImageGenerated}
              brandGuidelines={typeof briefData?.brandGuidelines === 'string' ?
                {
                  voiceTone: briefData.brandGuidelines,
                  targetAudience: '',
                  keyMessages: []
                } :
                briefData?.brandGuidelines
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIGenerator(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
