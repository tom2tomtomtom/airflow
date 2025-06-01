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
  Grid,
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
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState(briefWorkflowSteps);

  const { showNotification } = useNotification();

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
    
    // Simulate AI processing
    setTimeout(() => {
      const mockBriefData: BriefData = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        objective: 'Increase brand awareness and drive engagement through strategic content marketing',
        targetAudience: 'Young professionals aged 25-40 interested in technology',
        keyMessages: ['Innovation drives success', 'Quality matters', 'Customer-first approach'],
        platforms: ['Instagram', 'LinkedIn', 'Facebook'],
        budget: '$50,000',
        timeline: '3 months',
      };
      
      setBriefData(mockBriefData);
      setProcessing(false);
      showNotification('Brief processed successfully!', 'success');
      setActiveStep(1);
    }, 2000);
  };

  // Step 2: Generate Motivations
  const handleGenerateMotivations = () => {
    setProcessing(true);
    
    setTimeout(() => {
      const mockMotivations: Motivation[] = [
        { id: '1', title: 'Emotional Connection', description: 'Build trust through authentic storytelling', score: 92, selected: false },
        { id: '2', title: 'Social Proof', description: 'Leverage customer testimonials and reviews', score: 88, selected: false },
        { id: '3', title: 'Innovation Focus', description: 'Highlight cutting-edge features and benefits', score: 85, selected: false },
        { id: '4', title: 'Community Building', description: 'Foster sense of belonging and shared values', score: 82, selected: false },
      ];
      
      setMotivations(mockMotivations);
      setProcessing(false);
      showNotification('Motivations generated!', 'success');
    }, 2000);
  };

  const handleSelectMotivation = (id: string) => {
    setMotivations(motivations.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const handleNextFromMotivations = () => {
    const selectedCount = motivations.filter(m => m.selected).length;
    if (selectedCount === 0) {
      showNotification('Please select at least one motivation', 'warning');
      return;
    }
    setActiveStep(2);
    handleGenerateCopy();
  };

  // Step 3: Generate Copy
  const handleGenerateCopy = () => {
    setProcessing(true);
    
    setTimeout(() => {
      const mockCopy: CopyVariation[] = [
        { id: '1', text: 'Transform your business with innovative solutions that put customers first. Join thousands who trust our quality.', platform: 'LinkedIn', selected: false },
        { id: '2', text: '🚀 Innovation meets quality! Discover why customers choose us for their success journey. #Innovation #Quality', platform: 'Instagram', selected: false },
        { id: '3', text: 'Ready to elevate your business? Our customer-first approach and innovative solutions deliver real results.', platform: 'Facebook', selected: false },
      ];
      
      setCopyVariations(mockCopy);
      setProcessing(false);
      showNotification('Copy variations generated!', 'success');
    }, 2000);
  };

  const handleSelectCopy = (id: string) => {
    setCopyVariations(copyVariations.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const handleNextFromCopy = () => {
    const selectedCount = copyVariations.filter(c => c.selected).length;
    if (selectedCount === 0) {
      showNotification('Please select at least one copy variation', 'warning');
      return;
    }
    setActiveStep(3);
  };

  // Navigation helpers
  const handleNext = () => {
    if (activeStep < workflowSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
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
            {!uploadedFile ? (
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
            ) : (
              <Box>
                {processing ? (
                  <Box textAlign="center" py={3}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Processing brief with AI...</Typography>
                  </Box>
                ) : briefData ? (
                  <Alert severity="success" icon={<CheckCircle />}>
                    <Typography variant="h6">Brief Processed Successfully!</Typography>
                    <Typography variant="body2">
                      Title: {briefData.title}<br/>
                      Objective: {briefData.objective.substring(0, 100)}...
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
                    <Grid item xs={12} md={6} key={motivation.id}>
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
                    <Grid item xs={12} key={copy.id}>
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
                  >
                    Proceed to Asset Selection
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6} key={template}>
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
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Motivations</Typography>
                    <Typography variant="body2">
                      {motivations.filter(m => m.selected).length} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Copy Variations</Typography>
                    <Typography variant="body2">
                      {copyVariations.filter(c => c.selected).length} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
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
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
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

        <Box sx={{ minHeight: 400 }}>
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 67032892723b6c3baa991a25bfc2a82ec06c4641
