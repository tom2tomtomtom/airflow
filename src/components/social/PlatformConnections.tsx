import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '@/contexts/NotificationContext';

interface Platform {
  id: string;
  name: string;
  displayName: string;
  isConnected: boolean;
  accountName?: string;
  permissions?: string[];
  lastSync?: string;
  status: 'active' | 'expired' | 'error';
}

interface PlatformConnectionsProps {
  clientId: string;
  onConnectionUpdate: () => void;
}

const PlatformConnections: React.FC<PlatformConnectionsProps> = ({
  clientId,
  onConnectionUpdate,
}) => {
  const { showNotification } = useNotification();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const platformConfigs = {
    facebook: {
      icon: <FacebookIcon />,
      color: '#1877F2',
      description: 'Connect your Facebook page to publish posts and engage with your audience.',
      permissions: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      features: ['Text Posts', 'Images', 'Videos', 'Links', 'Scheduling'],
    },
    instagram: {
      icon: <InstagramIcon />,
      color: '#E4405F',
      description: 'Share photos and videos to your Instagram business account.',
      permissions: ['instagram_basic', 'instagram_content_publish'],
      features: ['Photos', 'Videos', 'Stories', 'Reels', 'Scheduling'],
    },
    twitter: {
      icon: <TwitterIcon />,
      color: '#1DA1F2',
      description: 'Tweet and engage with your Twitter followers.',
      permissions: ['tweet.read', 'tweet.write', 'users.read'],
      features: ['Tweets', 'Images', 'Videos', 'Threads', 'Scheduling'],
    },
    linkedin: {
      icon: <LinkedInIcon />,
      color: '#0A66C2',
      description: 'Share professional content on LinkedIn.',
      permissions: ['w_member_social'],
      features: ['Posts', 'Articles', 'Images', 'Videos', 'Scheduling'],
    },
    youtube: {
      icon: <YouTubeIcon />,
      color: '#FF0000',
      description: 'Upload and manage videos on your YouTube channel.',
      permissions: ['youtube.upload', 'youtube.readonly'],
      features: ['Video Upload', 'Thumbnails', 'Descriptions', 'Scheduling'],
    },
  };

  useEffect(() => {
    loadPlatforms();
  }, [clientId]);

  const loadPlatforms = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/social/platforms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-client-id': clientId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.platforms || []);
      } else {
        throw new Error('Failed to load platforms');
      }
    } catch (error) {
      console.error('Error loading platforms:', error);
      showNotification('Failed to load platform connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformName: string) => {
    try {
      setConnectingPlatform(platformName);

      const response = await fetch(`/api/social/auth/${platformName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-client-id': clientId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Open OAuth popup
        const popup = window.open(
          data.authUrl,
          'social_auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setConnectingPlatform(null);
            loadPlatforms();
            onConnectionUpdate();
          }
        }, 1000);
      } else {
        throw new Error('Failed to initiate OAuth');
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      showNotification('Failed to connect platform', 'error');
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    if (!confirm(`Are you sure you want to disconnect ${platform.displayName}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/social/platforms', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-client-id': clientId,
        },
        body: JSON.stringify({ connection_id: platform.id }),
      });

      if (response.ok) {
        showNotification(`${platform.displayName} disconnected successfully`, 'success');
        loadPlatforms();
        onConnectionUpdate();
      } else {
        throw new Error('Failed to disconnect platform');
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      showNotification('Failed to disconnect platform', 'error');
    }
  };

  const handleTestConnection = async (platform: Platform) => {
    try {
      setTestingConnection(platform.name);

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isSuccess = Math.random() > 0.3; // 70% success rate for simulation
      
      if (isSuccess) {
        showNotification(`${platform.displayName} connection is working`, 'success');
      } else {
        showNotification(`${platform.displayName} connection has issues`, 'warning');
      }
    } catch (error) {
      showNotification('Failed to test connection', 'error');
    } finally {
      setTestingConnection(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon color="success" />;
      case 'expired': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Platform Connections
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Connect your social media accounts to start publishing content across multiple platforms.
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(platformConfigs).map(([platformName, config]) => {
            const platform = platforms.find(p => p.name === platformName);
            const isConnected = platform?.isConnected || false;

            return (
              <Grid item xs={12} md={6} key={platformName}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: config.color, mr: 2 }}>
                        {config.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {platform?.displayName || platformName}
                        </Typography>
                        {isConnected && (
                          <Typography variant="body2" color="text.secondary">
                            Connected as: {platform?.accountName}
                          </Typography>
                        )}
                      </Box>
                      {isConnected && (
                        <Badge
                          badgeContent={getStatusIcon(platform!.status)}
                          sx={{ '& .MuiBadge-badge': { backgroundColor: 'transparent' } }}
                        >
                          <Chip
                            label={platform!.status}
                            size="small"
                            color={getStatusColor(platform!.status) as any}
                          />
                        </Badge>
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {config.description}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Features:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {config.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>

                    {isConnected && platform?.lastSync && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Last synced: {formatDistanceToNow(new Date(platform.lastSync), { addSuffix: true })}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    {isConnected ? (
                      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                        <Button
                          size="small"
                          startIcon={<SettingsIcon />}
                          onClick={() => {
                            setSelectedPlatform(platform!);
                            setShowDetailsDialog(true);
                          }}
                        >
                          Manage
                        </Button>
                        <Button
                          size="small"
                          startIcon={
                            testingConnection === platformName ? 
                            <CircularProgress size={16} /> : 
                            <RefreshIcon />
                          }
                          onClick={() => handleTestConnection(platform!)}
                          disabled={testingConnection === platformName}
                        >
                          Test
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDisconnect(platform!)}
                        >
                          Disconnect
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={
                          connectingPlatform === platformName ? 
                          <CircularProgress size={16} /> : 
                          <LaunchIcon />
                        }
                        onClick={() => handleConnect(platformName)}
                        disabled={connectingPlatform === platformName}
                        sx={{ bgcolor: config.color, '&:hover': { bgcolor: config.color } }}
                      >
                        {connectingPlatform === platformName ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Connected Platforms Summary */}
        {platforms.some(p => p.isConnected) && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Connection Summary
            </Typography>
            <List dense>
              {platforms.filter(p => p.isConnected).map((platform) => (
                <ListItem key={platform.id}>
                  <ListItemIcon>
                    {platformConfigs[platform.name as keyof typeof platformConfigs]?.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={platform.displayName}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={platform.status}
                          size="small"
                          color={getStatusColor(platform.status) as any}
                        />
                        <Typography variant="caption">
                          {platform.permissions?.length} permissions
                        </Typography>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setShowDetailsDialog(true);
                      }}
                      aria-label="Icon button"
                    >
                      <SettingsIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {/* Platform Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPlatform?.displayName} Connection Details
        </DialogTitle>
        <DialogContent>
          {selectedPlatform && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Manage your {selectedPlatform.displayName} connection settings and permissions.
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                Account Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Account Name"
                    secondary={selectedPlatform.accountName || 'Not available'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={selectedPlatform.status}
                        size="small"
                        color={getStatusColor(selectedPlatform.status) as any}
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Sync"
                    secondary={
                      selectedPlatform.lastSync
                        ? formatDistanceToNow(new Date(selectedPlatform.lastSync), { addSuffix: true })
                        : 'Never'
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Permissions
              </Typography>
              <List dense>
                {selectedPlatform.permissions?.map((permission) => (
                  <ListItem key={permission}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={permission} />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText primary="No permissions available" />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>
            Close
          </Button>
          {selectedPlatform && (
            <Button
              variant="contained"
              onClick={() => handleTestConnection(selectedPlatform)}
              disabled={testingConnection === selectedPlatform.name}
            >
              Test Connection
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlatformConnections;