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
  Grid,
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

const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Allow testing without authentication in development
  useEffect(() => {
    if (!loading && !isAuthenticated && process.env.NODE_ENV === 'production') {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Initialize with sample data for testing
  useEffect(() => {
    if (!isAuthenticated || process.env.NODE_ENV !== 'production') {
      // Mock data for testing
      setAssets([
        {
          id: '1',
          name: 'Sample Image.jpg',
          type: 'image',
          url: 'https://picsum.photos/400/300',
          thumbnailUrl: 'https://picsum.photos/200/150',
          description: 'A sample image for testing',
          tags: ['sample', 'test'],
          dateCreated: '2024-01-15T10:00:00Z',
          clientId: 'test-client',
          userId: 'test-user',
          favorite: false,
          size: 245760,
          mimeType: 'image/jpeg',
          width: 400,
          height: 300
        },
        {
          id: '2',
          name: 'Demo Video.mp4',
          type: 'video',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          description: 'A demo video file',
          tags: ['demo', 'video'],
          dateCreated: '2024-01-16T14:30:00Z',
          clientId: 'test-client',
          userId: 'test-user',
          favorite: true,
          size: 1048576,
          mimeType: 'video/mp4',
          duration: 30
        },
        {
          id: '3',
          name: 'Brand Guidelines.pdf',
          type: 'text',
          url: '#',
          description: 'Brand guidelines document',
          tags: ['brand', 'guidelines'],
          dateCreated: '2024-01-17T09:15:00Z',
          clientId: 'test-client',
          userId: 'test-user',
          favorite: false,
          size: 512000,
          mimeType: 'application/pdf'
        }
      ]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleFilterChange = (newFilters: Partial<AssetFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
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

  const handleDownloadAsset = (asset: Asset) => {
    showNotification(`Downloaded ${asset.name}`, 'success');
  };

  const handleToggleFavorite = (asset: Asset) => {
    setAssets(prev => prev.map(a => 
      a.id === asset.id ? { ...a, favorite: !a.favorite } : a
    ));
    showNotification(
      asset.favorite ? 'Removed from favorites' : 'Added to favorites',
      'success'
    );
  };

  const handleDeleteAsset = (asset: Asset) => {
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    showNotification(`Deleted ${asset.name}`, 'success');
  };

  // Show loading if not authenticated in production
  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated && process.env.NODE_ENV === 'production') {
    return null;
  }

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !asset.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type && asset.type !== filters.type) {
        return false;
      }
      if (filters.tags.length > 0 && !filters.tags.some(tag => asset.tags.includes(tag))) {
        return false;
      }
      if (filters.favoritesOnly && !asset.favorite) {
        return false;
      }
      return true;
    });
  }, [assets, filters]);

  return (
    <DashboardLayout>
      <Head>
        <title>Assets | AIrFLOW</title>
      </Head>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Assets</Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
            {activeClient && ` for ${activeClient.name}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setShowUploadModal(true)}
            data-testid="upload-assets-button"
          >
            Upload Assets
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
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
                data-testid="search-assets"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange({ type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="voice">Voice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  label="Sort By"
                >
                  <MenuItem value="created_at">Date Created</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                  <MenuItem value="size_bytes">Size</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={1}>
              <Tooltip title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}>
                <IconButton
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  data-testid="toggle-view-mode"
                >
                  {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <AssetGridSkeleton />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : filteredAssets.length === 0 ? (
        <EmptyAssets onUpload={() => setShowUploadModal(true)} />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {filteredAssets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                  <AssetCard
                    asset={asset}
                    viewMode={viewMode}
                    isSelected={selectedAssets.has(asset.id)}
                    onSelect={() => handleSelectAsset(asset.id)}
                    onDownload={() => handleDownloadAsset(asset)}
                    onToggleFavorite={() => handleToggleFavorite(asset)}
                    onDelete={() => handleDeleteAsset(asset)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={1}>
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  viewMode={viewMode}
                  isSelected={selectedAssets.has(asset.id)}
                  onSelect={() => handleSelectAsset(asset.id)}
                  onDownload={() => handleDownloadAsset(asset)}
                  onToggleFavorite={() => handleToggleFavorite(asset)}
                  onDelete={() => handleDeleteAsset(asset)}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <AssetUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={() => {
            setShowUploadModal(false);
            showNotification('Assets uploaded successfully!', 'success');
          }}
        />
      )}
    </DashboardLayout>
  );
};

// AssetCard Component
interface AssetCardProps {
  asset: Asset;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  viewMode,
  isSelected,
  onSelect,
  onDownload,
  onToggleFavorite,
  onDelete,
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.light',
          transform: viewMode === 'grid' ? 'translateY(-2px)' : 'none',
        },
      }}
      data-testid="asset-card"
    >
      <Box sx={{ position: 'relative', width: viewMode === 'list' ? 160 : '100%' }}>
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
        />
        <IconButton
          onClick={onToggleFavorite}
          sx={{ position: 'absolute', top: 8, right: 40, zIndex: 1 }}
          size="small"
          aria-label="Toggle favorite"
        >
          {asset.favorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <IconButton
          onClick={onDelete}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          size="small"
          aria-label="Delete asset"
        >
          <Delete />
        </IconButton>

        {asset.thumbnailUrl || asset.type === 'image' ? (
          <CardMedia
            component="img"
            height={viewMode === 'grid' ? "200" : "120"}
            sx={{ width: viewMode === 'list' ? 160 : '100%' }}
            image={asset.thumbnailUrl || asset.url}
            alt={asset.name}
          />
        ) : (
          <Box
            sx={{
              height: viewMode === 'grid' ? 200 : 120,
              width: viewMode === 'list' ? 160 : '100%',
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
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="subtitle1" noWrap gutterBottom>
          {asset.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5em',
          }}
        >
          {asset.description || 'No description'}
        </Typography>
        {asset.tags.length > 0 && (
          <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
            {asset.tags.slice(0, 2).map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
            {asset.tags.length > 2 && (
              <Chip
                label={`+${asset.tags.length - 2}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {asset.type.toUpperCase()} • {formatFileSize(asset.size)}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            {format(new Date(asset.dateCreated), 'MMM d, yyyy')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetsPage;