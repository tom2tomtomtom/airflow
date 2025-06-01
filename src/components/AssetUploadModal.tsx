import { getErrorMessage } from '@/utils/errorUtils';
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
} from '@mui/material';
import {
  CloudUpload,
  Close,
  InsertDriveFile,
  Image as ImageIcon,
  VideoFile,
  AudioFile,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface AssetUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

interface FilePreview {
  file: File;
  preview: string;
  type: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon />;
  if (type.startsWith('video/')) return <VideoFile />;
  if (type.startsWith('audio/')) return <AudioFile />;
  return <InsertDriveFile />;
};

export const AssetUploadModal: React.FC<AssetUploadModalProps> = ({
  open,
  onClose,
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach((filePreview) => {
        formData.append('files', filePreview.file);
      });

      // Upload files with progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      // Start upload
      xhr.open('POST', '/api/assets/upload');
      xhr.send(formData);

      const result = await uploadPromise;
      
      // Success
      setUploading(false);
      setUploadProgress(0);
      setFiles([]);
      onUploadComplete?.();
      onClose();
      
      if (process.env.NODE_ENV === 'development') {

      
        console.log('Successfully uploaded files:', result);

      
      }
    } catch (error) {
    const message = getErrorMessage(error);
      setUploading(false);
      setUploadProgress(0);
      if (process.env.NODE_ENV === 'development') {

        console.error('Upload failed:', error);

      }
      alert('Upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth data-testid="upload-modal">
      <DialogTitle>
        Upload Assets
        <IconButton
          onClick={handleClose}
          disabled={uploading}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          data-testid="close-upload-modal"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          data-testid="dropzone"
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
          <input {...getInputProps()} data-testid="file-input" />
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or click to browse files
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports: Images (PNG, JPG, WebP), Videos (MP4, MOV), Audio (MP3, WAV)
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List dense>
              {files.map((filePreview, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <Close />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getFileIcon(filePreview.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={filePreview.file.name}
                    secondary={`${(filePreview.file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={uploading || files.length === 0}
          startIcon={uploading ? null : <CloudUpload />}
          data-testid="upload-files-button"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetUploadModal;