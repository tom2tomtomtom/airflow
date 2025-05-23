import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Audiotrack as AudiotrackIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';

// Types
interface Template {
  id: string;
  name: string;
  description: string;
  platform: string;
  aspect_ratio: string;
  dynamicFields: DynamicField[];
  created_at: string;
  updated_at: string;
}

interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'color' | 'link' | 'any';
  required: boolean;
  description: string;
}

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  metadata: {
    fileSize: string;
    dimensions?: string;
    duration?: string;
  };
  tags?: string[];
  isFavorite: boolean;
  dateCreated: string;
}

interface FieldAssignment {
  id: string;
  fieldId: string;
  templateId: string;
  value?: string;
  assetId?: string;
  status: 'empty' | 'in-progress' | 'completed';
}

interface CurrentField {
  templateId: string;
  fieldId: string;
}

// Mock data
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Instagram Post Template',
    description: 'Standard Instagram post template',
    platform: 'Instagram',
    aspect_ratio: '1:1',
    dynamicFields: [
      {
        id: 'field-1',
        name: 'Main Image',
        type: 'image',
        required: true,
        description: 'Primary image for the post',
      },
      {
        id: 'field-2',
        name: 'Caption Text',
        type: 'text',
        required: true,
        description: 'Main caption text',
      },
      {
        id: 'field-3',
        name: 'Background Music',
        type: 'audio',
        required: false,
        description: 'Optional background audio',
      },
    ],
    created_at: '2023-05-15T10:30:00Z',
    updated_at: '2023-05-15T10:30:00Z',
  },
];

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Product Hero Image',
    type: 'image',
    url: '/mock-images/product-hero.jpg',
    metadata: {
      fileSize: '2.3 MB',
      dimensions: '1920x1080',
    },
    tags: ['product', 'hero', 'lifestyle'],
    isFavorite: true,
    dateCreated: '2023-05-15T09:00:00Z',
  },
  {
    id: 'asset-2',
    name: 'Brand Video',
    type: 'video',
    url: '/mock-videos/brand-video.mp4',
    metadata: {
      fileSize: '15.7 MB',
      duration: '0:30',
    },
    tags: ['brand', 'promotional'],
    isFavorite: false,
    dateCreated: '2023-05-14T14:30:00Z',
  },
];

const MatrixPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeClient, loading: clientLoading } = useClient();

  // State
  const [templates] = useState<Template[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fieldAssignments, setFieldAssignments] = useState<FieldAssignment[]>([]);
  const [assets] = useState<Asset[]>(mockAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAssetDialog, setOpenAssetDialog] = useState(false);
  const [currentField, setCurrentField] = useState<CurrentField | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Initialize with first template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  // Get field type icon
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon fontSize="small" />;
      case 'video':
        return <VideoIcon fontSize="small" />;
      case 'audio':
        return <AudiotrackIcon fontSize="small" />;
      default:
        return <EditIcon fontSize="small" />;
    }
  };

  // Handle text field changes
  const handleTextFieldChange = (fieldId: string, value: string) => {
    if (!selectedTemplate) return;

    setFieldAssignments(prev => {
      const existing = prev.find(fa => fa.fieldId === fieldId && fa.templateId === selectedTemplate.id);
      
      if (existing) {
        return prev.map(fa => 
          fa.id === existing.id
            ? { ...fa, value, status: value.trim() ? 'completed' : 'empty' }
            : fa
        );
      } else {
        return [...prev, {
          id: `assignment-${Date.now()}`,
          fieldId,
          templateId: selectedTemplate.id,
          value,
          status: value.trim() ? 'completed' : 'empty',
        }];
      }
    });
  };

  // Handle opening asset dialog
  const handleOpenAssetDialog = (fieldId: string) => {
    if (!selectedTemplate) return;
    
    setCurrentField({
      templateId: selectedTemplate.id,
      fieldId,
    });
    setOpenAssetDialog(true);
  };

  // Handle asset selection
  const handleSelectAsset = (assetId: string) => {
    if (!currentField || !selectedTemplate) return;

    setFieldAssignments(prev => {
      const existing = prev.find(fa => 
        fa.fieldId === currentField.fieldId && fa.templateId === currentField.templateId
      );
      
      if (existing) {
        return prev.map(fa => 
          fa.id === existing.id
            ? { ...fa, assetId, status: 'completed' }
            : fa
        );
      } else {
        return [...prev, {
          id: `assignment-${Date.now()}`,
          fieldId: currentField.fieldId,
          templateId: currentField.templateId,
          assetId,
          status: 'completed',
        }];
      }
    });

    setOpenAssetDialog(false);
    setCurrentField(null);
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter assets based on search
  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading || clientLoading || !activeClient) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Content Matrix | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Content Matrix">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Content Matrix
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign assets and content to template fields for content generation
          </Typography>
        </Box>

        {selectedTemplate && (
          <>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTemplate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedTemplate.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={selectedTemplate.platform} size="small" />
                <Chip label={selectedTemplate.aspect_ratio} size="small" variant="outlined" />
              </Box>
            </Paper>

            <Paper sx={{ mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Content</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTemplate.dynamicFields.map(field => {
                      const fieldAssignment = fieldAssignments.find(fa => 
                        fa.fieldId === field.id && fa.templateId === selectedTemplate.id
                      );
                      const asset = fieldAssignment?.assetId ? 
                        assets.find(a => a.id === fieldAssignment.assetId) : null;

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {field.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {field.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getFieldTypeIcon(field.type)}
                              label={field.type}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={field.required ? 'Required' : 'Optional'}
                              size="small"
                              color={field.required ? 'error' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {['image', 'video', 'audio'].includes(field.type) ? (
                              asset ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box>
                                    <Typography variant="body2">
                                      {asset.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {asset.metadata.fileSize} • {asset.metadata.dimensions || asset.metadata.duration}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                    onClick={() => handleOpenAssetDialog(field.id)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Button
                                  variant="outlined"
                                  startIcon={getFieldTypeIcon(field.type)}
                                  onClick={() => handleOpenAssetDialog(field.id)}
                                >
                                  Select {field.type}
                                </Button>
                              )
                            ) : (
                              <TextField
                                fullWidth
                                size="small"
                                placeholder={`Enter ${field.type}...`}
                                value={fieldAssignment?.value || ''}
                                onChange={(e) => handleTextFieldChange(field.id, e.target.value)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fieldAssignment?.status === 'completed' ? 'Completed' :
                                    fieldAssignment?.status === 'in-progress' ? 'In Progress' : 'Empty'}
                              color={fieldAssignment?.status === 'completed' ? 'success' :
                                    fieldAssignment?.status === 'in-progress' ? 'primary' : 'default'}
                              size="small"
                              icon={fieldAssignment?.status === 'completed' ? <CheckIcon /> :
                                    fieldAssignment?.status === 'in-progress' ? <RefreshIcon /> : <CloseIcon />}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}

        {/* Asset Selection Dialog */}
        <Dialog
          open={openAssetDialog}
          onClose={() => setOpenAssetDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Select Asset
            {currentField && selectedTemplate && (
              <Typography variant="body2" color="text.secondary">
                {selectedTemplate.name} - {selectedTemplate.dynamicFields.find(f => f.id === currentField.fieldId)?.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, mt: 1 }}>
              <TextField
                placeholder="Search assets..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Filter chips */}
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                Filter by:
              </Typography>
              {['image', 'video', 'audio'].map((type) => {
                // Only show relevant filter based on field type
                if (currentField && selectedTemplate) {
                  const field = selectedTemplate.dynamicFields.find(f => f.id === currentField.fieldId);
                  if (field && field.type !== type && field.type !== 'any') return null;
                }

                const icon = type === 'image' ? <ImageIcon fontSize="small" /> :
                            type === 'video' ? <VideoIcon fontSize="small" /> :
                            <AudiotrackIcon fontSize="small" />;

                return (
                  <Chip
                    key={type}
                    icon={icon}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      // Filter logic would go here in a real app
                    }}
                  />
                );
              })}

              <Chip
                label="Favorites"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  // Filter by favorites logic
                }}
              />

              <Chip
                label="Recent"
                variant="outlined"
                onClick={() => {
                  // Filter by recent logic
                }}
              />
            </Box>

            {filteredAssets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No assets found matching your search criteria.
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setSearchQuery('')}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredAssets
                  .filter(asset => {
                    if (!currentField) return true;
                    const field = selectedTemplate?.dynamicFields.find(f => f.id === currentField.fieldId);
                    if (!field) return true;

                    // Filter assets by type
                    if (field.type === 'image') return asset.type === 'image';
                    if (field.type === 'video') return asset.type === 'video';
                    if (field.type === 'audio') return asset.type === 'audio';
                    return true;
                  })
                  .map(asset => (
                    <Grid item xs={12} sm={6} md={4} key={asset.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.5)'
                          }
                        }}
                        onClick={() => handleSelectAsset(asset.id)}
                      >
                        {asset.type === 'image' && (
                          <Box
                            component="img"
                            src={asset.url}
                            alt={asset.name}
                            sx={{
                              width: '100%',
                              height: 140,
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        {asset.type === 'video' && (
                          <Box
                            sx={{
                              width: '100%',
                              height: 140,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}
                          >
                            <VideoIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                          </Box>
                        )}
                        {asset.type === 'audio' && (
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}
                          >
                            <AudiotrackIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: '80%' }}>
                              {asset.name}
                            </Typography>
                            {asset.isFavorite && (
                              <ThumbUpIcon fontSize="small" color="primary" />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} • {asset.metadata.fileSize}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            {asset.metadata.dimensions || asset.metadata.duration || ''}
                          </Typography>
                          {asset.tags && asset.tags.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {asset.tags.slice(0, 2).map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                              {asset.tags && asset.tags.length > 2 && (
                                <Chip
                                  label={`+${asset.tags.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssetDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                // In a real app, this would open the asset upload dialog
                alert('Upload asset functionality would go here');
              }}
            >
              Upload New Asset
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default MatrixPage;