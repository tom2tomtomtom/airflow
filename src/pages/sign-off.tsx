import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
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
  SelectChangeEvent, 
  Tabs, 
  Tab, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemAvatar, 
  Avatar, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Badge, 
  Tooltip, 
  Alert, 
  LinearProgress,
  InputAdornment,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon, 
  Comment as CommentIcon, 
  Send as SendIcon, 
  ThumbUp as ApproveIcon, 
  ThumbDown as RejectIcon, 
  History as HistoryIcon, 
  Refresh as RefreshIcon, 
  MoreVert as MoreIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  CalendarToday as CalendarIcon, 
  Person as PersonIcon, 
  Group as TeamIcon, 
  Assignment as AssignmentIcon, 
  AssignmentTurnedIn as CompletedIcon, 
  AssignmentLate as OverdueIcon, 
  Notifications as NotificationsIcon, 
  Email as EmailIcon, 
  AttachFile as AttachmentIcon, 
  Link as LinkIcon, 
  ExpandMore as ExpandMoreIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import DashboardLayout from '@/components/DashboardLayout';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Interface for approval item
interface ApprovalItem {
  id: string;
  title: string;
  type: 'post' | 'campaign' | 'asset' | 'copy';
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
    preview: string;
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
}

// Mock data for approval items
const mockApprovalItems: ApprovalItem[] = [
  {
    id: 'a1',
    title: 'Summer Fitness Campaign',
    type: 'campaign',
    status: 'pending',
    submittedBy: 'John Smith',
    submittedDate: '2023-05-15',
    dueDate: '2023-05-20',
    approvers: [
      {
        id: 'u1',
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        status: 'approved',
        comment: 'Looks great! Ready to go.',
        date: '2023-05-16',
      },
      {
        id: 'u2',
        name: 'Michael Brown',
        role: 'Brand Manager',
        status: 'pending',
      },
      {
        id: 'u3',
        name: 'Emily Davis',
        role: 'Legal Compliance',
        status: 'pending',
      },
    ],
    content: {
      preview: 'https://source.unsplash.com/random/800x600?fitness',
      description: 'Summer fitness campaign targeting 18-35 year olds with special promotions for gym memberships and fitness classes.',
      attachments: [
        {
          id: 'att1',
          name: 'Campaign Brief.pdf',
          type: 'pdf',
          url: '#',
        },
        {
          id: 'att2',
          name: 'Creative Assets.zip',
          type: 'zip',
          url: '#',
        },
      ],
    },
    history: [
      {
        id: 'h1',
        action: 'Created',
        user: 'John Smith',
        date: '2023-05-15',
      },
      {
        id: 'h2',
        action: 'Approved',
        user: 'Sarah Johnson',
        date: '2023-05-16',
        comment: 'Looks great! Ready to go.',
      },
    ],
  },
  {
    id: 'a2',
    title: 'New Protein Shake Product Launch',
    type: 'post',
    platform: 'instagram',
    status: 'changes_requested',
    submittedBy: 'Alex Wilson',
    submittedDate: '2023-05-14',
    dueDate: '2023-05-19',
    approvers: [
      {
        id: 'u1',
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        status: 'changes_requested',
        comment: 'Please update the product benefits section and add more details about ingredients.',
        date: '2023-05-15',
      },
      {
        id: 'u2',
        name: 'Michael Brown',
        role: 'Brand Manager',
        status: 'approved',
        date: '2023-05-15',
      },
    ],
    content: {
      preview: 'https://source.unsplash.com/random/800x800?protein',
      description: 'Instagram post announcing our new protein shake product with key benefits and special launch discount.',
    },
    history: [
      {
        id: 'h1',
        action: 'Created',
        user: 'Alex Wilson',
        date: '2023-05-14',
      },
      {
        id: 'h2',
        action: 'Approved',
        user: 'Michael Brown',
        date: '2023-05-15',
      },
      {
        id: 'h3',
        action: 'Changes Requested',
        user: 'Sarah Johnson',
        date: '2023-05-15',
        comment: 'Please update the product benefits section and add more details about ingredients.',
      },
    ],
  },
  {
    id: 'a3',
    title: 'Workout Tips Blog Post',
    type: 'copy',
    status: 'approved',
    submittedBy: 'Rachel Green',
    submittedDate: '2023-05-10',
    approvers: [
      {
        id: 'u1',
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        status: 'approved',
        date: '2023-05-11',
      },
      {
        id: 'u2',
        name: 'Michael Brown',
        role: 'Brand Manager',
        status: 'approved',
        date: '2023-05-12',
      },
      {
        id: 'u3',
        name: 'Emily Davis',
        role: 'Legal Compliance',
        status: 'approved',
        date: '2023-05-13',
      },
    ],
    content: {
      preview: 'https://source.unsplash.com/random/800x600?workout',
      description: 'Blog post with 10 expert workout tips for beginners to advanced fitness enthusiasts.',
      attachments: [
        {
          id: 'att1',
          name: 'Workout Tips Draft.docx',
          type: 'docx',
          url: '#',
        },
      ],
    },
    history: [
      {
        id: 'h1',
        action: 'Created',
        user: 'Rachel Green',
        date: '2023-05-10',
      },
      {
        id: 'h2',
        action: 'Approved',
        user: 'Sarah Johnson',
        date: '2023-05-11',
      },
      {
        id: 'h3',
        action: 'Approved',
        user: 'Michael Brown',
        date: '2023-05-12',
      },
      {
        id: 'h4',
        action: 'Approved',
        user: 'Emily Davis',
        date: '2023-05-13',
      },
    ],
  },
];

// Sign Off Page Component
const SignOffPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { activeClient: selectedClient } = useClient();
  const [activeTab, setActiveTab] = useState(0);
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>(mockApprovalItems);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApprove = (itemId: string) => {
    // Handle approval logic
    console.log('Approving item:', itemId);
  };

  const handleReject = (itemId: string) => {
    // Handle rejection logic
    console.log('Rejecting item:', itemId);
  };

  const handleRequestChanges = (itemId: string) => {
    // Handle request changes logic
    console.log('Requesting changes for item:', itemId);
  };

  const handleViewDetails = (item: ApprovalItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
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
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Sign Off - Airwave</title>
      </Head>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Approval Workflow
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Pending Approvals" />
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
                  onChange={(e) => setFilter(e.target.value)}
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
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Pending: {approvalItems.filter(i => i.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">
                    Approved: {approvalItems.filter(i => i.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2">
                    Rejected: {approvalItems.filter(i => i.status === 'rejected').length}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              {filteredItems.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6">
                            {item.title}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
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
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Submitted by {item.submittedBy} on {item.submittedDate}
                          </Typography>
                          {item.dueDate && (
                            <Typography variant="body2" color="warning.main">
                              Due: {item.dueDate}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </Button>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Approvers
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {item.approvers.map((approver) => (
                            <Chip
                              key={approver.id}
                              label={`${approver.name} (${approver.status})`}
                              size="small"
                              color={getStatusColor(approver.status) as any}
                              variant={approver.status === 'pending' ? 'outlined' : 'filled'}
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApprove(item.id)}
                        color="success"
                      >
                        Approve
                      </Button>
                      <Button
                        startIcon={<RejectIcon />}
                        onClick={() => handleReject(item.id)}
                        color="error"
                      >
                        Reject
                      </Button>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleRequestChanges(item.id)}
                        color="warning"
                      >
                        Request Changes
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
                {selectedItem.title}
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  {selectedItem.content.description}
                </Typography>
                {selectedItem.content.preview && (
                  <img 
                    src={selectedItem.content.preview} 
                    alt="Preview" 
                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default SignOffPage;
