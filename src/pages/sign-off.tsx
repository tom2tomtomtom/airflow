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
