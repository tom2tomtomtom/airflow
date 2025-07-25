import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { VideoTemplateSelectorProps, VideoTemplate, TemplateFilters } from './types';

// Individual Template Card Component - Optimized with React.memo
interface TemplateCardProps {
  template: VideoTemplate;
  isSelected: boolean;
  onSelect: (template: VideoTemplate) => void;
  onKeyDown: (event: React.KeyboardEvent, template: VideoTemplate) => void;
}

const TemplateCard = React.memo<TemplateCardProps>(({ template, isSelected, onSelect, onKeyDown }) => {
  const handleClick = useCallback(() => {
    onSelect(template);
  }, [template, onSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    onKeyDown(event, template);
  }, [template, onKeyDown]);

  return (
    <Card
      variant="outlined"
      role="button"
      tabIndex={0}
      aria-label={`Select ${template.name} template`}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
        },
        '&:focus': {
          outline: 'none',
          boxShadow: 3,
          borderColor: 'primary.main',
        },
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardMedia
        component="img"
        height="140"
        image={template.thumbnail || '/placeholder-template.png'}
        alt={template.name}
        sx={{
          objectFit: 'cover',
        }}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {template.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5em',
          }}
        >
          {template.description}
        </Typography>

        {/* Metadata Chips */}
        <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
          <Chip label={template.category} size="small" />
          <Chip label={template.aspect_ratio} size="small" variant="outlined" />
          <Chip label={`${template.duration}s`} size="small" variant="outlined" />
        </Box>

        {/* Platform Chips */}
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {template.platform.map(platform => (
            <Chip
              key={platform}
              label={platform}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

TemplateCard.displayName = 'TemplateCard';

/**
 * VideoTemplateSelector Component
 *
 * Displays a grid of video templates with filtering capabilities.
 * Extracted from VideoStudioPage to improve modularity and testability.
 * Optimized with React.memo and useCallback for performance.
 */
const VideoTemplateSelectorComponent: React.FC<VideoTemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  filters,
  onFilterChange,
  loading = false,
}) => {
  // Filter templates based on applied filters
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Category filter
      if (filters.category && template.category !== filters.category) {
        return false;
      }

      // Platform filter
      if (filters.platform && !template.platform.includes(filters.platform)) {
        return false;
      }

      // Aspect ratio filter
      if (filters.aspect_ratio && template.aspect_ratio !== filters.aspect_ratio) {
        return false;
      }

      // Duration filter
      if (filters.duration) {
        const isShort = template.duration <= 15;
        const isMedium = template.duration > 15 && template.duration <= 30;
        const isLong = template.duration > 30;

        if (filters.duration === 'short' && !isShort) return false;
        if (filters.duration === 'medium' && !isMedium) return false;
        if (filters.duration === 'long' && !isLong) return false;
      }

      // Search filter (name, description, tags)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(searchTerm);
        const matchesDescription = template.description.toLowerCase().includes(searchTerm);
        const matchesTags = template.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const matchesCategory = template.category.toLowerCase().includes(searchTerm);

        if (!matchesName && !matchesDescription && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [templates, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(templates.map(t => t.category))];
    const platforms = [...new Set(templates.flatMap(t => t.platform))];
    const aspectRatios = [...new Set(templates.map(t => t.aspect_ratio))];

    return { categories, platforms, aspectRatios };
  }, [templates]);

  const handleFilterChange = useCallback((key: keyof TemplateFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  }, [filters, onFilterChange]);

  const handleTemplateClick = useCallback((template: VideoTemplate) => {
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handleTemplateKeyDown = useCallback((event: React.KeyboardEvent, template: VideoTemplate) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTemplateSelect(template);
    }
  }, [onTemplateSelect]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={8}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading templates...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Choose a Video Template
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a template that best fits your video needs
        </Typography>

        {/* Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={filters.search || ''}
                onChange={e => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || ''}
                  label="Category"
                  onChange={e => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {filterOptions.categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Platform</InputLabel>
                <Select
                  value={filters.platform || ''}
                  label="Platform"
                  onChange={e => handleFilterChange('platform', e.target.value)}
                >
                  <MenuItem value="">All Platforms</MenuItem>
                  {filterOptions.platforms.map(platform => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Duration</InputLabel>
                <Select
                  value={filters.duration || ''}
                  label="Duration"
                  onChange={e => handleFilterChange('duration', e.target.value)}
                >
                  <MenuItem value="">Any Duration</MenuItem>
                  <MenuItem value="short">Short (≤15s)</MenuItem>
                  <MenuItem value="medium">Medium (16-30s)</MenuItem>
                  <MenuItem value="long">Long (&gt;30s)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No templates found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters to see more templates.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredTemplates.map(template => (
              <Grid size={{ xs: 12, sm: 6, md: 6 }} key={template.id}>
                <TemplateCard
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={handleTemplateClick}
                  onKeyDown={handleTemplateKeyDown}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

// Memoized export to prevent unnecessary re-renders
export const VideoTemplateSelector = React.memo(VideoTemplateSelectorComponent);
