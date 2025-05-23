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
  Collapse,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Stack,
  Tab,
  Tabs,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Videocam as VideoIcon,
  Audiotrack as AudiotrackIcon,
  ColorLens as ColorLensIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  TrendingUp as TrendingUpIcon,
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
  value?: string;
  assetId?: string;
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

interface MatrixProject {
  id: string;
  name: string;
  description: string;
  dateCreated: string;
  lastModified: string;
  templates: Template[];
  fieldAssignments: Record<string, {
    templateId: string;
    fieldId: string;
    assetId?: string;
    value?: string;
    status: 'empty' | 'in-progress' | 'completed';
  }>;
}

// Mock data for templates (from templates page)
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
  }
];

// Mock data for assets (from assets page)
const mockAssets: Asset[] = [
  {
    id: 'a1',
    name: 'Product Hero Image',
    type: 'image',
    url: 'https://source.unsplash.com/random/800x600?product',
    description: 'Main product image for the weight loss program',
    tags: ['product', 'hero', 'client-provided'],
    categories: ['marketing', 'website'],
    dateAdded: '2023-05-01T10:30:00',
    dateModified: '2023-05-02T14:45:00',
    isFavorite: true,
    metadata: {
      fileSize: '2.4 MB',
      dimensions: '1920x1080',
      format: 'JPEG',
      creator: 'Jane Smith',
      source: 'Client Upload',
      license: 'Commercial Use',
      usageRights: 'Unlimited',
      expirationDate: '2024-05-01',
    },
    performance: {
      views: 1250,
      engagement: 4.8,
      conversion: 2.3,
      score: 78
    }
  },
  {
    id: 'a2',
    name: 'Workout Video',
    type: 'video',
    url: 'https://example.com/videos/workout.mp4',
    description: 'Demonstration of the 15-minute workout routine',
    tags: ['workout', 'fitness', 'demo'],
    categories: ['social', 'marketing'],
    dateAdded: '2023-05-03T09:15:00',
    dateModified: '2023-05-03T09:15:00',
    isFavorite: false,
    metadata: {
      fileSize: '45.8 MB',
      duration: '2:34',
      format: 'MP4',
      creator: 'Fitness Studio',
      source: 'Production Shoot',
      license: 'Commercial Use',
      usageRights: 'Unlimited',
    },
    performance: {
      views: 3450,
      engagement: 6.2,
      conversion: 3.1,
      score: 85
    }
  },
  {
    id: 'a3',
    name: 'Beach Workout Background',
    type: 'image',
    url: 'https://source.unsplash.com/random/1080x1920?beach,fitness',
    description: 'Woman doing yoga on a beach at sunset',
    tags: ['beach', 'yoga', 'sunset', 'fitness'],
    categories: ['social', 'backgrounds'],
    dateAdded: '2023-05-10T14:20:00',
    dateModified: '2023-05-10T14:20:00',
    isFavorite: true,
    metadata: {
      fileSize: '3.2 MB',
      dimensions: '1080x1920',
      format: 'JPEG',
      creator: 'Marketing Team',
      source: 'Unsplash',
      license: 'Commercial Use',
      usageRights: 'Unlimited',
    },
    performance: {
      views: 2150,
      engagement: 7.3,
      conversion: 4.1,
      score: 88
    }
  },
  {
    id: 'a4',
    name: 'Fitness Tracker Product Shot',
    type: 'image',
    url: 'https://source.unsplash.com/random/1080x1080?fitness,tracker,watch',
    description: 'Close-up of our new fitness tracker on wrist',
    tags: ['product', 'fitness tracker', 'wearable'],
    categories: ['product', 'e-commerce'],
    dateAdded: '2023-05-12T09:45:00',
    dateModified: '2023-05-12T10:15:00',
    isFavorite: true,
    metadata: {
      fileSize: '1.8 MB',
      dimensions: '1080x1080',
      format: 'JPEG',
      creator: 'Product Photography Team',
      source: 'Internal',
      license: 'Commercial Use',
      usageRights: 'Unlimited',
    },
    performance: {
      views: 1850,
      engagement: 5.9,
      conversion: 3.8,
      score: 82
    }
  },
  {
    id: 'a5',
    name: 'Motivational Workout Music',
    type: 'audio',
    url: 'https://example.com/audio/workout-mix.mp3',
    description: 'Upbeat workout mix for fitness videos',
    tags: ['audio', 'music', 'workout', 'motivation'],
    categories: ['audio', 'social'],
    dateAdded: '2023-05-08T16:30:00',
    dateModified: '2023-05-08T16:30:00',
    isFavorite: false,
    metadata: {
      fileSize: '12.4 MB',
      duration: '3:45',
      format: 'MP3',
      creator: 'Sound Studio',
      source: 'Licensed',
      license: 'Commercial Use',
      usageRights: 'Social Media Only',
      expirationDate: '2024-05-08',
    },
    performance: {
      views: 980,
      engagement: 4.2,
      conversion: 1.8,
      score: 70
    }
  },
  {
    id: 'a6',
    name: 'Gym Interior',
    type: 'image',
    url: 'https://source.unsplash.com/random/1200x800?gym,fitness,interior',
    description: 'Modern gym interior with equipment',
    tags: ['gym', 'interior', 'fitness', 'equipment'],
    categories: ['facilities', 'marketing'],
    dateAdded: '2023-05-05T11:20:00',
    dateModified: '2023-05-05T11:20:00',
    isFavorite: false,
    metadata: {
      fileSize: '2.7 MB',
      dimensions: '1200x800',
      format: 'JPEG',
      creator: 'Marketing Team',
      source: 'Unsplash',
      license: 'Commercial Use',
      usageRights: 'Unlimited',
    },
    performance: {
      views: 1120,
      engagement: 3.9,
      conversion: 1.5,
      score: 65
    }
  }
];

// Mock data for generated copy from the Generate page
const mockGeneratedCopy = {
  headlines: [
    "Transform Your Body This Summer",
    "Achieve Your Fitness Goals Today",
    "Unlock Your Full Potential",
    "The Ultimate Fitness Experience",
    "Your Journey to Better Health Starts Here"
  ],
  descriptions: [
    "Join our premium fitness program designed to help you reach your goals faster than ever before.",
    "Our expert trainers will guide you through personalized workouts tailored to your specific needs.",
    "Experience the difference with our state-of-the-art facilities and cutting-edge equipment.",
    "From beginners to advanced athletes, we have programs for everyone at every fitness level.",
    "Discover a supportive community that will motivate and inspire you every step of the way."
  ],
  callsToAction: [
    "Join Now",
    "Start Today",
    "Sign Up",
    "Learn More",
    "Get Started"
  ],
  productDescriptions: [
    "Our premium fitness tracker monitors your heart rate, steps, and sleep patterns with unmatched accuracy.",
    "Designed for comfort and durability, this fitness tracker is your perfect workout companion.",
    "Water-resistant and long-lasting battery make this the ideal tracker for any fitness enthusiast.",
    "Track your progress and achieve your goals with our easy-to-use fitness monitoring solution.",
    "Stay connected and motivated with real-time stats and personalized insights."
  ],
  prices: [
    "$99.99",
    "$149.99",
    "$129.99",
    "$199.99",
    "$89.99"
  ]
};

// Mock data for matrix projects
const mockMatrixProjects: MatrixProject[] = [
  {
    id: 'mp1',
    name: 'Summer Campaign',
    description: 'Summer fitness campaign across all platforms',
    dateCreated: '2023-05-15',
    lastModified: '2023-05-20',
    templates: [mockTemplates[0], mockTemplates[1]],
    fieldAssignments: {
      't1-df1': {
        templateId: 't1',
        fieldId: 'df1',
        value: 'Summer Fitness Challenge',
        status: 'completed'
      },
      't1-df2': {
        templateId: 't1',
        fieldId: 'df2',
        assetId: 'a1',
        status: 'completed'
      },
      't1-df3': {
        templateId: 't1',
        fieldId: 'df3',
        value: 'Join Now',
        status: 'completed'
      },
      't2-df1': {
        templateId: 't2',
        fieldId: 'df1',
        assetId: 'a1',
        status: 'completed'
      },
      't2-df2': {
        templateId: 't2',
        fieldId: 'df2',
        value: 'Transform Your Summer',
        status: 'completed'
      },
      't2-df3': {
        templateId: 't2',
        fieldId: 'df3',
        status: 'empty'
      },
      't2-df4': {
        templateId: 't2',
        fieldId: 'df4',
        status: 'empty'
      },
      't2-df5': {
        templateId: 't2',
        fieldId: 'df5',
        value: '#f5f5f5',
        status: 'completed'
      }
    }
  },
  {
    id: 'mp2',
    name: 'New Product Launch',
    description: 'Campaign for launching our new fitness tracker',
    dateCreated: '2023-05-10',
    lastModified: '2023-05-18',
    templates: [mockTemplates[0], mockTemplates[1]],
    fieldAssignments: {
      't1-df1': {
        templateId: 't1',
        fieldId: 'df1',
        value: 'Introducing FitTrack Pro',
        status: 'completed'
      },
      't1-df2': {
        templateId: 't1',
        fieldId: 'df2',
        status: 'empty'
      },
      't1-df3': {
        templateId: 't1',
        fieldId: 'df3',
        value: 'Pre-order Now',
        status: 'completed'
      },
      't2-df1': {
        templateId: 't2',
        fieldId: 'df1',
        status: 'empty'
      },
      't2-df2': {
        templateId: 't2',
        fieldId: 'df2',
        value: 'Track Your Progress Like Never Before',
        status: 'completed'
      },
      't2-df3': {
        templateId: 't2',
        fieldId: 'df3',
        value: 'The most advanced fitness tracker with AI-powered insights and 7-day battery life.',
        status: 'completed'
      },
      't2-df4': {
        templateId: 't2',
        fieldId: 'df4',
        value: '$149.99',
        status: 'completed'
      },
      't2-df5': {
        templateId: 't2',
        fieldId: 'df5',
        value: '#e0f7fa',
        status: 'completed'
      }
    }
  }
];

// Main component
const MatrixPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeClient, loading: clientLoading } = useClient();

  // State variables
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [openAssetDialog, setOpenAssetDialog] = useState(false);
  const [currentField, setCurrentField] = useState<{fieldId: string} | null>(null);
  const [fieldAssignments, setFieldAssignments] = useState<Record<string, {
    assetId?: string;
    value?: string;
    status: 'empty' | 'in-progress' | 'completed';
  }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAssets);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect to client creation if authenticated but no active client
  useEffect(() => {
    if (!clientLoading && isAuthenticated && !activeClient) {
      router.push('/create-client?first=true');
    }
  }, [activeClient, clientLoading, isAuthenticated, router]);

  // Set selected template based on URL query parameter and pre-populate with generated copy
  useEffect(() => {
    if (templateId && typeof templateId === 'string') {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);

        // Initialize field assignments for the template with generated copy
        const initialAssignments: Record<string, {
          assetId?: string;
          value?: string;
          status: 'empty' | 'in-progress' | 'completed';
        }> = {};

        template.dynamicFields.forEach(field => {
          // Pre-populate fields with generated copy based on field name and type
          let generatedValue: string | undefined;

          if (field.type === 'text') {
            // Match field name to appropriate content type
            const fieldNameLower = field.name.toLowerCase();

            if (fieldNameLower.includes('headline') || fieldNameLower.includes('title')) {
              // Use a headline
              generatedValue = mockGeneratedCopy.headlines[Math.floor(Math.random() * mockGeneratedCopy.headlines.length)];
            } else if (fieldNameLower.includes('description') || fieldNameLower.includes('body')) {
              // Use a description
              generatedValue = mockGeneratedCopy.descriptions[Math.floor(Math.random() * mockGeneratedCopy.descriptions.length)];
            } else if (fieldNameLower.includes('cta') || fieldNameLower.includes('call to action') || fieldNameLower.includes('button')) {
              // Use a call to action
              generatedValue = mockGeneratedCopy.callsToAction[Math.floor(Math.random() * mockGeneratedCopy.callsToAction.length)];
            } else if (fieldNameLower.includes('product')) {
              // Use a product description
              generatedValue = mockGeneratedCopy.productDescriptions[Math.floor(Math.random() * mockGeneratedCopy.productDescriptions.length)];
            } else if (fieldNameLower.includes('price')) {
              // Use a price
              generatedValue = mockGeneratedCopy.prices[Math.floor(Math.random() * mockGeneratedCopy.prices.length)];
            }
          } else if (field.type === 'color') {
            // Generate a random color
            const colors = ['#f5f5f5', '#e3f2fd', '#e8f5e9', '#fff8e1', '#fce4ec'];
            generatedValue = colors[Math.floor(Math.random() * colors.length)];
          }

          initialAssignments[field.id] = {
            value: generatedValue,
            status: generatedValue ? 'completed' : 'empty'
          };
        });

        setFieldAssignments(initialAssignments);
      }
    }
  }, [templateId, templates]);

  // Filter assets based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredAssets(filtered);
    } else {
      setFilteredAssets(assets);
    }
  }, [searchQuery, assets]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle opening the asset selection dialog
  const handleOpenAssetDialog = (fieldId: string) => {
    setCurrentField({ fieldId });
    setOpenAssetDialog(true);
  };

  // Handle asset selection
  const handleSelectAsset = (assetId: string) => {
    if (currentField) {
      const fieldId = currentField.fieldId;
      setFieldAssignments(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          assetId,
          status: 'completed'
        }
      }));
      setOpenAssetDialog(false);
    }
  };

  // Handle text field value change
  const handleTextFieldChange = (fieldId: string, value: string) => {
    setFieldAssignments(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value,
        status: value ? 'completed' : 'empty'
      }
    }));
  };

  // Get field type icon
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextFieldsIcon fontSize="small" />;
      case 'image':
        return <ImageIcon fontSize="small" />;
      case 'video':
        return <VideoIcon fontSize="small" />;
      case 'audio':
        return <AudiotrackIcon fontSize="small" />;
      case 'color':
        return <ColorLensIcon fontSize="small" />;
      case 'link':
        return <LinkIcon fontSize="small" />;
      default:
        return <TextFieldsIcon fontSize="small" />;
    }
  };

  // Get asset by ID
  const getAssetById = (assetId: string) => {
    return assets.find(asset => asset.id === assetId);
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const totalFields = Object.keys(fieldAssignments).length;
    const completedFields = Object.values(fieldAssignments).filter(
      field => field.status === 'completed'
    ).length;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  // Get template by ID
  const getTemplateById = (templateId: string) => {
    return templates.find(template => template.id === templateId);
  };

  // Get field by template ID and field ID
  const getFieldByIds = (templateId: string, fieldId: string) => {
    const template = getTemplateById(templateId);
    return template?.dynamicFields.find(field => field.id === fieldId);
  };

  // Loading state
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
        <title>Matrix | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Matrix">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Matrix
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign assets to template fields to create your content
          </Typography>
        </Box>

        {!selectedTemplate ? (
          // No template selected - show prompt
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Template Selected
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please select a template from the Templates page to create a matrix
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/templates')}
            >
              Go to Templates
            </Button>
          </Paper>
        ) : (
          // Template selected - show matrix
          <>
            {/* Template Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" component="h2" fontWeight={600}>
                  {selectedTemplate.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedTemplate.description}
                </Typography>
                <Box sx={{ display: 'flex', mt: 1 }}>
                  <Chip
                    label={selectedTemplate.platform}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={selectedTemplate.aspectRatio}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => window.open(`/preview?templateId=${selectedTemplate.id}`, '_blank')}
                >
                  Preview Template
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Save Matrix
                </Button>
              </Box>
            </Box>

            {/* Progress */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight="medium">
                  Completion: {calculateCompletionPercentage()}%
                </Typography>
                <Box sx={{ width: '70%', display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 4,
                      mr: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: `${calculateCompletionPercentage()}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        borderRadius: 4
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Object.values(fieldAssignments).filter(field => field.status === 'completed').length} / {Object.keys(fieldAssignments).length} fields
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Matrix Content */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Template Fields Matrix
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Assign assets and content to each template field
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="20%">Field</TableCell>
                      <TableCell width="15%">Type</TableCell>
                      <TableCell width="45%">Content</TableCell>
                      <TableCell width="20%">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTemplate.dynamicFields.map(field => {
                      const fieldAssignment = fieldAssignments[field.id];
                      const asset = fieldAssignment?.assetId ? getAssetById(fieldAssignment.assetId) : null;

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {field.name}
                              {field.required && (
                                <Chip
                                  label="Required"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {field.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getFieldTypeIcon(field.type)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {field.type === 'text' || field.type === 'color' ? (
                              <TextField
                                fullWidth
                                size="small"
                                placeholder={`Enter ${field.type}...`}
                                value={fieldAssignment?.value || ''}
                                onChange={(e) => handleTextFieldChange(field.id, e.target.value)}
                                type={field.type === 'color' ? 'color' : 'text'}
                              />
                            ) : field.type === 'image' || field.type === 'video' || field.type === 'audio' ? (
                              asset ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {field.type === 'image' && (
                                    <Box
                                      component="img"
                                      src={asset.url}
                                      alt={asset.name}
                                      sx={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        mr: 2
                                      }}
                                    />
                                  )}
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
              <TextField
                placeholder="Search projects..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ mr: 1 }}
                >
                  Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenNewProjectDialog(true)}
                >
                  New Matrix
                </Button>
              </Box>
            </Box>

            {/* Filters */}
            <Collapse in={showFilters}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={handleSortByChange}
                      >
                        <MenuItem value="lastModified">Last Modified</MenuItem>
                        <MenuItem value="dateCreated">Date Created</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="completion">Completion</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Template</InputLabel>
                      <Select
                        value={templateFilter}
                        label="Template"
                        onChange={handleTemplateFilterChange}
                      >
                        <MenuItem value="all">All Templates</MenuItem>
                        {templates.map(template => (
                          <MenuItem key={template.id} value={template.id}>
                            {template.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Completion</InputLabel>
                      <Select
                        value={completionFilter}
                        label="Completion"
                        onChange={handleCompletionFilterChange}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="complete">Complete</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="not-started">Not Started</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Collapse>

            {/* Project List */}
            <Grid container spacing={3}>
              {filteredProjects.map(project => (
                <Grid item xs={12} md={6} lg={4} key={project.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleSelectProject(project)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Templates:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {project.templates.map(template => (
                            <Chip
                              key={template.id}
                              label={template.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Last modified: {new Date(project.lastModified).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
                            {calculateCompletionPercentage(project)}%
                          </Typography>
                          <Box
                            sx={{
                              width: 40,
                              height: 4,
                              bgcolor: 'grey.300',
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${calculateCompletionPercentage(project)}%`,
                                height: '100%',
                                bgcolor: 'primary.main',
                                borderRadius: 2
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          // Matrix View (when a project is selected)
          <>
            {/* Project Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Button
                  variant="text"
                  onClick={() => setSelectedProject(null)}
                  sx={{ mb: 1 }}
                >
                  ← Back to Projects
                </Button>
                <Typography variant="h5" component="h2" fontWeight={600}>
                  {selectedProject.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedProject.description}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ mr: 1 }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>

            {/* Matrix Content */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Template Fields Matrix
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Assign assets and content to each template field
              </Typography>

              {selectedProject.templates.map(template => (
                <Box key={template.id} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {template.name}
                    </Typography>
                    <Chip
                      label={template.platform}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                    <Chip
                      label={template.aspectRatio}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="20%">Field</TableCell>
                          <TableCell width="15%">Type</TableCell>
                          <TableCell width="45%">Content</TableCell>
                          <TableCell width="20%">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {template.dynamicFields.map(field => {
                          const fieldKey = `${template.id}-${field.id}`;
                          const fieldAssignment = selectedProject.fieldAssignments[fieldKey];
                          const asset = fieldAssignment?.assetId ? getAssetById(fieldAssignment.assetId) : null;

                          return (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {field.name}
                                  {field.required && (
                                    <Chip
                                      label="Required"
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {field.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getFieldTypeIcon(field.type)}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {field.type === 'text' || field.type === 'color' ? (
                                  <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`Enter ${field.type}...`}
                                    value={fieldAssignment?.value || ''}
                                    onChange={(e) => handleTextFieldChange(template.id, field.id, e.target.value)}
                                    type={field.type === 'color' ? 'color' : 'text'}
                                  />
                                ) : field.type === 'image' || field.type === 'video' || field.type === 'audio' ? (
                                  asset ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {field.type === 'image' && (
                                        <Box
                                          component="img"
                                          src={asset.url}
                                          alt={asset.name}
                                          sx={{
                                            width: 60,
                                            height: 60,
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                            mr: 2
                                          }}
                                        />
                                      )}
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
                                        onClick={() => handleOpenAssetDialog(template.id, field.id)}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      startIcon={getFieldTypeIcon(field.type)}
                                      onClick={() => handleOpenAssetDialog(template.id, field.id)}
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
                                    onChange={(e) => handleTextFieldChange(template.id, field.id, e.target.value)}
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
                </Box>
              ))}
            </Paper>
          </>
        )}

        {/* New Project Dialog */}
        <Dialog
          open={openNewProjectDialog}
          onClose={() => setOpenNewProjectDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Matrix</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Matrix Name"
                fullWidth
                margin="normal"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={2}
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Select Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose the templates to include in this matrix
              </Typography>

              <Grid container spacing={2}>
                {templates.map(template => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        border: selectedTemplates.includes(template.id) ? 2 : 1,
                        borderColor: selectedTemplates.includes(template.id) ? 'primary.main' : 'divider',
                      }}
                      onClick={() => {
                        if (selectedTemplates.includes(template.id)) {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                        } else {
                          setSelectedTemplates([...selectedTemplates, template.id]);
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1">
                            {template.name}
                          </Typography>
                          {selectedTemplates.includes(template.id) && (
                            <CheckIcon color="primary" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {template.platform} • {template.aspectRatio}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.dynamicFields.length} dynamic fields
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewProjectDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              disabled={newProjectName.trim() === '' || selectedTemplates.length === 0}
            >
              Create Matrix
            </Button>
          </DialogActions>
        </Dialog>

        {/* Asset Selection Dialog */}
        <Dialog
          open={openAssetDialog}
          onClose={() => setOpenAssetDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Select Asset
            {currentField && (
              <Typography variant="body2" color="text.secondary">
                {getTemplateById(currentField.templateId)?.name} - {getFieldByIds(currentField.templateId, currentField.fieldId)?.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Search assets..."
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 3, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Grid container spacing={2}>
              {assets
                .filter(asset => {
                  if (!currentField) return true;
                  const field = getFieldByIds(currentField.templateId, currentField.fieldId);
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
                        '&:hover': {
                          borderColor: 'primary.main',
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
                      <CardContent>
                        <Typography variant="subtitle2">
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} • {asset.metadata.fileSize}
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
                            {asset.tags.length > 2 && (
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssetDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default MatrixPage;

export default MatrixPage;
