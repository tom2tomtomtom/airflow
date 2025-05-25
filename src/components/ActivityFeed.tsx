import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Divider,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Image as AssetIcon,
  CheckCircle as ApprovalIcon,
  Edit as EditIcon,
  Person as UserIcon,
  TrendingUp as PerformanceIcon,
  Group as TeamIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Circle as OnlineIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useClient } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';

// Activity types
type ActivityType = 
  | 'campaign_created'
  | 'campaign_updated'
  | 'campaign_launched'
  | 'asset_uploaded'
  | 'asset_generated'
  | 'matrix_created'
  | 'matrix_approved'
  | 'approval_requested'
  | 'approval_completed'
  | 'comment_added'
  | 'user_joined'
  | 'performance_alert'
  | 'system_update';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: {
    campaignId?: string;
    assetId?: string;
    matrixId?: string;
    performance?: {
      metric: string;
      value: number;
      change: number;
    };
  };
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

interface ActivityFeedProps {
  compact?: boolean;
  maxItems?: number;
  filter?: ActivityType[];
  showHeader?: boolean;
  onActivityClick?: (activity: Activity) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  compact = false,
  maxItems = 10,
  filter = [],
  showHeader = true,
  onActivityClick,
}) => {
  const theme = useTheme();
  const { activeClient } = useClient();
  const { user } = useAuth();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<ActivityType[]>(filter);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    // Initial load
    loadActivities();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        addRandomActivity();
      }
    }, 15000); // Add new activity every 15 seconds

    return () => clearInterval(interval);
  }, [isLive, activeClient]);

  const loadActivities = () => {
    setLoading(true);
    // Simulate loading activities
    setTimeout(() => {
      const mockActivities = generateMockActivities();
      setActivities(mockActivities);
      setUnreadCount(mockActivities.filter(a => !a.read).length);
      setLoading(false);
    }, 1000);
  };

  const generateMockActivities = (): Activity[] => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'campaign_launched',
        title: 'Campaign Launched',
        description: 'Summer Fitness Challenge is now live on Instagram and Facebook',
        timestamp: new Date(now.getTime() - 5 * 60000),
        user: { id: '1', name: 'Sarah Johnson' },
        metadata: { campaignId: 'campaign-1' },
        priority: 'high',
        read: false,
      },
      {
        id: '2',
        type: 'asset_generated',
        title: 'AI Asset Generated',
        description: '3 new variations created for Protein Shake product shots',
        timestamp: new Date(now.getTime() - 15 * 60000),
        user: { id: '2', name: 'AI System' },
        metadata: { assetId: 'asset-1' },
        priority: 'medium',
        read: false,
      },
      {
        id: '3',
        type: 'approval_requested',
        title: 'Approval Required',
        description: 'New matrix awaiting your approval for Q2 Campaign',
        timestamp: new Date(now.getTime() - 30 * 60000),
        user: { id: '3', name: 'Mike Chen' },
        metadata: { matrixId: 'matrix-1' },
        priority: 'high',
        read: true,
      },
      {
        id: '4',
        type: 'performance_alert',
        title: 'Performance Spike',
        description: 'Instagram engagement up 45% in the last hour',
        timestamp: new Date(now.getTime() - 45 * 60000),
        user: { id: 'system', name: 'Analytics System' },
        metadata: {
          performance: {
            metric: 'engagement',
            value: 8.5,
            change: 45,
          },
        },
        priority: 'medium',
        read: true,
      },
      {
        id: '5',
        type: 'comment_added',
        title: 'New Comment',
        description: 'Emily added feedback on the Morning Workout campaign',
        timestamp: new Date(now.getTime() - 60 * 60000),
        user: { id: '4', name: 'Emily Davis' },
        priority: 'low',
        read: true,
      },
    ];
  };

  const addRandomActivity = () => {
    const activityTemplates = [
      {
        type: 'asset_uploaded' as ActivityType,
        title: 'New Asset Uploaded',
        description: 'High-resolution product images added to library',
        priority: 'low' as const,
      },
      {
        type: 'campaign_updated' as ActivityType,
        title: 'Campaign Updated',
        description: 'Budget and targeting adjusted for better performance',
        priority: 'medium' as const,
      },
      {
        type: 'matrix_approved' as ActivityType,
        title: 'Matrix Approved',
        description: 'Content variations approved and ready for distribution',
        priority: 'high' as const,
      },
      {
        type: 'performance_alert' as ActivityType,
        title: 'Conversion Rate Increase',
        description: 'Facebook ads showing 25% higher conversion rate',
        priority: 'high' as const,
        metadata: {
          performance: {
            metric: 'conversion',
            value: 3.2,
            change: 25,
          },
        },
      },
    ];

    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      ...template,
      timestamp: new Date(),
      user: {
        id: `user-${Math.floor(Math.random() * 5)}`,
        name: ['John Doe', 'Jane Smith', 'AI System', 'Mike Chen', 'Emily Davis'][Math.floor(Math.random() * 5)],
      },
      read: false,
    };

    setActivities(prev => [newActivity, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'campaign_created':
      case 'campaign_updated':
      case 'campaign_launched':
        return <CampaignIcon />;
      case 'asset_uploaded':
      case 'asset_generated':
        return <AssetIcon />;
      case 'matrix_created':
      case 'matrix_approved':
        return <EditIcon />;
      case 'approval_requested':
      case 'approval_completed':
        return <ApprovalIcon />;
      case 'comment_added':
        return <UserIcon />;
      case 'user_joined':
        return <TeamIcon />;
      case 'performance_alert':
        return <PerformanceIcon />;
      case 'system_update':
        return <InfoIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getActivityColor = (type: ActivityType, priority: string) => {
    if (priority === 'high') return theme.palette.error.main;
    if (priority === 'medium') return theme.palette.warning.main;
    
    switch (type) {
      case 'campaign_launched':
      case 'matrix_approved':
        return theme.palette.success.main;
      case 'performance_alert':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const handleMarkAllRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleActivityClick = (activity: Activity) => {
    // Mark as read
    setActivities(prev =>
      prev.map(a => (a.id === activity.id ? { ...a, read: true } : a))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Call parent handler
    onActivityClick?.(activity);
  };

  const filteredActivities = selectedFilter.length > 0
    ? activities.filter(a => selectedFilter.includes(a.type))
    : activities;

  const displayedActivities = showAll
    ? filteredActivities
    : filteredActivities.slice(0, maxItems);

  if (!activeClient) {
    return null;
  }

  return (
    <Card sx={{ height: compact ? 'auto' : '100%' }}>
      {showHeader && (
        <CardContent sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">
                Activity Feed
              </Typography>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
              {isLive && (
                <Tooltip title="Real-time updates active">
                  <OnlineIcon sx={{ fontSize: 12, color: 'success.main' }} />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Toggle live updates">
                <IconButton size="small" onClick={() => setIsLive(!isLive)}>
                  {isLive ? <OnlineIcon color="success" /> : <OnlineIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter activities">
                <IconButton size="small" onClick={handleFilterClick}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadActivities}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                  <CheckCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      )}

      <Divider />

      <CardContent sx={{ p: compact ? 1 : 2, maxHeight: compact ? 400 : 600, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : displayedActivities.length === 0 ? (
          <Alert severity="info">
            No activities to display. Check back later!
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedActivities.map((activity, index) => (
              <Fade in key={activity.id} timeout={300 * (index + 1)}>
                <Box>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: compact ? 1 : 2,
                      py: compact ? 1 : 1.5,
                      cursor: 'pointer',
                      bgcolor: activity.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          !activity.read ? (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${getActivityColor(activity.type, activity.priority)}20`,
                            width: compact ? 32 : 40,
                            height: compact ? 32 : 40,
                          }}
                        >
                          <Box sx={{ color: getActivityColor(activity.type, activity.priority) }}>
                            {getActivityIcon(activity.type)}
                          </Box>
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant={compact ? 'body2' : 'subtitle2'}
                            sx={{ fontWeight: activity.read ? 400 : 600 }}
                          >
                            {activity.title}
                          </Typography>
                          {activity.priority === 'high' && (
                            <Chip label="High" size="small" color="error" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant={compact ? 'caption' : 'body2'}
                            color="text.primary"
                            sx={{ display: 'block' }}
                          >
                            {activity.description}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {activity.user.name} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </Typography>
                          {activity.metadata?.performance && (
                            <Chip
                              size="small"
                              label={`${activity.metadata.performance.metric}: +${activity.metadata.performance.change}%`}
                              color="success"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < displayedActivities.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              </Fade>
            ))}
          </List>
        )}

        {!showAll && filteredActivities.length > maxItems && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button size="small" onClick={() => setShowAll(true)}>
              Show {filteredActivities.length - maxItems} more activities
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => { setSelectedFilter([]); handleFilterClose(); }}>
          All Activities
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setSelectedFilter(['campaign_created', 'campaign_updated', 'campaign_launched']); handleFilterClose(); }}>
          Campaigns
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter(['asset_uploaded', 'asset_generated']); handleFilterClose(); }}>
          Assets
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter(['approval_requested', 'approval_completed']); handleFilterClose(); }}>
          Approvals
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter(['performance_alert']); handleFilterClose(); }}>
          Performance
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ActivityFeed;
