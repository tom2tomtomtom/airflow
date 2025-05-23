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
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  AspectRatio as AspectRatioIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';

// Mock data for templates
const mockTemplates = [
  // My Templates
  {
    id: 't0',
    name: 'My Custom Template',
    platform: 'Instagram',
    aspectRatio: '1:1',
    description: 'A custom template I created for my brand',
    thumbnail: '/custom-template.jpg',
    dateCreated: '2023-05-10',
    lastModified: '2023-05-15',
    category: 'Social Media',
    industry: 'Retail',
    contentType: 'Post',
    dimensions: '1080x1080',
    recommendedUsage: 'Product showcases, promotions',
    usageCount: 42,
    performance: {
      views: 3200,
      engagement: 5.7,
      conversion: 2.9,
      score: 76
    },
    dynamicFields: [
      {
        id: 'df1',
        name: 'Product Image',
        type: 'image',
        required: true,
        description: 'Main product image'
      },
      {
        id: 'df2',
        name: 'Product Name',
        type: 'text',
        required: true,
        description: 'Name of the product'
      }
    ],
    isCreatomate: true,
    creatomateId: 'crt-custom1',
    isOwner: true,
    isShared: false
  },
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
    creatomateId: 'crt-123456',
    isOwner: false,
    isShared: true
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
    creatomateId: 'crt-234567',
    isOwner: true,
    isShared: false
  },
];

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <InstagramIcon sx={{ color: '#E1306C' }} />,
  Facebook: <FacebookIcon sx={{ color: '#1877F2' }} />,
  Twitter: <TwitterIcon sx={{ color: '#1DA1F2' }} />,
  YouTube: <YouTubeIcon sx={{ color: '#FF0000' }} />,
  LinkedIn: <LinkedInIcon sx={{ color: '#0A66C2' }} />,
  Pinterest: <PinterestIcon sx={{ color: '#E60023' }} />,
  TikTok: <AspectRatioIcon sx={{ color: '#000000' }} />, // Using AspectRatioIcon as placeholder
};

// Interface for template data
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
  category?: string;
  industry?: string;
  contentType?: string;
  dimensions?: string;
  recommendedUsage?: string;
  usageCount?: number;
  performance?: {
    views: number;
    engagement: number;
    conversion: number;
    score: number;
  };
  dynamicFields?: DynamicField[];
  isCreatomate?: boolean;
  creatomateId?: string;
  isOwner?: boolean;
  isShared?: boolean;
}

// Template card component
const TemplateCard: React.FC<{
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (template: Template) => void;
  onCreateMatrix: (templateId: string) => void;
}> = ({ template, onEdit, onDelete, onDuplicate, onCreateMatrix }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          height: 180,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {platformIcons[template.platform] || <AspectRatioIcon sx={{ fontSize: 48, color: 'grey.400' }} />}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <IconButton
            aria-label="more"
            id={`template-menu-${template.id}`}
            aria-controls={open ? `template-menu-${template.id}` : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
            size="small"
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id={`template-menu-${template.id}`}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': `template-menu-${template.id}`,
            }}
          >
            <MenuItem onClick={() => { handleClose(); onEdit(template); }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); onDuplicate(template); }}>
              <ListItemIcon>
                <DuplicateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); onDelete(template.id); }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {template.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            size="small"
            icon={platformIcons[template.platform] as React.ReactElement}
            label={template.platform}
          />
          <Chip
            size="small"
            icon={<AspectRatioIcon />}
            label={template.aspectRatio}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description}
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => onCreateMatrix(template.id)}
              sx={{
                mb: 1,
                fontWeight: 'bold',
                py: 1
              }}
            >
              SELECT
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => onCreateMatrix(template.id)}
            >
              Use Template
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                // Use window.open for client-side navigation to a new tab
                window.open(`/preview?templateId=${template.id}`, '_blank');
              }}
            >
              Preview
            </Button>
          </Grid>
        </Grid>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Typography variant="caption" color="text.secondary">
          Last modified: {template.lastModified}
        </Typography>
      </Box>
    </Card>
  );
};

const TemplatesNew: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeClient, loading: clientLoading } = useClient();
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('All');
  const [aspectRatioFilter, setAspectRatioFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('lastModified');
  const [creatomateOnly, setCreatomateOnly] = useState<boolean>(false);
  const [highPerformingOnly, setHighPerformingOnly] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [tabValue, setTabValue] = useState(0);

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

  // Filter templates based on all filters
  useEffect(() => {
    let filtered = templates;

    // Tab filter
    if (tabValue === 1) { // My Templates
      filtered = filtered.filter(template => template.isOwner);
    } else if (tabValue === 2) { // Shared Templates
      filtered = filtered.filter(template => template.isShared && !template.isOwner);
    }

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.contentType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Platform filter
    if (platformFilter !== 'All') {
      filtered = filtered.filter(template => template.platform === platformFilter);
    }

    // Industry filter
    if (industryFilter !== 'All') {
      filtered = filtered.filter(template => template.industry === industryFilter);
    }

    // Content type filter
    if (contentTypeFilter !== 'All') {
      filtered = filtered.filter(template => template.contentType === contentTypeFilter);
    }

    // Aspect ratio filter
    if (aspectRatioFilter !== 'All') {
      filtered = filtered.filter(template => template.aspectRatio === aspectRatioFilter);
    }

    // Creatomate only filter
    if (creatomateOnly) {
      filtered = filtered.filter(template => template.isCreatomate);
    }

    // High performing only filter
    if (highPerformingOnly) {
      filtered = filtered.filter(template => template.performance && template.performance.score >= 80);
    }

    // Sort templates
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'usageCount') {
        const aCount = a.usageCount || 0;
        const bCount = b.usageCount || 0;
        return bCount - aCount;
      } else if (sortBy === 'performanceScore') {
        const aScore = a.performance?.score || 0;
        const bScore = b.performance?.score || 0;
        return bScore - aScore;
      } else { // lastModified
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });

    setFilteredTemplates(filtered);
  }, [
    searchQuery,
    platformFilter,
    industryFilter,
    contentTypeFilter,
    aspectRatioFilter,
    creatomateOnly,
    highPerformingOnly,
    sortBy,
    templates,
    tabValue
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePlatformFilterChange = (event: SelectChangeEvent) => {
    setPlatformFilter(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setOpenDialog(true);
  };

  const handleEditTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setOpenDialog(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(template => template.id !== templateId));
  };

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: `t${Date.now()}`,
      name: `${template.name} (Copy)`,
      dateCreated: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleCreateMatrix = (templateId: string) => {
    // Navigate to the matrix page with the template ID as a query parameter
    router.push(`/matrix?templateId=${templateId}`);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTemplate(null);
  };

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
        <title>Templates | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Templates">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage templates for different platforms and formats
          </Typography>
        </Box>

        {/* Filters and Actions */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="platform-filter-label">Platform</InputLabel>
                <Select
                  labelId="platform-filter-label"
                  id="platform-filter"
                  value={platformFilter}
                  label="Platform"
                  onChange={handlePlatformFilterChange}
                >
                  <MenuItem value="All">All Platforms</MenuItem>
                  <MenuItem value="Instagram">Instagram</MenuItem>
                  <MenuItem value="Facebook">Facebook</MenuItem>
                  <MenuItem value="Twitter">Twitter</MenuItem>
                  <MenuItem value="YouTube">YouTube</MenuItem>
                  <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                  <MenuItem value="Pinterest">Pinterest</MenuItem>
                  <MenuItem value="TikTok">TikTok</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTemplate}
              >
                Create Template
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template tabs">
            <Tab label="All Templates" />
            <Tab label="My Templates" />
            <Tab label="Shared Templates" />
          </Tabs>
        </Box>

        {/* Templates Grid */}
        <Grid container spacing={3}>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Grid item key={template.id} xs={12} sm={6} md={4}>
                <TemplateCard
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                  onCreateMatrix={handleCreateMatrix}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No templates found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery || platformFilter !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first template to get started'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddTemplate}
                  sx={{ mt: 2 }}
                >
                  Create Template
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Template Dialog (simplified for this example) */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentTemplate ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Template Name"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue={currentTemplate?.name || ''}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="platform-label">Platform</InputLabel>
                <Select
                  labelId="platform-label"
                  id="platform"
                  defaultValue={currentTemplate?.platform || 'Instagram'}
                  label="Platform"
                >
                  <MenuItem value="Instagram">Instagram</MenuItem>
                  <MenuItem value="Facebook">Facebook</MenuItem>
                  <MenuItem value="Twitter">Twitter</MenuItem>
                  <MenuItem value="YouTube">YouTube</MenuItem>
                  <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                  <MenuItem value="Pinterest">Pinterest</MenuItem>
                  <MenuItem value="TikTok">TikTok</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="aspect-ratio-label">Aspect Ratio</InputLabel>
                <Select
                  labelId="aspect-ratio-label"
                  id="aspect-ratio"
                  defaultValue={currentTemplate?.aspectRatio || '1:1'}
                  label="Aspect Ratio"
                >
                  <MenuItem value="1:1">1:1 (Square)</MenuItem>
                  <MenuItem value="4:5">4:5 (Instagram Portrait)</MenuItem>
                  <MenuItem value="16:9">16:9 (Landscape)</MenuItem>
                  <MenuItem value="9:16">9:16 (Vertical)</MenuItem>
                  <MenuItem value="2:3">2:3 (Pinterest)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                id="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                defaultValue={currentTemplate?.description || ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleCloseDialog}>
              {currentTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default TemplatesNew;
