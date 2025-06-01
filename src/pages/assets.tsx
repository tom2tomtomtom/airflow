import React, { useState, useEffect, useMemo } from 'react';
import { EmptyAssets } from '@/components/EmptyStates';
import { AssetGridSkeleton } from '@/components/SkeletonLoaders';
import { AnimatedUploadZone, AnimatedActionButton } from '@/components/AnimatedComponents';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Button,
  Typography,
  Grid,
  Tabs,
  Tab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Divider,
  Tooltip,
  Badge,
  CircularProgress,
  Alert,
  CardMedia,
  CardActions,
  Pagination,
} from '@mui/material';
import {
  Upload,
  AutoAwesome,
  Add as AddIcon,
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  MoreVert,
  Edit,
  Delete,
  Download,
  Share,
  Favorite,
  FavoriteBorder,
  Image,
  VideoFile,
  AudioFile,
  TextSnippet,
  Clear,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DashboardLayout from '@/components/DashboardLayout';
import AssetUploadModal from '@/components/AssetUploadModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { format } from 'date-fns';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'voice';
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  dateCreated: string;
  clientId: string;
  userId: string;
  favorite?: boolean;
  metadata?: Record<string, any>;
  size?: number;
  mimeType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface AssetFilters {
  search: string;
  type: string;
  tags: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  favoritesOnly: boolean;
}

const assetTypes = [
  { value: '', label: 'All Types', icon: <TextSnippet /> },
  { value: 'image', label: 'Images', icon: <Image /> },
  { value: 'video', label: 'Videos', icon: <VideoFile /> },
  { value: 'text', label: 'Text', icon: <TextSnippet /> },
  { value: 'voice', label: 'Audio', icon: <AudioFile /> },
];

const sortOptions = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'file_size', label: 'Size' },
];

const AssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  const [filters, setFilters] = useState<AssetFilters>({
    search: '',
    type: '',
    tags: [],
    dateFrom: null,
    dateTo: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
    favoritesOnly: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch assets when filters change or page changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAssets();
    }
  }, [isAuthenticated, user, activeClient, filters, page]);

  const fetchAssets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add client filter
      if (activeClient?.id) {
        queryParams.append('clientId', activeClient.id);
      }
      
      // Add search and filters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.tags.length > 0) queryParams.append('tags', filters.tags.join(','));
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString().split('T')[0]);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString().split('T')[0]);
      
      // Add sorting and pagination
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('sortOrder', filters.sortOrder);
      queryParams.append('limit', '20');
      queryParams.append('offset', ((page - 1) * 20).toString());

      const response = await fetch(`/api/assets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      
      if (data.success) {
        let fetchedAssets = data.assets || [];
        
        // Apply client-side filters
        if (filters.favoritesOnly) {
          fetchedAssets = fetchedAssets.filter((asset: Asset) => asset.favorite);
        }
        
        setAssets(fetchedAssets);
        
        // Calculate pagination
        const total = data.pagination?.total || 0;
        setTotalPages(Math.ceil(total / 20));
        
        // Extract available tags
        const allTags = fetchedAssets.reduce((acc: Set<string>, asset: Asset) => {
          asset.tags.forEach(tag => acc.add(tag));
          return acc;
        }, new Set<string>());
        setAvailableTags(Array.from(allTags));
      } else {
        throw new Error(data.message || 'Failed to fetch assets');
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<AssetFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      tags: [],
      dateFrom: null,
      dateTo: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
      favoritesOnly: false,
    });
    setPage(1);
  };

  const handleSelectAsset = (assetId: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === assets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assets.map(asset => asset.id)));
    }
  };

  // Download single asset
  const handleDownloadAsset = async (asset: Asset) => {
    try {
      const response = await fetch(asset.file_url);
      if (!response.ok) throw new Error('Failed to fetch asset');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = asset.name || 'asset';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification(`Downloaded ${asset.name}`, 'success');
    } catch (error) {
      console.error('Error downloading asset:', error);
      showNotification('Failed to download asset', 'error');
    }
  };

  // Download multiple assets as ZIP
  const handleBulkDownload = async () => {
    if (selectedAssets.size === 0) return;

    try {
      const selectedAssetsList = assets.filter(asset => selectedAssets.has(asset.id));
      
      if (selectedAssetsList.length === 1) {
        // Single asset - direct download
        await handleDownloadAsset(selectedAssetsList[0]);
        return;
      }

      // Multiple assets - create ZIP
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      showNotification(`Preparing ${selectedAssetsList.length} files for download...`, 'info');

      // Add files to ZIP
      for (const asset of selectedAssetsList) {
        try {
          const response = await fetch(asset.file_url);
          if (response.ok) {
            const blob = await response.blob();
            const extension = asset.mime_type?.split('/')[1] || 'bin';
            const fileName = `${asset.name || asset.id}.${extension}`;
            zip.file(fileName, blob);
          }
        } catch (error) {
          console.warn(`Failed to add ${asset.name} to ZIP:`, error);
        }
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification(`Downloaded ${selectedAssetsList.length} assets as ZIP`, 'success');
      setSelectedAssets(new Set()); // Clear selection
    } catch (error) {
      console.error('Error creating ZIP:', error);
      showNotification('Failed to download assets', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedAssets).map(assetId =>
        fetch(`/api/assets/${assetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        })
      );
      
      await Promise.all(deletePromises);
      showNotification(`Deleted ${selectedAssets.size} assets`, 'success');
      setSelectedAssets(new Set());
      fetchAssets();
    } catch (error) {
      showNotification('Failed to delete assets', 'error');
    }
  };

  const handleToggleFavorite = async (asset: Asset) => {
    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          metadata: {
            ...asset.metadata,
            favorite: !asset.favorite,
          },
        }),
      });

      if (response.ok) {
        fetchAssets();
        showNotification(
          asset.favorite ? 'Removed from favorites' : 'Added to favorites',
          'success'
        );
      }
    } catch (error) {
      showNotification('Failed to update favorite', 'error');
    }
  };

  const handleUploadComplete = () => {
    showNotification('Assets uploaded successfully!', 'success');
    fetchAssets();
  };

  const speedDialActions = [
    {
      icon: <Upload />,
      name: 'Upload Files',
      action: () => setShowUploadModal(true),
    },
    {
      icon: <AutoAwesome />,
      name: 'AI Generate',
      action: () => router.push('/generate'),
    },
  ];

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const activeTypeFilter = assetTypes.find(type => type.value === filters.type);
  const hasActiveFilters = filters.search || filters.type || filters.tags.length > 0 || 
                          filters.dateFrom || filters.dateTo || filters.favoritesOnly;

  return (
    <DashboardLayout>
      <Head>
        <title>Assets | AIrWAVE</title>
      </Head>
      
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Asset Library
            </Typography>
            {activeClient && (
              <Typography variant="subtitle1" color="text.secondary">
                {activeClient.name}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Grid View">
              <IconButton 
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton 
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            {/* Main Search Row */}
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange({ type: e.target.value })}
                  displayEmpty
                  size="small"
                >
                  {assetTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  size="small"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton
                onClick={() => handleFilterChange({ 
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                })}
              >
                <Sort sx={{ 
                  transform: filters.sortOrder === 'desc' ? 'rotate(180deg)' : 'none' 
                }} />
              </IconButton>

              <Badge color="error" badgeContent={hasActiveFilters ? '•' : 0}>
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterList />
                </IconButton>
              </Badge>

              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  startIcon={<Clear />}
                  size="small"
                >
                  Clear
                </Button>
              )}
            </Box>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <>
                <Divider />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="From Date"
                        value={filters.dateFrom}
                        onChange={(date) => handleFilterChange({ dateFrom: date })}
                        slotProps={{
                          textField: { size: 'small', fullWidth: true }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="To Date"
                        value={filters.dateTo}
                        onChange={(date) => handleFilterChange({ dateTo: date })}
                        slotProps={{
                          textField: { size: 'small', fullWidth: true }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tags</InputLabel>
                        <Select
                          multiple
                          value={filters.tags}
                          onChange={(e) => handleFilterChange({ 
                            tags: typeof e.target.value === 'string' 
                              ? e.target.value.split(',') 
                              : e.target.value 
                          })}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {availableTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                              <Checkbox checked={filters.tags.indexOf(tag) > -1} />
                              <ListItemText primary={tag} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.favoritesOnly}
                            onChange={(e) => handleFilterChange({ favoritesOnly: e.target.checked })}
                          />
                        }
                        label="Favorites Only"
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Box display="flex" gap={1} flexWrap="wrap">
                {filters.search && (
                  <Chip
                    label={`Search: "${filters.search}"`}
                    onDelete={() => handleFilterChange({ search: '' })}
                    size="small"
                  />
                )}
                {filters.type && (
                  <Chip
                    icon={activeTypeFilter?.icon}
                    label={`Type: ${activeTypeFilter?.label}`}
                    onDelete={() => handleFilterChange({ type: '' })}
                    size="small"
                  />
                )}
                {filters.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`Tag: ${tag}`}
                    onDelete={() => handleFilterChange({ 
                      tags: filters.tags.filter(t => t !== tag) 
                    })}
                    size="small"
                  />
                ))}
                {filters.dateFrom && (
                  <Chip
                    label={`From: ${format(filters.dateFrom, 'MMM d, yyyy')}`}
                    onDelete={() => handleFilterChange({ dateFrom: null })}
                    size="small"
                  />
                )}
                {filters.dateTo && (
                  <Chip
                    label={`To: ${format(filters.dateTo, 'MMM d, yyyy')}`}
                    onDelete={() => handleFilterChange({ dateTo: null })}
                    size="small"
                  />
                )}
                {filters.favoritesOnly && (
                  <Chip
                    icon={<Favorite />}
                    label="Favorites Only"
                    onDelete={() => handleFilterChange({ favoritesOnly: false })}
                    size="small"
                  />
                )}
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Bulk Actions */}
        {selectedAssets.size > 0 && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">
                {selectedAssets.size} asset{selectedAssets.size !== 1 ? 's' : ''} selected
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  startIcon={<Download />}
                  onClick={handleBulkDownload}
                  size="small"
                  disabled={selectedAssets.size === 0}
                >
                  Download
                </Button>
                <Button
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Content Area */}
        {!activeClient && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please select a client to view assets
          </Alert>
        )}

        {error && (
          <ErrorMessage
            title="Failed to load assets"
            error={error}
            onRetry={fetchAssets}
          />
        )}

        {isLoading && (
          <Grid container spacing={2}>
            {[...Array(8)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <LoadingSkeleton variant="card" />
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && !error && assets.length === 0 && (
          <Box textAlign="center" py={8}>
            <Image sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hasActiveFilters ? 'No assets found' : 'No assets yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {hasActiveFilters 
                ? 'Try adjusting your search criteria'
                : 'Upload your first assets to get started'
              }
            </Typography>
            {!hasActiveFilters && activeClient && (
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setShowUploadModal(true)}
                sx={{ mt: 2 }}
              >
                Upload Assets
              </Button>
            )}
          </Box>
        )}

        {/* Assets Grid/List */}
        {!isLoading && !error && assets.length > 0 && (
          <>
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Showing {assets.length} assets
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedAssets.size === assets.length && assets.length > 0}
                    indeterminate={selectedAssets.size > 0 && selectedAssets.size < assets.length}
                    onChange={handleSelectAll}
                  />
                }
                label="Select All"
              />
            </Box>

            <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
              {assets.map((asset) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={viewMode === 'grid' ? 6 : 12} 
                  md={viewMode === 'grid' ? 4 : 12} 
                  lg={viewMode === 'grid' ? 3 : 12} 
                  key={asset.id}
                >
                  <AssetCard
                    asset={asset}
                    viewMode={viewMode}
                    isSelected={selectedAssets.has(asset.id)}
                    onSelect={() => handleSelectAsset(asset.id)}
                    onToggleFavorite={() => handleToggleFavorite(asset)}
                    onMenuClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setSelectedAsset(asset);
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => console.log('Edit', selectedAsset)}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedAsset) handleDownloadAsset(selectedAsset);
            setAnchorEl(null);
          }}>
            <ListItemIcon><Download /></ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => console.log('Share', selectedAsset)}>
            <ListItemIcon><Share /></ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => console.log('Delete', selectedAsset)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon><Delete color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Upload Modal */}
        <AssetUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />

        {/* Speed Dial */}
        <SpeedDial
          ariaLabel="Asset actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon icon={<AddIcon />} />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      </Box>
    </DashboardLayout>
  );
};

// AssetCard Component
interface AssetCardProps {
  asset: Asset;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  viewMode,
  isSelected,
  onSelect,
  onToggleFavorite,
  onMenuClick,
}) => {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image />;
      case 'video': return <VideoFile />;
      case 'text': return <TextSnippet />;
      case 'voice': return <AudioFile />;
      default: return <TextSnippet />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (viewMode === 'list') {
    return (
      <Card 
        sx={{ 
          display: 'flex',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          transition: 'border-color 0.2s',
          '&:hover': {
            borderColor: 'primary.light',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Checkbox
            checked={isSelected}
            onChange={onSelect}
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
          />
          {asset.thumbnailUrl || asset.type === 'image' ? (
            <CardMedia
              component="img"
              sx={{ width: 160, height: 120 }}
              image={asset.thumbnailUrl || asset.url}
              alt={asset.name}
            />
          ) : (
            <Box
              sx={{
                width: 160,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                color: 'grey.500',
              }}
            >
              {getAssetIcon(asset.type)}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box flexGrow={1}>
                <Typography variant="h6" noWrap>
                  {asset.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.description || 'No description'}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  {asset.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={onToggleFavorite} size="small">
                  {asset.favorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={onMenuClick} size="small">
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
          <Box sx={{ p: 1, pt: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {asset.type.toUpperCase()} • {formatFileSize(asset.size)} • {format(new Date(asset.dateCreated), 'MMM d, yyyy')}
              {asset.duration && ` • ${formatDuration(asset.duration)}`}
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
        },
      }}
      data-testid="asset-card"
    >
      <Box sx={{ position: 'relative' }}>
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
        />
        <IconButton
          onClick={onToggleFavorite}
          sx={{ position: 'absolute', top: 8, right: 40, zIndex: 1 }}
          size="small"
        >
          {asset.favorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <IconButton
          onClick={onMenuClick}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          size="small"
        >
          <MoreVert />
        </IconButton>

        {asset.thumbnailUrl || asset.type === 'image' ? (
          <CardMedia
            component="img"
            height="200"
            image={asset.thumbnailUrl || asset.url}
            alt={asset.name}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              color: 'grey.500',
              fontSize: 48,
            }}
          >
            {getAssetIcon(asset.type)}
          </Box>
        )}
        
        {asset.duration && (
          <Chip
            label={formatDuration(asset.duration)}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="subtitle1" noWrap gutterBottom>
          {asset.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: '2.5em',
        }}>
          {asset.description || 'No description'}
        </Typography>
        
        {asset.tags.length > 0 && (
          <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
            {asset.tags.slice(0, 2).map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
            {asset.tags.length > 2 && (
              <Chip label={`+${asset.tags.length - 2}`} size="small" variant="outlined" />
            )}
          </Box>
        )}
      </CardContent>
      
      <Box sx={{ p: 1, pt: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {asset.type.toUpperCase()} • {formatFileSize(asset.size)}
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          {format(new Date(asset.dateCreated), 'MMM d, yyyy')}
        </Typography>
      </Box>
    </Card>
  );
};

export default AssetsPage;