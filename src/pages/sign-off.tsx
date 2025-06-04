import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Chip, 
  Divider, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Tabs, 
  Tab, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Avatar, 
  Badge, 
  Alert, 
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  AvatarGroup,
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Edit as EditIcon, 
  Visibility as VisibilityIcon, 
  Send as SendIcon, 
  ThumbUp as ApproveIcon, 
  ThumbDown as RejectIcon, 
  Person as PersonIcon, 
} from '@mui/icons-material';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCampaigns, useAssets, useMatrices } from '@/hooks/useData';
import type { Campaign, Asset, Matrix } from '@/types/models';

// Interface for approval item
interface ApprovalItem {
  id: string;
  title: string;
  type: 'campaign' | 'asset' | 'matrix' | 'copy';
  entityId: string;
  platform?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  submittedBy: string;
  submittedDate: string;
  dueDate?: string;
  approvers: {
    id: string;
    name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    comment?: string;
    date?: string;
  }[];
  content: {
    preview?: string;
    description?: string;
    attachments?: {
      id: string;
      name: string;
      type: string;
      url: string;
    }[];
  };
  history: {
    id: string;
    action: string;
    user: string;
    date: string;
    comment?: string;
  }[];
  comments: {
    id: string;
    user: string;
    text: string;
    date: string;
  }[];
}

// Sign Off Page Component
const SignOffPage: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(activeClient?.id);
  const { data: assets, isLoading: assetsLoading } = useAssets(activeClient?.id);
  const { data: matrices, isLoading: matricesLoading } = useMatrices(activeClient?.id);
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('all');

  const isLoading = campaignsLoading || assetsLoading || matricesLoading;

  // Transform actual data into approval items
  const approvalItems: ApprovalItem[] = [
    // Transform campaigns
    ...(campaigns || []).map((campaign: Campaign) => ({
      id: `campaign-${campaign.id}`,
      title: campaign.name,
      type: 'campaign' as const,
      entityId: campaign.id,
      status: 'pending' as const,
      submittedBy: 'System',
      submittedDate: new Date(campaign.dateCreated).toLocaleDateString(),
      dueDate: campaign.schedule?.endDate ? new Date(campaign.schedule.endDate).toLocaleDateString() : undefined,
      approvers: [
        {
          id: 'u1',
          name: 'Marketing Director',
          role: 'Final Approval',
          status: 'pending' as const,
        },
        {
          id: 'u2',
          name: 'Brand Manager',
          role: 'Brand Compliance',
          status: 'pending' as const,
        },
      ],
      content: {
        description: campaign.description,
      },
      history: [
        {
          id: 'h1',
          action: 'Created',
          user: 'System',
          date: new Date(campaign.dateCreated).toLocaleDateString(),
        },
      ],
      comments: [],
    })),
    // Transform matrices that need approval
    ...(matrices || []).filter((matrix: Matrix) => matrix.status !== 'approved').map((matrix: Matrix) => ({
      id: `matrix-${matrix.id}`,
      title: matrix.name,
      type: 'matrix' as const,
      entityId: matrix.id,
      status: matrix.approvalStatus?.status === 'approved' ? 'approved' as const : 
              matrix.approvalStatus?.status === 'rejected' ? 'rejected' as const : 
              'pending' as const,
      submittedBy: 'System',
      submittedDate: new Date(matrix.dateCreated).toLocaleDateString(),
      approvers: [
        {
          id: 'u1',
          name: 'Creative Director',
          role: 'Creative Approval',
          status: matrix.approvalStatus?.status === 'approved' ? 'approved' as const : 'pending' as const,
          date: matrix.approvalStatus?.approvalDate ? new Date(matrix.approvalStatus.approvalDate).toLocaleDateString() : undefined,
          comment: matrix.approvalStatus?.comments,
        },
      ],
      content: {
        description: matrix.description,
      },
      history: [
        {
          id: 'h1',
          action: 'Created',
          user: 'System',
          date: new Date(matrix.dateCreated).toLocaleDateString(),
        },
        ...(matrix.approvalStatus?.approvalDate ? [{
          id: 'h2',
          action: matrix.approvalStatus.status === 'approved' ? 'Approved' : 'Rejected',
          user: 'Creative Director',
          date: new Date(matrix.approvalStatus.approvalDate).toLocaleDateString(),
          comment: matrix.approvalStatus.comments,
        }] : []),
      ],
      comments: [],
    })),
    // Add some demo AI-generated assets for approval
    ...(assets || []).filter((asset: Asset) => asset.tags?.includes('ai-generated')).slice(0, 2).map((asset: Asset, index: number) => ({
      id: `asset-${asset.id}`,
      title: asset.name,
      type: 'asset' as const,
      entityId: asset.id,
      status: index === 0 ? 'changes_requested' as const : 'pending' as const,
      submittedBy: 'AI Generator',
      submittedDate: new Date(asset.dateCreated).toLocaleDateString(),
      approvers: [
        {
          id: 'u1',
          name: 'Content Manager',
          role: 'Content Review',
          status: index === 0 ? 'changes_requested' as const : 'pending' as const,
          comment: index === 0 ? 'Please adjust the color balance to match brand guidelines' : undefined,
        },
      ],
      content: {
        preview: asset.url,
        description: `AI Generated: ${asset.metadata?.aiPrompt || 'No prompt available'}`,
      },
      history: [
        {
          id: 'h1',
          action: 'Generated',
          user: 'AI System',
          date: new Date(asset.dateCreated).toLocaleDateString(),
        },
        ...(index === 0 ? [{
          id: 'h2',
          action: 'Changes Requested',
          user: 'Content Manager',
          date: new Date().toLocaleDateString(),
          comment: 'Please adjust the color balance to match brand guidelines',
        }] : []),
      ],
      comments: [],
    })),
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApprove = (itemId: string) => {
    showNotification(`Item ${itemId} approved successfully`, 'success');
    setComment('');
  };

  const handleReject = (itemId: string) => {
    if (!comment) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }
    showNotification(`Item ${itemId} rejected`, 'error');
    setComment('');
  };

  const handleRequestChanges = (itemId: string) => {
    if (!comment) {
      showNotification('Please specify what changes are needed', 'warning');
      return;
    }
    showNotification(`Changes requested for ${itemId}`, 'warning');
    setComment('');
  };

  const handleViewDetails = (item: ApprovalItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const handleAddComment = () => {
    if (!comment || !selectedItem) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      user: 'Current User',
      text: comment,
      date: new Date().toLocaleDateString(),
    };
    
    selectedItem.comments.push(newComment);
    setComment('');
    showNotification('Comment added', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'changes_requested':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredItems = approvalItems.filter(item => {
    if (activeTab === 0) return item.status === 'pending' || item.status === 'changes_requested';
    if (activeTab === 1) return item.approvers.some(a => a.status !== 'pending');
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (!activeClient) {
    return (
      <DashboardLayout title="Sign Off">
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to view approvals
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Sign Off">
        <LoadingSkeleton variant="table" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sign Off">
      <Head>
        <title>Sign Off - AIrWAVE</title>
      </Head>

      <Box>
        <Typography variant="h4" gutterBottom>
          Approval Workflow
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={filteredItems.filter(i => i.status === 'pending' || i.status === 'changes_requested').length} color="error">
                  Pending Approvals
                </Badge>
              } 
            />
            <Tab label="My Approvals" />
            <Tab label="All Items" />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filter}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="changes_requested">Changes Requested</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Statistics
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Pending:</Typography>
                    <Chip label={approvalItems.filter(i => i.status === 'pending').length} size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Approved:</Typography>
                    <Chip label={approvalItems.filter(i => i.status === 'approved').length} size="small" color="success" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Rejected:</Typography>
                    <Chip label={approvalItems.filter(i => i.status === 'rejected').length} size="small" color="error" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Changes:</Typography>
                    <Chip label={approvalItems.filter(i => i.status === 'changes_requested').length} size="small" color="warning" />
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            {filteredItems.length === 0 ? (
              <Alert severity="info">No items to review</Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredItems.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="h6">
                              {item.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
                              <Chip 
                                label={item.type} 
                                size="small" 
                                color="primary" 
                              />
                              {item.platform && (
                                <Chip 
                                  label={item.platform} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              )}
                              <Chip 
                                label={item.status.replace('_', ' ')} 
                                size="small" 
                                color={getStatusColor(item.status) as any}
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Submitted by {item.submittedBy} on {item.submittedDate}
                            </Typography>
                            {item.dueDate && (
                              <Typography variant="body2" color="warning.main">
                                Due: {item.dueDate}
                              </Typography>
                            )}
                            {item.content.description && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {item.content.description}
                              </Typography>
                            )}
                          </Box>
                          <IconButton onClick={() => handleViewDetails(item)} aria-label="Icon button">                            <VisibilityIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Approvers
                          </Typography>
                          <AvatarGroup max={4}>
                            {item.approvers.map((approver) => (
                              <Avatar
                                key={approver.id}
                                sx={{ 
                                  bgcolor: getStatusColor(approver.status) + '.main',
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {approver.status === 'approved' ? <CheckIcon fontSize="small" /> :
                                 approver.status === 'rejected' ? <CloseIcon fontSize="small" /> :
                                 approver.status === 'changes_requested' ? <EditIcon fontSize="small" /> :
                                 approver.name.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </Box>
                      </CardContent>
                      {(item.status === 'pending' || item.status === 'changes_requested') && (
                        <CardActions>
                          <Button
                            startIcon={<ApproveIcon />}
                            onClick={() => handleApprove(item.id)}
                            color="success"
                            size="small"
                          >
                            Approve
                          </Button>
                          <Button
                            startIcon={<RejectIcon />}
                            onClick={() => handleReject(item.id)}
                            color="error"
                            size="small"
                          >
                            Reject
                          </Button>
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => handleRequestChanges(item.id)}
                            color="warning"
                            size="small"
                          >
                            Request Changes
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedItem && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  {selectedItem.title}
                  <Chip 
                    label={selectedItem.status.replace('_', ' ')} 
                    color={getStatusColor(selectedItem.status) as any}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                {selectedItem.content.preview && (
                  <Box sx={{ mb: 2 }}>
                    <Image src={selectedItem.content.preview} alt={""} width={500} height={300} />
                  </Box>
                )}
                
                <Typography variant="body1" paragraph>
                  {selectedItem.content.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Approval History
                </Typography>
                <List>
                  {selectedItem.history.map((event) => (
                    <ListItem key={event.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${event.action} by ${event.user}`}
                        secondary={
                          <>
                            {event.date}
                            {event.comment && <Typography variant="body2">{event.comment}</Typography>}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Comments
                </Typography>
                {selectedItem.comments.map((comment) => (
                  <Box key={comment.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {comment.user} - {comment.date}
                    </Typography>
                    <Typography variant="body2">
                      {comment.text}
                    </Typography>
                  </Box>
                ))}
                
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                   
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLElement>) => setComment(e.target.value)}
                  />
                  <Button
                    startIcon={<SendIcon />}
                    onClick={handleAddComment}
                    sx={{ mt: 1 }}
                    disabled={!comment}
                  >
                    Add Comment
                  </Button>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                {(selectedItem.status === 'pending' || selectedItem.status === 'changes_requested') && (
                  <>
                    <Button
                      color="success"
                      variant="contained"
                      onClick={() => {
                        handleApprove(selectedItem.id);
                        setDetailsOpen(false);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        handleReject(selectedItem.id);
                        setDetailsOpen(false);
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default SignOffPage;
