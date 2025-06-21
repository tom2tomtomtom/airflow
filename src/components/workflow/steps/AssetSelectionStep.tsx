import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useWorkflow } from '../WorkflowProvider';
import { StepComponentProps, Asset } from '@/lib/workflow/workflow-types';

interface AssetSelectionStepProps extends StepComponentProps {}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const { state, actions } = useWorkflow();
  const {
    briefData,
    selectedAssets,
    processing,
    lastError,
  } = state;

  const [activeTab, setActiveTab] = useState(0);
  const [generatingAssets, setGeneratingAssets] = useState(false);

  // Mock assets for demonstration - in real implementation, these would come from APIs
  const mockAssets: Asset[] = [
    {
      id: 'img-1',
      type: 'image',
      url: 'https://via.placeholder.com/300x200/4CAF50/white?text=Product+Hero',
      metadata: { title: 'Product Hero Image', description: 'Main product showcase' },
      selected: false,
    },
    {
      id: 'img-2',
      type: 'image',
      url: 'https://via.placeholder.com/300x200/2196F3/white?text=Lifestyle+Shot',
      metadata: { title: 'Lifestyle Image', description: 'Product in use context' },
      selected: false,
    },
    {
      id: 'img-3',
      type: 'image',
      url: 'https://via.placeholder.com/300x200/FF9800/white?text=Brand+Logo',
      metadata: { title: 'Brand Logo', description: 'Company branding asset' },
      selected: false,
    },
    {
      id: 'vid-1',
      type: 'video',
      url: 'https://via.placeholder.com/300x200/9C27B0/white?text=Demo+Video',
      metadata: { title: 'Product Demo', description: '30-second product demonstration' },
      selected: false,
    },
    {
      id: 'vid-2',
      type: 'video',
      url: 'https://via.placeholder.com/300x200/F44336/white?text=Testimonial',
      metadata: { title: 'Customer Testimonial', description: 'Customer success story' },
      selected: false,
    },
  ];

  // Handle asset selection
  const handleSelectAsset = useCallback((asset: Asset) => {
    const isSelected = selectedAssets.some(a => a.id === asset.id);
    if (isSelected) {
      actions.removeAsset(asset.id);
    } else {
      actions.selectAsset({ ...asset, selected: true });
    }
  }, [selectedAssets, actions]);

  // Handle AI asset generation
  const handleGenerateAssets = useCallback(async () => {
    if (!briefData) return;

    setGeneratingAssets(true);
    
    try {
      // Simulate AI asset generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the AI image generation API
      const generatedAssets: Asset[] = [
        {
          id: 'ai-img-1',
          type: 'image',
          url: 'https://via.placeholder.com/300x200/4CAF50/white?text=AI+Generated+1',
          metadata: { 
            title: 'AI Generated Image 1', 
            description: `Generated based on: ${briefData.title}`,
            aiGenerated: true 
          },
          selected: false,
        },
        {
          id: 'ai-img-2',
          type: 'image',
          url: 'https://via.placeholder.com/300x200/2196F3/white?text=AI+Generated+2',
          metadata: { 
            title: 'AI Generated Image 2', 
            description: `Generated for: ${briefData.targetAudience}`,
            aiGenerated: true 
          },
          selected: false,
        },
      ];

      // Add generated assets to selection
      generatedAssets.forEach(asset => actions.selectAsset(asset));
      
    } catch (error) {
      actions.setError('Failed to generate AI assets');
    } finally {
      setGeneratingAssets(false);
    }
  }, [briefData, actions]);

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

  // Filter assets by type
  const getAssetsByType = (type: Asset['type']) => {
    return [...mockAssets, ...selectedAssets.filter(a => a.metadata?.aiGenerated)]
      .filter(asset => asset.type === type);
  };

  const imageAssets = getAssetsByType('image');
  const videoAssets = getAssetsByType('video');

  // Check if asset is selected
  const isAssetSelected = (assetId: string) => {
    return selectedAssets.some(a => a.id === assetId);
  };

  const tabLabels = [
    { label: 'Images', icon: <ImageIcon />, count: imageAssets.length },
    { label: 'Videos', icon: <VideoLibraryIcon />, count: videoAssets.length },
  ];

  const renderAssetGrid = (assets: Asset[]) => (
    <Grid container spacing={3}>
      {assets.map((asset) => {
        const selected = isAssetSelected(asset.id);
        return (
          <Grid item xs={12} sm={6} md={4} key={asset.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selected ? 2 : 1,
                borderColor: selected ? 'primary.main' : 'grey.300',
                bgcolor: selected ? 'primary.50' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
              }}
              onClick={() => handleSelectAsset(asset)}
            >
              {/* Asset Preview */}
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${asset.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {/* Selection Indicator */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: selected ? 'primary.main' : 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: selected ? 'primary.dark' : 'rgba(0,0,0,0.7)',
                    },
                  }}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAsset(asset);
                  }}
                >
                  {selected ? <Remove /> : <Add />}
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
                      left: 8,
                    }}
                  />
                )}
              </Box>

              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {asset.metadata?.title || `${asset.type} Asset`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.metadata?.description || 'No description available'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Asset Selection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose images, videos, and other assets for your campaign. You can select from existing assets or generate new ones with AI.
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

      {/* Selection Summary */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Selected Assets ({selectedAssets.length})
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedAssets.map((asset) => (
                <Chip
                  key={asset.id}
                  label={asset.metadata?.title || asset.id}
                  onDelete={() => actions.removeAsset(asset.id)}
                  color="primary"
                  size="small"
                />
              ))}
              {selectedAssets.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No assets selected yet
                </Typography>
              )}
            </Stack>
          </Box>
          
          <Button
            variant="outlined"
            onClick={handleGenerateAssets}
            startIcon={<AutoAwesomeIcon />}
            disabled={generatingAssets || !briefData}
          >
            {generatingAssets ? 'Generating...' : 'Generate AI Assets'}
          </Button>
        </Box>
      </Paper>

      {/* Processing Indicator */}
      {generatingAssets && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Generating AI assets based on your brief...
          </Typography>
        </Box>
      )}

      {/* Asset Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          {tabLabels.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                  <Chip label={tab.count} size="small" />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Asset Content */}
      <Box sx={{ mb: 4 }}>
        {activeTab === 0 && renderAssetGrid(imageAssets)}
        {activeTab === 1 && renderAssetGrid(videoAssets)}
      </Box>

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
    </Box>
  );
};
