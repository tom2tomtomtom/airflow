import React, { useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  ContentCopy as ContentCopyIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  GridView as GridViewIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useWorkflow } from './WorkflowProvider';
import { BriefUploadStep } from './steps/BriefUploadStep';
import { MotivationSelectionStep } from './steps/MotivationSelectionStep';
import { CopyGenerationStep } from './steps/CopyGenerationStep';
import { AssetSelectionStep } from './steps/AssetSelectionStep';
import { TemplateSelectionStep } from './steps/TemplateSelectionStep';
import { MatrixBuildStep } from './steps/MatrixBuildStep';
import { RenderStep } from './steps/RenderStep';

interface WorkflowContainerProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

// Define workflow steps
const workflowSteps = [
  {
    id: 'upload',
    label: 'Upload Brief',
    description: 'Upload and review your campaign brief',
    icon: <CloudUploadIcon />,
  },
  {
    id: 'motivations',
    label: 'Motivations',
    description: 'Generate and select strategic motivations',
    icon: <AutoAwesomeIcon />,
  },
  {
    id: 'copy',
    label: 'Copy Generation',
    description: 'Create copy variations for your campaign',
    icon: <ContentCopyIcon />,
  },
  {
    id: 'assets',
    label: 'Asset Selection',
    description: 'Choose images, videos, and other assets',
    icon: <ImageIcon />,
  },
  {
    id: 'template',
    label: 'Template',
    description: 'Select a video template for your campaign',
    icon: <VideoLibraryIcon />,
  },
  {
    id: 'matrix',
    label: 'Campaign Matrix',
    description: 'Review and build your campaign matrix',
    icon: <GridViewIcon />,
  },
  {
    id: 'render',
    label: 'Render Videos',
    description: 'Generate your final campaign videos',
    icon: <PlayArrowIcon />,
  },
];

export const WorkflowContainer: React.FC<WorkflowContainerProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const { state, actions } = useWorkflow();
  const { currentStep } = state;
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle step navigation
  const handleNext = useCallback(() => {
    actions.nextStep();
  }, [actions]);

  const handlePrevious = useCallback(() => {
    actions.previousStep();
  }, [actions]);

  const handleStepClick = useCallback((stepIndex: number) => {
    // Only allow navigation to completed steps or the next step
    if (stepIndex <= currentStep + 1) {
      actions.goToStep(stepIndex);
    }
  }, [currentStep, actions]);

  // Handle workflow completion
  const handleWorkflowComplete = useCallback((data: any) => {
    actions.resetWorkflow();
    onComplete(data);
  }, [actions, onComplete]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    // Reset workflow when closing
    actions.resetWorkflow();
    onClose();
  }, [actions, onClose]);

  // Render current step component
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BriefUploadStep
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <MotivationSelectionStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <CopyGenerationStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <AssetSelectionStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <TemplateSelectionStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <MatrixBuildStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <RenderStep
            onPrevious={handlePrevious}
            onComplete={handleWorkflowComplete}
          />
        );
      default:
        return null;
    }
  };

  // Check if step is completed
  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return state.briefConfirmed;
      case 1:
        return state.motivations.some(m => m.selected);
      case 2:
        return state.copyVariations.some(c => c.selected);
      case 3:
        return state.selectedAssets.length > 0;
      case 4:
        return state.selectedTemplate !== null;
      case 5:
        return true; // Matrix step is always considered complete once reached
      case 6:
        return true; // Render step is always considered complete once reached
      default:
        return false;
    }
  };

  // Check if step is active
  const isStepActive = (stepIndex: number) => {
    return stepIndex === currentStep;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '90vh',
          maxHeight: isMobile ? '100vh' : '90vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        <Box>
          <Typography variant="h5" component="div">
            AIRWAVE Campaign Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {workflowSteps[currentStep]?.description}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stepper 
          activeStep={currentStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {workflowSteps.map((step, index) => (
            <Step 
              key={step.id} 
              completed={isStepCompleted(index)}
              sx={{
                cursor: index <= currentStep + 1 ? 'pointer' : 'default',
                '& .MuiStepLabel-root': {
                  cursor: index <= currentStep + 1 ? 'pointer' : 'default',
                },
              }}
              onClick={() => handleStepClick(index)}
            >
              <StepLabel
                icon={step.icon}
                StepIconProps={{
                  sx: {
                    color: isStepCompleted(index) ? 'success.main' : 
                           isStepActive(index) ? 'primary.main' : 'grey.400',
                  },
                }}
              >
                <Box sx={{ textAlign: isMobile ? 'left' : 'center' }}>
                  <Typography variant="body2" fontWeight="medium">
                    {step.label}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Step Content */}
      <DialogContent sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: 0, // Remove default padding since steps handle their own
      }}>
        {renderStepContent()}
      </DialogContent>

      {/* Optional Footer - could be used for global actions */}
      {/* 
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Step {currentStep + 1} of {workflowSteps.length}
        </Typography>
        <Button onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
      */}
    </Dialog>
  );
};
