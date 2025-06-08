import React, { useState, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  TextField,
  Grid,
} from '@mui/material';
import { SmartProgressIndicator, briefWorkflowSteps } from './SmartProgressIndicator';
import { MobileOptimizedWorkflow } from './MobileOptimizedWorkflow';
import { AnimatedActionButton, LoadingState, SuccessState } from './AnimatedComponents';
import {
  CloudUpload,
  AutoAwesome,
  ContentCopy,
  Image as ImageIcon,
  VideoLibrary,
  GridView,
  Send,
  CheckCircle,
  ArrowForward,
  Close,
  Add as AddIcon,
  Clear,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNotification } from '@/contexts/NotificationContext';

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

const workflowSteps: WorkflowStep[] = [
  { id: 'upload', label: 'Upload Brief', description: 'Upload and parse your brief document', icon: <CloudUpload />, completed: false },
  { id: 'motivations', label: 'Generate Motivations', description: 'AI generates strategic motivations', icon: <AutoAwesome />, completed: false },
  { id: 'copy', label: 'Generate Copy', description: 'Create platform-specific copy', icon: <ContentCopy />, completed: false },
  { id: 'assets', label: 'Select Assets', description: 'Choose or generate new assets', icon: <ImageIcon />, completed: false },
  { id: 'template', label: 'Pick Template', description: 'Select video template', icon: <VideoLibrary />, completed: false },
  { id: 'matrix', label: 'Populate Matrix', description: 'Configure content matrix', icon: <GridView />, completed: false },
  { id: 'render', label: 'Ready to Render', description: 'Send to Creatomate', icon: <Send />, completed: false },
];

export const UnifiedBriefWorkflow: React.FC<UnifiedBriefWorkflowProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [originalBriefData, setOriginalBriefData] = useState<BriefData | null>(null);
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState(briefWorkflowSteps);
  const [showBriefReview, setShowBriefReview] = useState(false);
  const [briefConfirmed, setBriefConfirmed] = useState(false);

  const { showNotification } = useNotification();

  // Reset workflow state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Reset all state when dialog closes
      console.log('Dialog closed, resetting workflow state');
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
    } else {
      console.log('Dialog opened, initializing workflow');
    }
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
  
  // Step 1: File Upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      handleProcessBrief(acceptedFiles[0]);
    }
  }, []);

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

  const handleProcessBrief = async (file: File) => {
    setProcessing(true);
    
    try {
      // Create FormData to send file to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/flow/parse-brief', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to parse brief');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Brief parsed successfully:', result.data);
        setBriefData(result.data);
        setOriginalBriefData(result.data);
        setProcessing(false);
        setShowBriefReview(true);
        showNotification('Brief processed successfully! Please review and edit the parsed content.', 'success');
        console.log('Brief parsed - showing review step');
        // Don't change step until user confirms the brief
      } else {
        throw new Error(result.message || 'Failed to parse brief');
      }
    } catch (error) {
      console.error('Error processing brief:', error);
      setProcessing(false);
      showNotification(error instanceof Error ? error.message : 'Failed to process brief', 'error');
    }
  };

  // Step 2: Generate Motivations
  const handleGenerateMotivations = async () => {
    if (!briefData) {
      showNotification('Brief data is required to generate motivations', 'error');
      return;
    }

    setProcessing(true);
    
    try {
      const response = await fetch('/api/flow/generate-motivations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefData }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate motivations');
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
      showNotification(error instanceof Error ? error.message : 'Failed to generate motivations', 'error');
    }
  };

  const handleSelectMotivation = (id: string) => {
    setMotivations(motivations.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const handleNextFromMotivations = () => {
    const selectedCount = motivations.filter(m => m.selected).length;
    if (selectedCount < 6) {
      showNotification('Please select at least 6 motivations', 'warning');
      return;
    }
    console.log('Moving from motivations step to copy generation step');
    setActiveStep(2);
    handleGenerateCopy();
  };

  // Step 3: Generate Copy
  const handleGenerateCopy = async () => {
    if (!briefData) {
      showNotification('Brief data is required to generate copy', 'error');
      return;
    }

    const selectedMotivations = motivations.filter(m => m.selected);
    if (selectedMotivations.length < 6) {
      showNotification('Minimum 6 motivations required to generate copy', 'error');
      return;
    }

    setProcessing(true);
    
    try {
      const response = await fetch('/api/flow/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          motivations: selectedMotivations, 
          briefData 
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate copy');
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
      showNotification(error instanceof Error ? error.message : 'Failed to generate copy', 'error');
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
      const response = await fetch('/api/flow/store-copy-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCopy,
          briefTitle: briefData?.title || 'Untitled Brief',
          clientId: 'default-client' // TODO: Get actual client ID from context
        }),
        credentials: 'include',
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
    if (activeStep < workflowSteps.length - 1) {
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
          <Box>
            {!uploadedFile && !briefConfirmed ? (
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop your brief here' : 'Drag & drop your brief document'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: PDF, Word (.docx), Text (.txt) • Max 10MB
                </Typography>
              </Box>
            ) : briefConfirmed ? (
              <Alert severity="success" icon={<CheckCircle />}>
                <Typography variant="h6">Brief Confirmed!</Typography>
                <Typography variant="body2">
                  {briefData?.title} - Brief has been confirmed and you can proceed to motivations step.
                </Typography>
              </Alert>
            ) : (
              <Box>
                {processing ? (
                  <Box textAlign="center" py={3}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Processing brief with AI...</Typography>
                  </Box>
                ) : briefData && showBriefReview ? (
                  <BriefReviewEditor
                    briefData={briefData}
                    onUpdate={setBriefData}
                    onProceed={() => {
                      console.log('BriefReviewEditor: onProceed called, moving to step 1');
                      console.log('Current step before transition:', activeStep);
                      console.log('Brief data being confirmed:', briefData?.title);
                      
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
                        console.log('Setting activeStep to 1 for motivations');
                        setActiveStep(1);
                        showNotification('Brief confirmed! Ready to generate motivations.', 'success');
                        
                        // Auto-trigger motivation generation after state update
                        setTimeout(() => {
                          if (motivations.length === 0) {
                            console.log('Auto-triggering motivation generation');
                            handleGenerateMotivations();
                          }
                        }, 200);
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
                  <Alert severity="success" icon={<CheckCircle />}>
                    <Typography variant="h6">Brief Ready!</Typography>
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
          <Box>
            <Typography variant="h6" gutterBottom>Step 2: Generate Strategic Motivations</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate AI-powered strategic motivations based on your brief content.
            </Typography>
            {motivations.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesome />}
                  onClick={handleGenerateMotivations}
                  disabled={processing}
                >
                  {processing ? 'Generating...' : 'Generate Strategic Motivations'}
                </Button>
                {processing && <LinearProgress sx={{ mt: 2 }} />}
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>Select Strategic Motivations</Typography>
                <Grid container spacing={2}>
                  {motivations.map((motivation) => (
                    <Grid xs={12} md={6} key={motivation.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: motivation.selected ? 2 : 1,
                          borderColor: motivation.selected ? 'primary.main' : 'divider',
                        }}
                        onClick={() => handleSelectMotivation(motivation.id)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6">{motivation.title}</Typography>
                            <Chip label={`${motivation.score}%`} color="primary" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {motivation.description}
                          </Typography>
                          <FormControlLabel
                            control={<Checkbox checked={motivation.selected} />}
                            label="Select this motivation"
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box mt={3} textAlign="center">
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
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
          <Box>
            {copyVariations.length === 0 && processing ? (
              <Box textAlign="center" py={3}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography>Generating copy variations...</Typography>
              </Box>
            ) : copyVariations.length > 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom>Select Copy Variations</Typography>
                <Grid container spacing={2}>
                  {copyVariations.map((copy) => (
                    <Grid xs={12} key={copy.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: copy.selected ? 2 : 1,
                          borderColor: copy.selected ? 'primary.main' : 'divider',
                        }}
                        onClick={() => handleSelectCopy(copy.id)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Chip label={copy.platform} color="secondary" size="small" />
                            <FormControlLabel
                              control={<Checkbox checked={copy.selected} />}
                              label="Select"
                            />
                          </Box>
                          <Typography variant="body1">{copy.text}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box mt={3} textAlign="center">
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
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
          <Box>
            <Typography variant="h6" gutterBottom>Choose Your Assets</Typography>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Use Existing Assets</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Select from your asset library
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      Browse Asset Library
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Generate New Assets</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Create AI-generated images and videos
                    </Typography>
                    <Button variant="contained" fullWidth startIcon={<AutoAwesome />}>
                      Generate Assets
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleNext}
              >
                Continue to Template Selection
              </Button>
            </Box>
          </Box>
        );

      case 4: // Pick Template
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Video Template</Typography>
            <Grid container spacing={2}>
              {['Modern Slideshow', 'Dynamic Promo', 'Social Story', 'Product Showcase'].map((template, index) => (
                <Grid xs={12} md={6} key={template}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedTemplate === template ? 2 : 1,
                      borderColor: selectedTemplate === template ? 'primary.main' : 'divider',
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <VideoLibrary color="primary" />
                        <Box>
                          <Typography variant="h6">{template}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Perfect for {briefData?.platforms.join(', ')} campaigns
                          </Typography>
                        </Box>
                        {selectedTemplate === template && <CheckCircle color="primary" />}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
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
          <Box>
            <Typography variant="h6" gutterBottom>Content Matrix Configuration</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your content matrix will be populated with the selected motivations, copy, and assets.
            </Alert>
            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Motivations</Typography>
                    <Typography variant="body2">
                      {motivations.filter(m => m.selected).length} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Copy Variations</Typography>
                    <Typography variant="body2">
                      {copyVariations.filter(c => c.selected).length} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Template</Typography>
                    <Typography variant="body2">
                      {selectedTemplate || 'None selected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleNext}
              >
                Ready for Rendering
              </Button>
            </Box>
          </Box>
        );

      case 6: // Ready to Render
        return (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>Ready to Render!</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your content is configured and ready to be sent to Creatomate for rendering.
            </Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Summary:</Typography>
              <Typography variant="body2">
                • Brief: {briefData?.title}<br/>
                • Motivations: {motivations.filter(m => m.selected).length} selected<br/>
                • Copy: {copyVariations.filter(c => c.selected).length} variations<br/>
                • Template: {selectedTemplate}<br/>
                • Platforms: {briefData?.platforms.join(', ')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleComplete}
            >
              Send to Creatomate for Rendering
            </Button>
          </Box>
        );

      default:
        return (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              {workflowSteps[step]?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {workflowSteps[step]?.description}
            </Typography>
            <Button variant="contained" onClick={handleNext}>
              Continue to Next Step
            </Button>
          </Box>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Brief to Execution Workflow</Typography>
          <IconButton onClick={onClose} aria-label="Close dialog">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {workflowSteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel icon={step.icon}>
                  <Typography variant="caption">{step.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ minHeight: 400, width: '100%', overflow: 'auto', maxHeight: '70vh' }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        {activeStep === workflowSteps.length - 1 ? (
          <Button variant="contained" onClick={handleComplete}>
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
    <Box sx={{ width: '100%', maxWidth: '100%', p: 1 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Review & Edit Brief Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review the parsed content below and make any necessary adjustments before proceeding to generate motivations.
      </Typography>
      
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
          </Grid>
          
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Brief Title"
              value={typeof editedData.title === 'string' ? editedData.title : String(editedData.title || '')}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Industry"
              value={editedData.industry || ''}
              onChange={(e) => handleFieldChange('industry', e.target.value)}
              variant="outlined"
              placeholder="e.g., Technology, Healthcare, Retail"
            />
          </Grid>
          
          <Grid xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Objective"
              value={typeof editedData.objective === 'string' ? editedData.objective : String(editedData.objective || '')}
              onChange={(e) => handleFieldChange('objective', e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Target Audience"
              value={typeof editedData.targetAudience === 'string' ? editedData.targetAudience : String(editedData.targetAudience || '')}
              onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Value Proposition"
              value={typeof editedData.valueProposition === 'string' ? editedData.valueProposition || '' : String(editedData.valueProposition || '')}
              onChange={(e) => handleFieldChange('valueProposition', e.target.value)}
              variant="outlined"
              placeholder="What unique value does your product/service offer?"
            />
          </Grid>
          
          {/* Product & Service Details */}
          <Grid xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Product & Service Details</Typography>
          </Grid>
          
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Product/Service Description"
              value={editedData.product || ''}
              onChange={(e) => handleFieldChange('product', e.target.value)}
              variant="outlined"
              placeholder="Describe your main product or service"
            />
          </Grid>
          
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Service Offering"
              value={editedData.service || ''}
              onChange={(e) => handleFieldChange('service', e.target.value)}
              variant="outlined"
              placeholder="Additional services or support offered"
            />
          </Grid>
          
          {/* Campaign Details */}
          <Grid xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Campaign Details</Typography>
          </Grid>
          
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Budget"
              value={editedData.budget}
              onChange={(e) => handleFieldChange('budget', e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Timeline"
              value={editedData.timeline}
              onChange={(e) => handleFieldChange('timeline', e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Brand Guidelines"
              value={editedData.brandGuidelines || ''}
              onChange={(e) => handleFieldChange('brandGuidelines', e.target.value)}
              variant="outlined"
              placeholder="Key brand guidelines to follow"
            />
          </Grid>
          
          {/* Key Messages */}
          <Grid xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Key Messages</Typography>
            {editedData.keyMessages.map((message, index) => (
              <Box key={index} display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  label={`Key Message ${index + 1}`}
                  value={message}
                  onChange={(e) => handleArrayFieldChange('keyMessages', index, e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  onClick={() => handleRemoveArrayItem('keyMessages', index)}
                  color="error"
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddArrayItem('keyMessages')}
              size="small"
            >
              Add Key Message
            </Button>
          </Grid>
          
          {/* Platforms */}
          <Grid xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Platforms</Typography>
            {editedData.platforms.map((platform, index) => (
              <Box key={index} display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  label={`Platform ${index + 1}`}
                  value={platform}
                  onChange={(e) => handleArrayFieldChange('platforms', index, e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  onClick={() => handleRemoveArrayItem('platforms', index)}
                  color="error"
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddArrayItem('platforms')}
              size="small"
            >
              Add Platform
            </Button>
          </Grid>
          
          {/* Competitors */}
          <Grid xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Competitors (Optional)</Typography>
            {(editedData.competitors || []).map((competitor, index) => (
              <Box key={index} display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  label={`Competitor ${index + 1}`}
                  value={competitor}
                  onChange={(e) => {
                    const competitors = editedData.competitors || [];
                    const updated = [...competitors];
                    updated[index] = e.target.value;
                    handleFieldChange('competitors', updated);
                  }}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  onClick={() => {
                    const competitors = editedData.competitors || [];
                    const updated = competitors.filter((_, i) => i !== index);
                    handleFieldChange('competitors', updated);
                  }}
                  color="error"
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const competitors = editedData.competitors || [];
                handleFieldChange('competitors', [...competitors, '']);
              }}
              size="small"
            >
              Add Competitor
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<Clear />}
        >
          Reset to Original
        </Button>
        <Button
          variant="contained"
          onClick={onProceed}
          startIcon={<ArrowForward />}
          size="large"
        >
          Confirm & Generate Motivations
        </Button>
      </Box>
    </Box>
  );
};