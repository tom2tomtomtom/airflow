import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  History as HistoryIcon,
  VpnKey as KeyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  department?: string;
  lastActive?: Date;
  createdAt: Date;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  timestamp: Date;
  ipAddress?: string;
  details?: any;
}

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'admin',
    status: 'active',
    department: 'Marketing',
    lastActive: new Date(Date.now() - 1000 * 60 * 5),
    createdAt: new Date('2023-01-15'),
    permissions: ['all'],
  },
  {
    id: 'u2',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    role: 'manager',
    status: 'active',
    department: 'Creative',
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2023-03-20'),
    permissions: ['campaigns', 'assets', 'analytics'],
  },
  {
    id: 'u3',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'editor',
    status: 'active',
    department: 'Content',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date('2023-06-10'),
    permissions: ['campaigns', 'assets'],
  },
  {
    id: 'u4',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'viewer',
    status: 'inactive',
    department: 'Sales',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date('2023-08-01'),
    permissions: ['view_only'],
  },
];

const roles: Role[] = [
  {
    id: 'r1',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['all'],
    userCount: 2,
  },
  {
    id: 'r2',
    name: 'Manager',
    description: 'Can manage campaigns, assets, and view analytics',
    permissions: ['campaigns', 'assets', 'analytics', 'approve'],
    userCount: 5,
  },
  {
    id: 'r3',
    name: 'Editor',
    description: 'Can create and edit content',
    permissions: ['campaigns', 'assets', 'edit'],
    userCount: 12,
  },
  {
    id: 'r4',
    name: 'Viewer',
    description: 'Read-only access to content',
    permissions: ['view_only'],
    userCount: 25,
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    userId: 'u1',
    userName: 'Sarah Johnson',
    action: 'User Created',
    target: 'emily.davis@example.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    ipAddress: '192.168.1.1',
  },
  {
    id: 'log2',
    userId: 'u2',
    userName: 'Mike Chen',
    action: 'Campaign Approved',
    target: 'Summer Fitness Campaign',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    ipAddress: '192.168.1.2',
  },
  {
    id: 'log3',
    userId: 'u3',
    userName: 'Emily Davis',
    action: 'Asset Uploaded',
    target: '5 files',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    ipAddress: '192.168.1.3',
  },
];

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // New user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as User['role'],
    department: '',
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'viewer',
      department: '',
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (selectedUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...newUser }
          : u
      ));
      showNotification('User updated successfully', 'success');
    } else {
      // Create new user
      const user: User = {
        id: `u${Date.now()}`,
        ...newUser,
        status: 'active',
        createdAt: new Date(),
        permissions: roles.find(r => r.name.toLowerCase() === newUser.role)?.permissions || [],
      };
      setUsers([...users, user]);
      showNotification('User created successfully', 'success');
    }
    
    setUserDialogOpen(false);
  };

  const handleDeleteUser = () => {
    if (currentUserId) {
      setUsers(users.filter(u => u.id !== currentUserId));
      showNotification('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setCurrentUserId(null);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
    showNotification('User status updated', 'success');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserId(null);
  };

  const getRoleChipColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'editor': return 'secondary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const getStatusChipColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <DashboardLayout title="User Management">
        <Box textAlign="center" py={8}>
          <Alert severity="error" sx={{ display: 'inline-flex' }}>
            You don't have permission to access this page
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>User Management | AIrWAVE</title>
      </Head>
      <DashboardLayout title="User Management">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and permissions
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Users
                    </Typography>
                    <Typography variant="h4">{users.length}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <GroupIcon color="primary" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Active Users
                    </Typography>
                    <Typography variant="h4">
                      {users.filter(u => u.status === 'active').length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <ActiveIcon color="success" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Roles
                    </Typography>
                    <Typography variant="h4">{roles.length}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <SecurityIcon color="secondary" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Recent Activity
                    </Typography>
                    <Typography variant="h4">{mockAuditLogs.length}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <HistoryIcon color="info" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Users" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Roles & Permissions" icon={<SecurityIcon />} iconPosition="start" />
            <Tab label="Audit Log" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Users Tab */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            {/* Filters */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button startIcon={<UploadIcon />}>Import</Button>
                <Button startIcon={<DownloadIcon />}>Export</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateUser}>
                  Add User
                </Button>
              </Grid>
            </Grid>

            {/* Users Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>{user.name.charAt(0)}</Avatar>
                            <Typography>{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={getRoleChipColor(user.role)}
                          />
                        </TableCell>
                        <TableCell>{user.department || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            size="small"
                            color={getStatusChipColor(user.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {user.lastActive
                            ? formatDistanceToNow(user.lastActive, { addSuffix: true })
                            : 'Never'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, user.id)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {roles.map((role) => (
              <Grid item xs={12} md={6} key={role.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{role.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.userCount} users
                        </Typography>
                      </Box>
                      <IconButton>
                        <EditIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" paragraph>
                      {role.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {role.permissions.map((permission) => (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Audit Log Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" />
                      </TableCell>
                      <TableCell>{log.target || '-'}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </TableCell>
                      <TableCell>{log.ipAddress || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Settings Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Authentication Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable Two-Factor Authentication"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Require Strong Passwords"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Enable Single Sign-On (SSO)"
                    />
                    <TextField
                      label="Session Timeout (minutes)"
                      type="number"
                      defaultValue="30"
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Registration Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Allow Self-Registration"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Require Email Verification"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Require Admin Approval"
                    />
                    <TextField
                      label="Default Role for New Users"
                      select
                      defaultValue="viewer"
                      fullWidth
                    >
                      <MenuItem value="viewer">Viewer</MenuItem>
                      <MenuItem value="editor">Editor</MenuItem>
                    </TextField>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                disabled={!!selectedUser}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Department"
                fullWidth
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              />
              {!selectedUser && (
                <Alert severity="info">
                  An invitation email will be sent to the user with login instructions.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveUser}>
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            const user = users.find(u => u.id === currentUserId);
            if (user) {
              handleEditUser(user);
              handleMenuClose();
            }
          }}>
            <ListItemIcon><EditIcon /></ListItemIcon>
            <ListItemText>Edit User</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (currentUserId) {
              handleToggleUserStatus(currentUserId);
              handleMenuClose();
            }
          }}>
            <ListItemIcon><BlockIcon /></ListItemIcon>
            <ListItemText>Toggle Status</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
            showNotification('Password reset email sent', 'success');
          }}>
            <ListItemIcon><KeyIcon /></ListItemIcon>
            <ListItemText>Reset Password</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        </Menu>
      </DashboardLayout>
    </>
  );
};

export default UserManagementPage;
