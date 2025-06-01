import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AspectRatio as AspectRatioIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  MusicNote as TikTokIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';
import { EmptyTemplates } from '@/components/EmptyStates';
import { CardSkeleton } from '@/components/SkeletonLoaders';
import { AnimatedActionButton } from '@/components/AnimatedComponents';
import { useTemplates } from '@/hooks/useData';
import { useNotification } from '@/contexts/NotificationContext';
import type { Template } from '@/types/models';

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <InstagramIcon sx={{ color: '#E1306C' }} />,
  Facebook: <FacebookIcon sx={{ color: '#1877F2' }} />,
  Twitter: <TwitterIcon sx={{ color: '#1DA1F2' }} />,
  YouTube: <YouTubeIcon sx={{ color: '#FF0000' }} />,
  LinkedIn: <LinkedInIcon sx={{ color: '#0A66C2' }} />,
  Pinterest: <PinterestIcon sx={{ color: '#E60023' }} />,
  TikTok: <TikTokIcon sx={{ color: '#000000' }} />,
};

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
          backgroundImage: template.thumbnail ? `url(${template.thumbnail})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!template.thumbnail && (
          platformIcons[template.platform] || <AspectRatioIcon sx={{ fontSize: 48, color: 'grey.400' }} />
        )}
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
            sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
          >
            <MoreVertIcon />
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
                <ContentCopyIcon fontSize="small" />
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
        {template.performance && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Performance Score: {template.performance.score}/10
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => onCreateMatrix(template.id)}
          sx={{
            fontWeight: 'bold',
            py: 1
          }}
        >
          USE TEMPLATE
        </Button>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {template.category} • {template.contentType}
        </Typography>
      </Box>
    </Card>
  );
};

const Templates: React.FC = () => {
  const router = useRouter();
  const { data: templates, isLoading, error, refetch } = useTemplates();
  const { showNotification } = useNotification();

  const [platformFilter, setPlatformFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  // Filtering logic
  const filteredTemplates = (templates ?? []).filter((template: any) => {
    if (platformFilter !== 'All' && template.platform !== platformFilter) return false;
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const handlePlatformFilterChange = (e: SelectChangeEvent) => {
    setPlatformFilter(e.target.value as string);
  };
  
  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTemplate(null);
  };

  const handleDuplicateTemplate = (_template: Template) => {
    showNotification('Template duplication coming soon', 'info');
  };

  const handleEditTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setOpenDialog(true);
  };

  const handleDeleteTemplate = async (_templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      showNotification('Template deletion coming soon', 'info');
    }
  };

  const handleCreateMatrix = (templateId: string) => {
    router.push(`/matrix?templateId=${templateId}`);
  };

  const handleSaveTemplate = () => {
    showNotification('Template saving coming soon', 'info');
    handleCloseDialog();
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Templates">
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <CardSkeleton height={300} />
            </Grid>
          ))}
        </Grid>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Templates">
        <ErrorMessage error={error} onRetry={refetch} />
      </DashboardLayout>
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
                onChange={e => setSearchQuery(e.target.value)}
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
              <AnimatedActionButton onClick={handleAddTemplate}>
                <AddIcon sx={{ mr: 1 }} />
                Create Template
              </AnimatedActionButton>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Templates Grid */}
        <Grid container spacing={3}>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template: any) => (
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
          ) : searchQuery || platformFilter !== 'All' ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No templates found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your filters
                </Typography>
                <AnimatedActionButton onClick={() => { setSearchQuery(''); setPlatformFilter('All'); }}>
                  Clear Filters
                </AnimatedActionButton>
              </Box>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <EmptyTemplates onAddTemplate={handleAddTemplate} />
            </Grid>
          )}
        </Grid>
        
        {/* Create/Edit Template Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentTemplate ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
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
            <Button variant="contained" onClick={handleSaveTemplate}>
              {currentTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default Templates;
