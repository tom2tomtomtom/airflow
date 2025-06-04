import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  CloudUpload,
  Close,
  InsertDriveFile,
  Description,
  PictureAsPdf,
  Article,
  CheckCircle,
  AutoAwesome,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNotification } from '@/contexts/NotificationContext';

interface BriefUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (brief: any) => void;
}

interface FilePreview {
  file: File;
  preview?: string;
  type: string;
  size: string;
}

const steps = [
  'Upload Brief Document',
  'AI Processing',
  'Review & Confirm'
];

export const BriefUploadModal: React.FC<BriefUploadModalProps> = ({
  open,
  onClose,
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { showNotification } = useNotification();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PictureAsPdf color="error" />;
    if (type.includes('word') || type.includes('document')) return <Description color="primary" />;
    if (type.includes('text')) return <Article color="info" />;
    return <InsertDriveFile />;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      type: file.type,
      size: formatFileSize(file.size),
    }));
    setFiles(newFiles);
    setActiveStep(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', files[0].file);
      formData.append('name', files[0].file.name);
      formData.append('description', 'Uploaded brief document');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/briefs/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setActiveStep(1);
        showNotification('Brief uploaded successfully!', 'success');
        
        // Start AI processing
        setTimeout(() => {
          handleAIProcessing(result.brief);
        }, 1000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAIProcessing = async (brief: any) => {
    setProcessing(true);
    
    try {
      // Simulate AI processing
      setTimeout(() => {
        const mockExtractedData = {
          title: files[0]?.file.name.replace(/\.[^/.]+$/, '') || 'Campaign Brief',
          objective: 'Increase brand awareness and drive engagement through strategic content marketing',
          targetAudience: 'Young professionals aged 25-40 interested in technology and innovation',
          keyMessages: [
            'Innovation drives success',
            'Quality and reliability matter',
            'Customer-centric approach'
          ],
          platforms: ['Instagram', 'LinkedIn', 'Facebook'],
          budget: '$50,000',
          timeline: '3 months',
          tone: 'Professional yet approachable',
          deliverables: ['Social media posts', 'Blog articles', 'Video content']
        };
        
        setExtractedData(mockExtractedData);
        setProcessing(false);
        setActiveStep(2);
        showNotification('AI processing completed!', 'success');
      }, 3000);
    } catch (error) {
      console.error('Processing error:', error);
      showNotification('AI processing failed. Please try again.', 'error');
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData && onUploadComplete) {
      onUploadComplete(extractedData);
    }
    handleClose();
  };

  const handleClose = () => {
    setFiles([]);
    setUploading(false);
    setProcessing(false);
    setUploadProgress(0);
    setActiveStep(0);
    setExtractedData(null);
    onClose();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome color="primary" />
          Upload Campaign Brief
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={uploading || processing}
          sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="Icon button">          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>Upload Brief Document</StepLabel>
            <StepContent>
              {files.length === 0 ? (
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    or click to browse files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports: PDF, Word (.docx), Text (.txt, .md) • Max 10MB
                  </Typography>
                </Box>
              ) : (
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.file.name}
                        secondary={`${file.size} • ${file.type}`}
                      />
                      <IconButton onClick={() => removeFile(index)} aria-label="Icon button" size="small">
                        <Close />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {files.length > 0 && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading}
                    fullWidth
                   data-testid="upload-button">
                    {uploading ? 'Uploading...' : 'Upload & Process'}
                  </Button>
                  {uploading && (
                    <Box mt={1}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="caption" color="text.secondary">
                        {uploadProgress}% uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </StepContent>
          </Step>

          <Step>
            <StepLabel>AI Processing</StepLabel>
            <StepContent>
              {processing ? (
                <Box textAlign="center" py={3}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    AI is analyzing your brief and extracting key information...
                  </Typography>
                </Box>
              ) : (
                <Alert severity="success" icon={<CheckCircle />}>
                  Brief processed successfully! Key information extracted.
                </Alert>
              )}
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Review & Confirm</StepLabel>
            <StepContent>
              {extractedData && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Extracted Information
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip label={`Objective: ${extractedData.objective.substring(0, 30)}...`} />
                    <Chip label={`Audience: ${extractedData.targetAudience.substring(0, 30)}...`} />
                    <Chip label={`Budget: ${extractedData.budget}`} />
                    <Chip label={`Timeline: ${extractedData.timeline}`} />
                  </Box>
                  <Alert severity="info">
                    Review the extracted information. You can edit details after confirmation.
                  </Alert>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading || processing}>
          Cancel
        </Button>
        {activeStep === 2 && extractedData && (
          <Button variant="contained" onClick={handleConfirm}>
            Confirm & Create Brief
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
