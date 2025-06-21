import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Stack,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  VideoLibrary as VideoLibraryIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useWorkflow } from '../WorkflowProvider';
import { StepComponentProps, Template } from '@/lib/workflow/workflow-types';

interface TemplateSelectionStepProps extends StepComponentProps {}

export const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const { state, actions } = useWorkflow();
  const {
    briefData,
    selectedTemplate,
    lastError,
  } = state;

  // Mock templates - in real implementation, these would come from Creatomate API
  const mockTemplates: Template[] = [
    {
      id: 'template-1',
      name: 'Modern Product Showcase',
      description: 'Clean, modern template perfect for product demonstrations',
      thumbnail: 'https://via.placeholder.com/300x200/4CAF50/white?text=Modern+Showcase',
      category: 'Product',
      selected: false,
    },
    {
      id: 'template-2',
      name: 'Social Media Story',
      description: 'Vertical format optimized for Instagram and TikTok stories',
      thumbnail: 'https://via.placeholder.com/300x200/2196F3/white?text=Social+Story',
      category: 'Social',
      selected: false,
    },
    {
      id: 'template-3',
      name: 'Corporate Presentation',
      description: 'Professional template for business presentations and announcements',
      thumbnail: 'https://via.placeholder.com/300x200/FF9800/white?text=Corporate',
      category: 'Business',
      selected: false,
    },
    {
      id: 'template-4',
      name: 'Animated Explainer',
      description: 'Dynamic template with animations for explaining concepts',
      thumbnail: 'https://via.placeholder.com/300x200/9C27B0/white?text=Explainer',
      category: 'Educational',
      selected: false,
    },
    {
      id: 'template-5',
      name: 'Testimonial Spotlight',
      description: 'Template designed to highlight customer testimonials',
      thumbnail: 'https://via.placeholder.com/300x200/F44336/white?text=Testimonial',
      category: 'Social Proof',
      selected: false,
    },
    {
      id: 'template-6',
      name: 'Event Promotion',
      description: 'Eye-catching template for promoting events and webinars',
      thumbnail: 'https://via.placeholder.com/300x200/607D8B/white?text=Event',
      category: 'Marketing',
      selected: false,
    },
  ];

  // Handle template selection
  const handleSelectTemplate = useCallback((template: Template) => {
    actions.selectTemplate(template);
  }, [actions]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!selectedTemplate) {
      actions.setError('Please select a template to continue');
      return;
    }
    
    actions.clearError();
    onNext?.();
  }, [selectedTemplate, actions, onNext]);

  // Clear error
  const handleClearError = useCallback(() => {
    actions.clearError();
  }, [actions]);

  // Group templates by category
  const templatesByCategory = mockTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // Get recommended templates based on brief data
  const getRecommendedTemplates = () => {
    if (!briefData) return [];
    
    // Simple recommendation logic based on platforms
    const platforms = briefData.platforms || [];
    if (platforms.includes('Instagram') || platforms.includes('TikTok')) {
      return mockTemplates.filter(t => t.category === 'Social');
    }
    if (platforms.includes('LinkedIn')) {
      return mockTemplates.filter(t => t.category === 'Business');
    }
    return mockTemplates.slice(0, 3); // Default recommendations
  };

  const recommendedTemplates = getRecommendedTemplates();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Template Selection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose a video template that best fits your campaign style and platform requirements.
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

      {/* Selected Template Summary */}
      {selectedTemplate && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.50', border: 1, borderColor: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon color="primary" />
            <Box>
              <Typography variant="h6" color="primary">
                Selected Template: {selectedTemplate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTemplate.description}
              </Typography>
              <Chip label={selectedTemplate.category} size="small" sx={{ mt: 1 }} />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Recommended Templates */}
      {recommendedTemplates.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibraryIcon />
            Recommended for Your Campaign
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {recommendedTemplates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'grey.300',
                    bgcolor: selectedTemplate?.id === template.id ? 'primary.50' : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Preview */}
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${template.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    {selectedTemplate?.id === template.id && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'primary.main',
                          bgcolor: 'white',
                          borderRadius: '50%',
                          fontSize: 24,
                        }}
                      />
                    )}
                    <Chip
                      label="Recommended"
                      size="small"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                      }}
                    />
                  </Box>

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Chip label={template.category} size="small" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Templates by Category */}
      <Typography variant="h6" gutterBottom>
        All Templates
      </Typography>
      
      {Object.entries(templatesByCategory).map(([category, templates]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {category} ({templates.length})
          </Typography>
          
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'grey.300',
                    bgcolor: selectedTemplate?.id === template.id ? 'primary.50' : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Preview */}
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${template.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    {selectedTemplate?.id === template.id && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'primary.main',
                          bgcolor: 'white',
                          borderRadius: '50%',
                          fontSize: 24,
                        }}
                      />
                    )}
                  </Box>

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Chip label={template.category} size="small" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onPrevious}
          startIcon={<ArrowBackIcon />}
        >
          Back to Assets
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={<ArrowForwardIcon />}
          disabled={!selectedTemplate}
        >
          Build Campaign Matrix
        </Button>
      </Box>
    </Box>
  );
};
