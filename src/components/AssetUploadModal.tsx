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
  Alert,
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
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Simulate success
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setFiles([]);
        onUploadComplete?.();
        onClose();
        
        // Show success notification (mock)
        console.log(`Successfully uploaded ${files.length} file(s)`);
      }, 500);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      console.error('Upload failed:', error);
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