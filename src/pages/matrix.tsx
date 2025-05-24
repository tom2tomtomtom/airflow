import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Videocam as VideoIcon,
  Audiotrack as AudiotrackIcon,
  ColorLens as ColorLensIcon,
  Link as LinkIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';

// Define types
interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'color' | 'link';
  required: boolean;
  description: string;
}

interface Template {
  id: string;
  name: string;
  platform: string;
  aspectRatio: string;
  description: string;
  thumbnail: string;
  dateCreated: string;
  lastModified: string;
  category: string;
  industry: string;
  contentType: string;
  dimensions: string;
  recommendedUsage: string;
  usageCount: number;
  performance?: {
    views: number;
    engagement: number;
    conversion: number;
    score: number;
  };
  dynamicFields: DynamicField[];
  isCreatomate: boolean;
  creatomateId: string;
}

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  description: string;
  tags: string[];
  categories: string[];
  dateAdded: string;
  dateModified: string;
  isFavorite: boolean;
  metadata: {
    fileSize: string;
    dimensions?: string;
    duration?: string;
    format: string;
    creator: string;
    source: string;
    license: string;
    usageRights: string;
    expirationDate?: string;
  };
  performance?: {
    views: number;
    engagement: number;
    conversion: number;
    score: number;
  };
}

interface FieldAssignment {
  fieldId: string;
  assetId?: string;
  value?: string;
  status: 'empty' | 'in-progress' | 'completed';
}

// Mock data for templates
const mockTemplates: Template[] = [
  {
    id: 't1',
    name: 'Instagram Story',
    platform: 'Instagram',
    aspectRatio: '9:16',
    description: 'Vertical template optimized for Instagram Stories with dynamic text and image placement',
    thumbnail: '/instagram-story.jpg',
    dateCreated: '2023-04-15',
    lastModified: '2023-05-01',
    category: 'Social Media',
    industry: 'Health & Fitness',
    contentType: 'Story',
    dimensions: '1080x1920',
    recommendedUsage: 'Brand awareness, product showcases, behind-the-scenes content',
    usageCount: 245,
    performance: {
      views: 12500,
      engagement: 8.7,
      conversion: 3.2,
      score: 85
    },
    dynamicFields: [
      {
        id: 'df1',
        name: 'Headline',
        type: 'text',
        required: true,
        description: 'Main headline text (max 40 characters)'
      },
      {
        id: 'df2',
        name: 'Background Image',
        type: 'image',
        required: true,
        description: 'Full screen background image (1080x1920)'
      },
      {
        id: 'df3',
        name: 'Call to Action',
        type: 'text',
        required: false,
        description: 'Optional call to action text'
      }
    ],
    isCreatomate: true,
    creatomateId: 'crt-123456'
  },
  {
    id: 't2',
    name: 'Facebook Post',
    platform: 'Facebook',
    aspectRatio: '1:1',
    description: 'Square template for Facebook feed posts with text overlay and product image',
    thumbnail: '/facebook-post.jpg',
    dateCreated: '2023-04-10',
    lastModified: '2023-04-28',
    category: 'Social Media',
    industry: 'E-commerce',
    contentType: 'Post',
    dimensions: '1080x1080',
    recommendedUsage: 'Product promotions, announcements, engagement posts',
    usageCount: 189,
    performance: {
      views: 8700,
      engagement: 5.2,
      conversion: 2.1,
      score: 72
    },
    dynamicFields: [
      {
        id: 'df1',
        name: 'Product Image',
        type: 'image',
        required: true,
        description: 'Main product image (1:1 ratio recommended)'
      },
      {
        id: 'df2',
        name: 'Headline',
        type: 'text',
        required: true,
        description: 'Main headline text (max 60 characters)'
      },
      {
        id: 'df3',
        name: 'Description',
        type: 'text',
        required: true,
        description: 'Product description (max 120 characters)'
      },
      {
        id: 'df4',
        name: 'Price',
        type: 'text',
        required: false,
        description: 'Product price'
      },
      {
        id: 'df5',
        name: 'Background Color',
        type: 'color',
        required: false,
        description: 'Background color for the post'
      }
    ],
    isCreatomate: true,
    creatomateId: 'crt-234567'
  },
  {
    id: 't3',
    name: 'YouTube Thumbnail',
    platform: 'YouTube',
    aspectRatio: '16:9',
    description: 'Thumbnail template for YouTube videos with text overlay and background image',
    thumbnail: '/youtube-thumbnail.jpg',
    dateCreated: '2023-04-05',
    lastModified: '2023-04-20',
    category: 'Video',
    industry: 'Education',
    contentType: 'Thumbnail',
    dimensions: '1280x720',
    recommendedUsage: 'Video thumbnails, course previews',
    usageCount: 156,
    performance: {
      views: 9500,
      engagement: 6.8,
      conversion: 3.5,
      score: 80
    },
    dynamicFields: [
      {
        id: 'df1',
        name: 'Background Image',
        type: 'image',
        required: true,
        description: 'Background image (16:9 ratio)'
      },
      {
        id: 'df2',
        name: 'Title Text',
        type: 'text',
        required: true,
        description: 'Main title text (max 50 characters)'
      },
      {
        id: 'df3',
        name: 'Subtitle',
        type: 'text',
        required: false,
        description: 'Subtitle or additional text'
      },
      {
        id: 'df4',
        name: 'Logo',
        type: 'image',
        required: false,
        description: 'Channel or brand logo'
      }
    ],
    isCreatomate: true,
    creatomateId: 'crt-345678'
  }
];

// Matrix Page Component
const MatrixPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { activeClient: selectedClient } = useClient();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fieldAssignments, setFieldAssignments] = useState<Record<string, FieldAssignment>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize field assignments when template is selected
    if (selectedTemplate) {
      const initialAssignments: Record<string, FieldAssignment> = {};
      selectedTemplate.dynamicFields.forEach(field => {
        initialAssignments[field.id] = {
          fieldId: field.id,
          status: 'empty'
        };
      });
      setFieldAssignments(initialAssignments);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleFieldUpdate = (fieldId: string, value: string | undefined, assetId?: string) => {
    setFieldAssignments(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value,
        assetId,
        status: value || assetId ? 'completed' : 'empty'
      }
    }));
  };

  const handleSaveMatrix = async () => {
    setLoading(true);
    try {
      // Save matrix logic here
      console.log('Saving matrix:', { selectedTemplate, fieldAssignments });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Error saving matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextFieldsIcon />;
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      case 'audio':
        return <AudiotrackIcon />;
      case 'color':
        return <ColorLensIcon />;
      case 'link':
        return <LinkIcon />;
      default:
        return <TextFieldsIcon />;
    }
  };

  const filteredTemplates = mockTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Matrix Editor - Airwave</title>
      </Head>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Matrix Editor
        </Typography>

        <Grid container spacing={3}>
          {/* Template Selection */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom>
                Select Template
              </Typography>
              
              <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      border: selectedTemplate?.id === template.id ? 2 : 0,
                      borderColor: 'primary.main',
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        {template.name}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip label={template.platform} size="small" />
                        <Chip label={template.aspectRatio} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {template.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Field Assignment */}
          <Grid item xs={12} md={8}>
            {selectedTemplate ? (
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h5">
                      {selectedTemplate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTemplate.platform} • {selectedTemplate.dimensions}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveMatrix}
                    disabled={loading}
                  >
                    Save Matrix
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Dynamic Fields
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Field</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Value/Asset</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTemplate.dynamicFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getFieldIcon(field.type)}
                              <Box>
                                <Typography variant="body1">
                                  {field.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {field.description}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={field.type} size="small" />
                          </TableCell>
                          <TableCell>
                            {field.required ? (
                              <Chip label="Required" size="small" color="error" />
                            ) : (
                              <Chip label="Optional" size="small" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell>
                            {field.type === 'text' ? (
                              <TextField
                                size="small"
                                fullWidth
                                value={fieldAssignments[field.id]?.value || ''}
                                onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                                placeholder="Enter text..."
                              />
                            ) : field.type === 'color' ? (
                              <TextField
                                size="small"
                                type="color"
                                value={fieldAssignments[field.id]?.value || '#000000'}
                                onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                              />
                            ) : (
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {/* Open asset picker */}}
                              >
                                Select {field.type}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fieldAssignments[field.id]?.status || 'empty'}
                              size="small"
                              color={
                                fieldAssignments[field.id]?.status === 'completed'
                                  ? 'success'
                                  : fieldAssignments[field.id]?.status === 'in-progress'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a template to begin creating your matrix
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default MatrixPage;
