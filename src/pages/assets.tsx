import React, { useState, useEffect, useMemo } from 'react';
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Asset Library
          </Typography>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Assets" />
            <Tab label="Images" />
            <Tab label="Videos" />
            <Tab label="Audio" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {mockAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Card sx={{ height: '100%' }} data-testid="asset-card">
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      {asset.type.toUpperCase()}
                    </Typography>
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle1" noWrap>
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {asset.type}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {/* Empty state with upload button */}
            {mockAssets.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={5}>
                  <Upload sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No assets yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => setShowUploadModal(true)}
                    data-testid="upload-button"
                    sx={{ mt: 2 }}
                  >
                    Upload Files
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography>Images view</Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography>Videos view</Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography>Audio view</Typography>
        </TabPanel>

        <SpeedDial
          ariaLabel="Add asset"
          data-testid="speed-dial"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon openIcon={<AddIcon />} />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
              data-testid={`speed-dial-${action.name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          ))}
        </SpeedDial>

        <AssetUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      </Box>
    </DashboardLayout>
  );
};

export default AssetsPage;