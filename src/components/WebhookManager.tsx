import { getErrorMessage } from '@/utils/errorUtils';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Menu,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Webhook as WebhookIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  client_id: string;
  description?: string;
  active: boolean;
  secret?: string;
  retry_policy: {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
    initial_delay_ms: number;
  };
  headers?: Record<string, string>;
  timeout_ms: number;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    slug: string;
  };
  profiles?: {
    full_name: string;
  };
}

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status: number;
  response_body: string;
  success: boolean;
  delivered_at: string;
}

interface WebhookStatistics {
  total: number;
  active: number;
  inactive: number;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  success_rate: number;
  event_distribution: Record<string, number>;
}

const WebhookManager: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [statistics, setStatistics] = useState<WebhookStatistics | null>(null);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [webhookDetails, setWebhookDetails] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    description: '',
    active: true,
    timeout_ms: 10000,
    retry_policy: {
      max_attempts: 3,
      backoff_strategy: 'exponential' as 'linear' | 'exponential',
      initial_delay_ms: 1000,
    },
    headers: {} as Record<string, string>,
  });
  const [testData, setTestData] = useState({
    event_type: '',
    test_data: '{}',
  });

  // Fetch webhooks
  const fetchWebhooks = async () => {
    if (!activeClient) return;

    try {
      setLoading(true);
      const response = await fetch('/api/webhooks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.data || []);
        setStatistics(data.statistics);
        setAvailableEvents(data.events || []);
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error fetching webhooks:', error);
      showNotification('Failed to load webhooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch webhook details
  const fetchWebhookDetails = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWebhookDetails(data);
        setDetailsDialogOpen(true);
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error fetching webhook details:', error);
      showNotification('Failed to load webhook details', 'error');
    }
  };

  // Create/Update webhook
  const handleSaveWebhook = async () => {
    try {
      const url = selectedWebhook ? `/api/webhooks/${selectedWebhook.id}` : '/api/webhooks';
      const method = selectedWebhook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          client_id: activeClient?.id,
        }),
      });

      if (response.ok) {
        showNotification(
          `Webhook ${selectedWebhook ? 'updated' : 'created'} successfully`,
          'success'
        );
        setDialogOpen(false);
        resetForm();
        fetchWebhooks();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to save webhook', 'error');
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error saving webhook:', error);
      showNotification('Failed to save webhook', 'error');
    }
  };

  // Delete webhook
  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const response = await fetch(`/api/webhooks/${selectedWebhook.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        showNotification('Webhook deleted successfully', 'success');
        setDeleteDialogOpen(false);
        setSelectedWebhook(null);
        fetchWebhooks();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to delete webhook', 'error');
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error deleting webhook:', error);
      showNotification('Failed to delete webhook', 'error');
    }
  };

  // Test webhook
  const handleTestWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const parsedTestData = testData.test_data ? JSON.parse(testData.test_data) : {};
      
      const response = await fetch(`/api/webhooks/${selectedWebhook.id}?action=test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          event_type: testData.event_type,
          test_data: parsedTestData,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification('Webhook test successful', 'success');
      } else {
        showNotification(
          `Webhook test failed: ${result.result?.error || 'Unknown error'}`,
          'error'
        );
      }
      
      setTestDialogOpen(false);
      fetchWebhookDetails(selectedWebhook.id); // Refresh details to show new delivery
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error testing webhook:', error);
      showNotification('Failed to test webhook', 'error');
    }
  };

  // Toggle webhook active state
  const handleToggleWebhook = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}?action=toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        showNotification(
          `Webhook ${webhook.active ? 'deactivated' : 'activated'} successfully`,
          'success'
        );
        fetchWebhooks();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to toggle webhook', 'error');
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error toggling webhook:', error);
      showNotification('Failed to toggle webhook', 'error');
    }
  };

  // Regenerate webhook secret
  const handleRegenerateSecret = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}?action=regenerate-secret`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        showNotification('Webhook secret regenerated successfully', 'success');
        fetchWebhooks();
        if (webhookDetails?.data?.id === webhook.id) {
          fetchWebhookDetails(webhook.id); // Refresh details if currently viewing
        }
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to regenerate secret', 'error');
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error regenerating secret:', error);
      showNotification('Failed to regenerate secret', 'error');
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      description: '',
      active: true,
      timeout_ms: 10000,
      retry_policy: {
        max_attempts: 3,
        backoff_strategy: 'exponential',
        initial_delay_ms: 1000,
      },
      headers: {},
    });
    setSelectedWebhook(null);
  };

  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      description: webhook.description || '',
      active: webhook.active,
      timeout_ms: webhook.timeout_ms,
      retry_policy: webhook.retry_policy,
      headers: webhook.headers || {},
    });
    setDialogOpen(true);
  };

  const getStatusColor = (webhook: Webhook) => {
    if (!webhook.active) return 'default';
    if (webhook.failed_deliveries > webhook.successful_deliveries) return 'error';
    if (webhook.total_deliveries === 0) return 'warning';
    return 'success';
  };

  const getSuccessRate = (webhook: Webhook) => {
    if (webhook.total_deliveries === 0) return 0;
    return Math.round((webhook.successful_deliveries / webhook.total_deliveries) * 100);
  };

  const formatEventName = (event: string) => {
    return event.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, webhook: Webhook) => {
    setMenuAnchor(event.currentTarget);
    setSelectedWebhook(webhook);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedWebhook(null);
  };

  // Effects
  useEffect(() => {
    fetchWebhooks();
  }, [activeClient]);

  if (!activeClient) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            Select a client to manage webhooks
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Webhook Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchWebhooks}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add Webhook
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {statistics.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Webhooks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {statistics.total_deliveries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Deliveries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={statistics.success_rate >= 90 ? 'success.main' : 'warning.main'}>
                  {statistics.success_rate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Webhooks Table */}
      <Card>
        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Events</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Triggered</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 4 }}>
                        <WebhookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No webhooks configured
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add a webhook to receive real-time notifications
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((webhook) => (
                    <TableRow key={webhook.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {webhook.name}
                          </Typography>
                          {webhook.description && (
                            <Typography variant="caption" color="text.secondary">
                              {webhook.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={webhook.url}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}
                          >
                            {webhook.url}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {webhook.events.slice(0, 3).map((event) => (
                            <Chip
                              key={event}
                              label={formatEventName(event)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {webhook.events.length > 3 && (
                            <Chip
                              label={`+${webhook.events.length - 3}`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={webhook.active ? 'Active' : 'Inactive'}
                          color={getStatusColor(webhook) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {getSuccessRate(webhook)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getSuccessRate(webhook)}
                            sx={{ width: 60, height: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {webhook.last_triggered_at ? (
                          <Typography variant="body2" color="text.secondary">
                            {new Date(webhook.last_triggered_at).toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Never
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => fetchWebhookDetails(webhook.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e: React.ClickEvent<HTMLElement>) => handleMenuOpen(e, webhook)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { openEditDialog(selectedWebhook!); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { 
          setTestData({ event_type: selectedWebhook!.events[0] || '', test_data: '{}' });
          setTestDialogOpen(true); 
          handleMenuClose(); 
        }}>
          <ListItemIcon>
            <TestIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Test</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleToggleWebhook(selectedWebhook!); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {selectedWebhook?.active ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleRegenerateSecret(selectedWebhook!); handleMenuClose(); }}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Regenerate Secret</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWebhook ? 'Edit Webhook' : 'Add Webhook'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL"
                value={formData.url}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, url: e.target.value })}
                required
                type="url"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Events</InputLabel>
                <Select
                  multiple
                  value={formData.events}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, events: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={formatEventName(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableEvents.map((event) => (
                    <MenuItem key={event} value={event}>
                      {formatEventName(event)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timeout (ms)"
                type="number"
                value={formData.timeout_ms}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, timeout_ms: parseInt(e.target.value) })}
                inputProps={{ min: 1000, max: 30000 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Retry Policy</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Max Attempts"
                        type="number"
                        value={formData.retry_policy.max_attempts}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({
                          ...formData,
                          retry_policy: {
                            ...formData.retry_policy,
                            max_attempts: parseInt(e.target.value)
                          }
                        })}
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Backoff Strategy</InputLabel>
                        <Select
                          value={formData.retry_policy.backoff_strategy}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({
                            ...formData,
                            retry_policy: {
                              ...formData.retry_policy,
                              backoff_strategy: e.target.value as 'linear' | 'exponential'
                            }
                          })}
                        >
                          <MenuItem value="linear">Linear</MenuItem>
                          <MenuItem value="exponential">Exponential</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Initial Delay (ms)"
                        type="number"
                        value={formData.retry_policy.initial_delay_ms}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({
                          ...formData,
                          retry_policy: {
                            ...formData.retry_policy,
                            initial_delay_ms: parseInt(e.target.value)
                          }
                        })}
                        inputProps={{ min: 1000 }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveWebhook}>
            {selectedWebhook ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Webhook</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a test event to: {selectedWebhook?.name}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={testData.event_type}
              onChange={(e: React.ChangeEvent<HTMLElement>) => setTestData({ ...testData, event_type: e.target.value })}
            >
              {selectedWebhook?.events.map((event) => (
                <MenuItem key={event} value={event}>
                  {formatEventName(event)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Test Data (JSON)"
            value={testData.test_data}
            onChange={(e: React.ChangeEvent<HTMLElement>) => setTestData({ ...testData, test_data: e.target.value })}
            multiline
            rows={4}
            placeholder='{"key": "value"}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTestWebhook}>
            Send Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Webhook</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this webhook? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedWebhook?.name} ({selectedWebhook?.url})
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteWebhook}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Webhook Details: {webhookDetails?.data?.name}
        </DialogTitle>
        <DialogContent>
          {webhookDetails && (
            <Box>
              {/* Basic Info */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Configuration</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">URL</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{webhookDetails.data.url}</Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(webhookDetails.data.url)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Secret</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {showSecret ? webhookDetails.data.secret : '••••••••'}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <VisibilityOff fontSize="small" /> : <ViewIcon fontSize="small" />}
                        </IconButton>
                        {showSecret && (
                          <IconButton size="small" onClick={() => copyToClipboard(webhookDetails.data.secret)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Delivery Statistics */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Delivery Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="h6" color="primary">
                        {webhookDetails.statistics?.total || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h6" color="success.main">
                        {webhookDetails.statistics?.successful || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Successful</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h6" color="error.main">
                        {webhookDetails.statistics?.failed || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Failed</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h6">
                        {webhookDetails.statistics?.success_rate || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Recent Deliveries */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Deliveries</Typography>
                  {webhookDetails.deliveries?.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Event</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Response</TableCell>
                            <TableCell>Delivered At</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {webhookDetails.deliveries.slice(0, 10).map((delivery: WebhookDelivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell>
                                <Chip
                                  label={formatEventName(delivery.event_type)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={delivery.success ? 'Success' : 'Failed'}
                                  color={delivery.success ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {delivery.response_status || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(delivery.delivered_at).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No deliveries yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebhookManager;