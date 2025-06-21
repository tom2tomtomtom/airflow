import React, { useState, useCallback } from 'react';
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
  Card,
  CardContent,
  Grid,
  Chip,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Send as SendIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNotification } from '@/contexts/NotificationContext';
import { useCSRF } from '@/hooks/useCSRF';
import { briefWorkflowSteps } from './SmartProgressIndicator';
import { MobileOptimizedWorkflow } from './MobileOptimizedWorkflow';

// Material-UI icons are imported above and will be used directly


interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface BriefData {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  platforms: string[];
  budget: string;
  timeline: string;
  product?: string;
  service?: string;
  valueProposition?: string;
  brandGuidelines?: string;
  requirements?: string[];
  industry?: string;
  competitors?: string[];
}

interface Motivation {
  id: string;
  title: string;
  description: string;
  score: number;
  selected: boolean;
}

interface CopyVariation {
  id: string;
  text: string;
  platform: string;
  selected: boolean;
}

interface UnifiedBriefWorkflowProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export const UnifiedBriefWorkflow: React.FC<UnifiedBriefWorkflowProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  // For mobile detection, we'll use a simple window width check
  const [isMobile, setIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // State management with better error handling
  const [activeStep, setActiveStep] = useState(0);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [originalBriefData, setOriginalBriefData] = useState<BriefData | null>(null);
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showBriefReview, setShowBriefReview] = useState(false);
  const [briefConfirmed, setBriefConfirmed] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const { showNotification } = useNotification();
  const { makeCSRFRequest } = useCSRF();

  // Define handleProcessBrief first
  const handleProcessBrief = useCallback(async (file: File) => {
            setProcessing(true);
    
    // Helper function to make API call with retry
    const makeAPICall = async (retryCount = 0): Promise<any> => {
      try {
        // Create FormData to send file to API
        const formData = new FormData();
        formData.append('file', file);

        console.log(`Sending file to API... (attempt ${retryCount + 1})`);
        console.log('FormData contents:', formData.get('file'));

        const response = await makeCSRFRequest('/api/flow/parse-brief', {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let browser set it for FormData
        });
        
                if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
                return result;
        
      } catch (error) {
        console.error(`API call failed (attempt ${retryCount + 1}):`, error);
        
        // Retry up to 2 times for network errors
        if (retryCount < 2 && (error instanceof TypeError || (error instanceof Error && error.message.includes('Failed to fetch')))) {
          console.log(`Retrying in 1 second... (attempt ${retryCount + 2})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeAPICall(retryCount + 1);
        }
        
        throw error;
      }
    };
    
    try {
      const result = await makeAPICall();
      
      if (result.success) {
                setBriefData(result.data);
        setOriginalBriefData(result.data);
        setProcessing(false);
        setShowBriefReview(true);
        showNotification('Brief processed successfully! Please review and edit the parsed content.', 'success');
                // Don't change activeStep until user confirms the brief
      } else {
        throw new Error(result.message || 'Failed to parse brief');
      }
    } catch (error) {
      console.error('Error processing brief:', error);
      setProcessing(false);
      // Reset upload state on error so user can try again
      setUploadedFile(null);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process brief';
      setLastError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  }, [showNotification, makeCSRFRequest]); // activeStep removed from dependency array

  // Dropzone configuration - defined after handleProcessBrief
  const onDrop = useCallback((acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
            setUploadedFile(file);
      setProcessing(true); // Set processing immediately to prevent UI flash
      handleProcessBrief(file);
    }
  }, [activeStep, open, handleProcessBrief]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  // Reset workflow state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Only reset state when dialog closes, and add a delay to prevent race conditions
      setTimeout(() => {
                setActiveStep(0);
        setBriefData(null);
        setOriginalBriefData(null);
        setMotivations([]);
        setCopyVariations([]);
        setSelectedAssets([]);
        setSelectedTemplate(null);
        setProcessing(false);
        setUploadedFile(null);
        setShowBriefReview(false);
        setBriefConfirmed(false);
      }, 100);
    } else {
      // Component is closing, no action needed
    }
  }, [open]);

  // Debug effect to track activeStep changes
  React.useEffect(() => {
      }, [activeStep]);

  // Debug effect to track open state changes
  React.useEffect(() => {
      }, [open]);

  // Return mobile version for mobile devices
  if (isMobile) {
    return (
      <MobileOptimizedWorkflow
        open={open}
        onClose={onClose}
        onComplete={onComplete}
      />
    );
  }
  


  // Step 2: Generate Motivations
  const handleGenerateMotivations = async () => {
    if (!briefData) {
      showNotification('Brief data is required to generate motivations', 'error');
      return;
    }

        setProcessing(true);
    
    try {
      const response = await makeCSRFRequest('/api/flow/generate-motivations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate motivations`);
      }

      const result = await response.json();
      
      if (result.success) {
        const motivationsWithSelection = result.data.map((motivation: any) => ({
          ...motivation,
          selected: false
        }));
        
                setMotivations(motivationsWithSelection);
        setProcessing(false);
        showNotification(`Generated ${result.data.length} motivations!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to generate motivations');
      }
    } catch (error) {
      console.error('Error generating motivations:', error);
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate motivations. Please try again.';
      setLastError(errorMessage);
      showNotification(errorMessage, 'error');
      // Don't reset the step on error, keep user where they are
    }
  };

  const handleSelectMotivation = (id: string) => {
    setMotivations(motivations.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const handleNextFromMotivations = () => {
    const selectedCount = motivations.filter(m => m.selected).length;
    if (selectedCount < 1) {
      showNotification('Please select at least 1 motivation to continue', 'warning');
      return;
    }
        // Ensure we're not in a processing state when transitioning
    if (!processing) {
      setActiveStep(2);
      // Add a small delay to ensure state is updated before generating copy
      setTimeout(() => {
        if (!processing) {
          handleGenerateCopy();
        }
      }, 100);
    }
  };

  // Step 3: Generate Copy
  const handleGenerateCopy = async () => {
    if (!briefData) {
      showNotification('Brief data is required to generate copy', 'error');
      return;
    }

    const selectedMotivations = motivations.filter(m => m.selected);
    if (selectedMotivations.length < 1) { // Changed from 6 to 1 for easier testing
      showNotification('Minimum 1 motivation required to generate copy', 'error');
      return;
    }

        setProcessing(true);
    
    try {
      const response = await makeCSRFRequest('/api/flow/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivations: selectedMotivations,
          briefData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate copy`);
      }

      const result = await response.json();
      
      if (result.success) {
        const copyWithSelection = result.data.map((copy: any) => ({
          ...copy,
          selected: false
        }));
        
                setCopyVariations(copyWithSelection);
        setProcessing(false);
        showNotification(`Generated ${result.data.length} copy variations!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to generate copy');
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate copy. Please try again.';
      setLastError(errorMessage);
      showNotification(errorMessage, 'error');
      // Don't reset the step on error, keep user where they are
    }
  };

  const handleSelectCopy = (id: string) => {
    setCopyVariations(copyVariations.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const handleNextFromCopy = async () => {
    const selectedCopy = copyVariations.filter(c => c.selected);
    if (selectedCopy.length === 0) {
      showNotification('Please select at least one copy variation', 'warning');
      return;
    }

    setProcessing(true);

    try {
      // Store selected copy variations in assets library
      const response = await makeCSRFRequest('/api/flow/store-copy-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCopy,
          briefTitle: briefData?.title || 'Untitled Brief',
          clientId: 'default-client' // TODO: Get actual client ID from context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store copy assets');
      }

      const result = await response.json();
      
      if (result.success) {
        setProcessing(false);
        showNotification(`${result.data.count} copy variations stored in assets library!`, 'success');
        setActiveStep(3);
      } else {
        throw new Error(result.message || 'Failed to store copy assets');
      }
    } catch (error) {
      console.error('Error storing copy assets:', error);
      setProcessing(false);
      showNotification(error instanceof Error ? error.message : 'Failed to store copy assets', 'error');
    }
  };

  // Navigation helpers
  const handleNext = () => {
    if (activeStep < briefWorkflowSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      // If we're going back to step 0 and brief is confirmed, 
      // show the brief review instead of upload interface
      if (activeStep === 1 && briefConfirmed) {
        setShowBriefReview(true);
        setBriefConfirmed(false);
      }
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = () => {
    const workflowData = {
      brief: briefData,
      motivations: motivations.filter(m => m.selected),
      copy: copyVariations.filter(c => c.selected),
      assets: selectedAssets,
      template: selectedTemplate,
    };
    
    onComplete(workflowData);
    showNotification('Workflow completed! Ready for rendering.', 'success');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Upload Brief
        return (
          <Box sx={{ width: '100%' }}>
            {!uploadedFile && !briefConfirmed && !processing && !briefData ? (
              <Paper
                {...getRootProps()}
                sx={{
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.50' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop your brief here' : 'Drag & drop your brief document'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: PDF, Word (.docx), Text (.txt) • Max 10MB
                </Typography>
              </Paper>
            ) : briefConfirmed ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Brief Confirmed!
                </Typography>
                <Typography variant="body2">
                  {briefData?.title} - Brief has been confirmed and you can proceed to motivations step.
                </Typography>
              </Alert>
            ) : (
              <Box>
                {processing ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Processing brief with AI...</Typography>
                  </Box>
                ) : briefData && showBriefReview ? (
                  <BriefReviewEditor
                    briefData={briefData}
                    onUpdate={setBriefData}
                    onProceed={() => {
                                                                                        // Ensure brief data is valid before proceeding
                      if (!briefData || !briefData.title) {
                        showNotification('Brief data is invalid. Please try uploading again.', 'error');
                        return;
                      }
                      
                      // Set brief as confirmed and hide review editor
                      setBriefConfirmed(true);
                      setShowBriefReview(false);
                      
                      // Force state update before proceeding
                      setTimeout(() => {
                                                setActiveStep(1);
                        showNotification('Brief confirmed! Ready to generate motivations.', 'success');
                        
                        // Auto-trigger motivation generation after state update
                        setTimeout(() => {
                          if (motivations.length === 0 && !processing) {
                                                        handleGenerateMotivations();
                          }
                        }, 300);
                      }, 50);
                    }}
                    onReset={() => {
                      if (originalBriefData) {
                        setBriefData(originalBriefData);
                        showNotification('Brief data reset to original parsed values', 'info');
                      }
                    }}
                  />
                ) : briefData ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Brief Ready!
                    </Typography>
                    <Typography variant="body2">
                      {briefData.title} - Click "Generate Strategic Motivations" to continue
                    </Typography>
                  </Alert>
                ) : null}
              </Box>
            )}
          </Box>
        );

      case 1: // Generate Motivations
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Step 2: Generate Strategic Motivations
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Generate AI-powered strategic motivations based on your brief content.
            </Typography>
            {motivations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleGenerateMotivations}
                  disabled={processing}
                  sx={{ mb: 2 }}
                >
                  {processing ? 'Generating...' : 'Generate Strategic Motivations'}
                </Button>
                {processing && <LinearProgress sx={{ mt: 2 }} />}
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Select Strategic Motivations
                </Typography>
                <Grid container spacing={2}>
                  {motivations.map((motivation) => (
                    <Grid size={{ xs: 12, md: 6 }} key={motivation.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: motivation.selected ? 2 : 1,
                          borderColor: motivation.selected ? 'primary.main' : 'grey.300',
                          '&:hover': {
                            boxShadow: 3,
                          },
                        }}
                        onClick={() => handleSelectMotivation(motivation.id)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="h4">
                              {motivation.title}
                            </Typography>
                            <Chip
                              label={`${motivation.score}%`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {motivation.description}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={motivation.selected}
                                onChange={() => handleSelectMotivation(motivation.id)}
                                color="primary"
                              />
                            }
                            label="Select this motivation"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextFromMotivations}
                  >
                    Generate Copy from Selected Motivations
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2: // Generate Copy
        return (
          <Box sx={{ width: '100%' }}>
            {copyVariations.length === 0 && processing ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">Generating copy variations...</Typography>
              </Box>
            ) : copyVariations.length > 0 ? (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Select Copy Variations
                </Typography>
                <Stack spacing={2}>
                  {copyVariations.map((copy) => (
                    <Card
                      key={copy.id}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: copy.selected ? 2 : 1,
                        borderColor: copy.selected ? 'primary.main' : 'grey.300',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleSelectCopy(copy.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={copy.platform}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={copy.selected}
                                onChange={() => handleSelectCopy(copy.id)}
                                color="primary"
                              />
                            }
                            label="Select"
                          />
                        </Box>
                        <Typography variant="body1">
                          {copy.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextFromCopy}
                    disabled={processing}
                  >
                    {processing ? 'Storing in Assets Library...' : 'Store Copy & Continue'}
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Box>
        );

      case 3: // Select Assets
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Choose Your Assets
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Use Existing Assets
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select from your asset library
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                    >
                      Browse Asset Library
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Generate New Assets
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create AI-generated images and videos
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<AutoAwesomeIcon />}
                    >
                      Generate Assets
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
              >
                Continue to Template Selection
              </Button>
            </Box>
          </Box>
        );

      case 4: // Pick Template
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Select Video Template
            </Typography>
            <Grid container spacing={2}>
              {['Modern Slideshow', 'Dynamic Promo', 'Social Story', 'Product Showcase'].map((template) => (
                <Grid size={{ xs: 12, md: 6 }} key={template}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: selectedTemplate === template ? 2 : 1,
                      borderColor: selectedTemplate === template ? 'primary.main' : 'grey.300',
                      '&:hover': {
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <VideoLibraryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3">
                            {template}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Perfect for {briefData?.platforms.join(', ')} campaigns
                          </Typography>
                        </Box>
                        {selectedTemplate === template && (
                          <CheckCircleIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                disabled={!selectedTemplate}
              >
                Configure Content Matrix
              </Button>
            </Box>
          </Box>
        );

      case 5: // Populate Matrix
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Content Matrix Configuration
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your content matrix will be populated with the selected motivations, copy, and assets.
            </Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Motivations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {motivations.filter(m => m.selected).length} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Copy Variations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {copyVariations.filter(c => c.selected).length} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Template
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTemplate || 'None selected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
              >
                Ready for Rendering
              </Button>
            </Box>
          </Box>
        );

      case 6: // Ready to Render
        return (
          <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to Render!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your content is configured and ready to be sent to Creatomate for rendering.
            </Typography>
            <Paper sx={{ p: 3, mb: 3, maxWidth: 400, mx: 'auto', textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>
                Summary:
              </Typography>
              <Box sx={{ '& > *': { mb: 0.5 } }}>
                <Typography variant="body2">• Brief: {briefData?.title}</Typography>
                <Typography variant="body2">• Motivations: {motivations.filter(m => m.selected).length} selected</Typography>
                <Typography variant="body2">• Copy: {copyVariations.filter(c => c.selected).length} variations</Typography>
                <Typography variant="body2">• Template: {selectedTemplate}</Typography>
                <Typography variant="body2">• Platforms: {briefData?.platforms.join(', ')}</Typography>
              </Box>
            </Paper>
            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleComplete}
            >
              Send to Creatomate for Rendering
            </Button>
          </Box>
        );

      default:
        return (
          <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              {briefWorkflowSteps[step]?.label}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {briefWorkflowSteps[step]?.description}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
            >
              Continue to Next Step
            </Button>
          </Box>
        );
    }
  };

  const handleDialogClose = (_event: Record<string, unknown>, reason: 'backdropClick' | 'escapeKeyDown') => {
    // Prevent closing during processing to avoid losing state
    if (processing) {
            return;
    }
    
    // Prevent accidental closure during brief editing or motivation generation
    if (reason === 'backdropClick' && (showBriefReview || motivations.length > 0 || copyVariations.length > 0)) {
            return;
    }
    
        onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth={false}
      fullWidth
      disableEscapeKeyDown={processing}
      PaperProps={{
        sx: {
          width: '95vw',
          maxWidth: '1400px',
          height: '90vh',
          maxHeight: '900px',
          margin: '2.5vh auto'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Brief to Execution Workflow
          </Typography>
          <IconButton
            onClick={() => {
              if (processing) {
                return;
              }
              onClose();
            }}
            aria-label="Close dialog"
            disabled={processing}
            sx={{
              opacity: processing ? 0.5 : 1,
              cursor: processing ? 'not-allowed' : 'pointer'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {briefWorkflowSteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel icon={step.icon}>
                  <Typography variant="caption">{step.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ minHeight: 400, width: '100%', overflow: 'auto', maxHeight: '70vh' }}>
          {lastError && (
            <Alert
              severity="error"
              onClose={() => setLastError(null)}
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Error occurred
              </Typography>
              <Typography variant="body2">
                {lastError}
              </Typography>
            </Alert>
          )}
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        {activeStep === briefWorkflowSteps.length - 1 ? (
          <Button
            onClick={handleComplete}
            variant="contained"
          >
            Complete & Send to Render
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

// Brief Review Editor Component
interface BriefReviewEditorProps {
  briefData: BriefData;
  onUpdate: (data: BriefData) => void;
  onProceed: () => void;
  onReset: () => void;
}

const BriefReviewEditor: React.FC<BriefReviewEditorProps> = ({
  briefData,
  onUpdate,
  onProceed,
  onReset,
}) => {
  const [editedData, setEditedData] = useState<BriefData>(briefData);

  // Sync state when briefData changes
  React.useEffect(() => {
    setEditedData(briefData);
  }, [briefData]);

  const handleFieldChange = (field: keyof BriefData, value: any) => {
    // Ensure value is properly formatted and not an object
    let cleanValue = value;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Convert object to string representation
      cleanValue = JSON.stringify(value);
      console.warn(`Field ${field} received object value, converting to string:`, cleanValue);
    }
    
    const updated = { ...editedData, [field]: cleanValue };
    setEditedData(updated);
    onUpdate(updated);
  };

  const handleArrayFieldChange = (field: keyof BriefData, index: number, value: string) => {
    const currentArray = editedData[field] as string[];
    const updated = [...currentArray];
    updated[index] = value;
    handleFieldChange(field, updated);
  };

  const handleAddArrayItem = (field: keyof BriefData) => {
    const currentArray = (editedData[field] as string[]) || [];
    handleFieldChange(field, [...currentArray, '']);
  };

  const handleRemoveArrayItem = (field: keyof BriefData, index: number) => {
    const currentArray = editedData[field] as string[];
    const updated = currentArray.filter((_, i) => i !== index);
    handleFieldChange(field, updated);
  };

  return (
    <Box sx={{ width: '100%', p: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ borderLeft: 4, borderColor: 'primary.main', pl: 3, mb: 4 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Review & Edit Brief Content
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Please review the parsed content below and make any necessary adjustments before proceeding to generate motivations.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Brief Title"
            variant="outlined"
            value={typeof editedData.title === 'string' ? editedData.title : String(editedData.title || '')}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Enter your brief title..."
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Industry"
            variant="outlined"
            value={editedData.industry || ''}
            onChange={(e) => handleFieldChange('industry', e.target.value)}
            placeholder="e.g., Technology, Healthcare, Retail"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Product/Service"
            variant="outlined"
            value={editedData.product || editedData.service || ''}
            onChange={(e) => handleFieldChange('product', e.target.value)}
            placeholder="Describe your product or service"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Objective"
            multiline
            rows={4}
            variant="outlined"
            value={typeof editedData.objective === 'string' ? editedData.objective : String(editedData.objective || '')}
            onChange={(e) => handleFieldChange('objective', e.target.value)}
            placeholder="Describe the main objective of your campaign..."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Target Audience"
            multiline
            rows={4}
            variant="outlined"
            value={typeof editedData.targetAudience === 'string' ? editedData.targetAudience : String(editedData.targetAudience || '')}
            onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
            placeholder="Describe your target audience in detail..."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Value Proposition"
            multiline
            rows={4}
            variant="outlined"
            value={typeof editedData.valueProposition === 'string' ? editedData.valueProposition || '' : String(editedData.valueProposition || '')}
            onChange={(e) => handleFieldChange('valueProposition', e.target.value)}
            placeholder="What unique value does your product/service offer?"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Budget"
            variant="outlined"
            value={editedData.budget || ''}
            onChange={(e) => handleFieldChange('budget', e.target.value)}
            placeholder="e.g., $50,000 or TBD"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Timeline"
            variant="outlined"
            value={editedData.timeline || ''}
            onChange={(e) => handleFieldChange('timeline', e.target.value)}
            placeholder="e.g., 3 months or Q1 2024"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<ClearIcon />}
        >
          Reset to Original
        </Button>
        <Button
          variant="contained"
          onClick={onProceed}
          startIcon={<ArrowForwardIcon />}
        >
          Confirm & Generate Motivations
        </Button>
      </Box>
    </Box>
  );
};