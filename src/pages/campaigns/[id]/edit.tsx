import React, { useState, useEffect } from 'react';
import { isCampaign } from '@/utils/campaign-helpers';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import type { Campaign } from '@/types/models';
import type { UICampaign } from '@/hooks/useData';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack,
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  LinkedIn,
  Save,
  Delete,
  RestartAlt,
  Warning,
} from '@mui/icons-material';
import DashboardLayout from '../../../components/DashboardLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotification } from '../../../contexts/NotificationContext';
import { useData } from '../../../hooks/useData';

const platformOptions = [
  { name: 'Facebook', icon: <Facebook />, value: 'facebook' },
  { name: 'Instagram', icon: <Instagram />, value: 'instagram' },
  { name: 'Twitter', icon: <Twitter />, value: 'twitter' },
  { name: 'YouTube', icon: <YouTube />, value: 'youtube' },
  { name: 'LinkedIn', icon: <LinkedIn />, value: 'linkedin' },
];

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

interface CampaignFormData {
  name: string;
  description: string;
  status: string;
  platforms: string[];
  budget: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface ErrorsType extends Partial<Record<keyof CampaignFormData, string>> {
  platforms?: string;
}

export default function EditCampaign() {
  const router = useRouter();
  const { id } = router.query;
  const { showNotification } = useNotification();
  const { data: campaign, loading, error } = useData('campaigns', id as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    status: 'draft',
    platforms: [],
    budget: '',
    startDate: null,
    endDate: null,
  });
  const [errors, setErrors] = useState<ErrorsType>({});

  useEffect(() => {
    if (campaign && !Array.isArray(campaign)) {
      const campaignData = campaign as Campaign | UICampaign;
      
      // Extract budget value properly
      let budgetValue = '';
      if (isCampaign(campaignData)) {
        // Check if budget is an object with total property
        const budget = campaignData.budget;
        if (budget && typeof budget === 'object' && 'total' in budget) {
          budgetValue = budget.total.toString();
        } else if (typeof budget === 'number') {
          budgetValue = budget.toString();
        }
      } else {
        // UICampaign has budget as a number
        budgetValue = campaignData.budget?.toString() || '';
      }
      
      // Extract dates properly
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      
      if (isCampaign(campaignData) && 'schedule' in campaignData && campaignData.schedule) {
        startDate = campaignData.schedule.startDate ? new Date(campaignData.schedule.startDate) : null;
        endDate = campaignData.schedule.endDate ? new Date(campaignData.schedule.endDate) : null;
      } else if ('startDate' in campaignData && 'endDate' in campaignData) {
        // UICampaign has startDate/endDate as direct properties
        startDate = campaignData.startDate ? new Date(campaignData.startDate) : null;
        endDate = campaignData.endDate ? new Date(campaignData.endDate) : null;
      }
      
      // Extract platforms
      let platforms: string[] = [];
      if (isCampaign(campaignData)) {
        platforms = campaignData.targeting?.platforms || [];
      } else {
        // UICampaign has platforms as direct property
        platforms = campaignData.platforms || [];
      }
      
      setFormData({
        name: campaignData.name || '',
        description: campaignData.description || '',
        status: campaignData.status || 'draft',
        platforms,
        budget: budgetValue,
        startDate,
        endDate,
      });
    }
  }, [campaign]);

  const handleFieldChange = (field: keyof CampaignFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePlatformToggle = (platform: string) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter((p) => p !== platform)
      : [...formData.platforms, platform];
    handleFieldChange('platforms', newPlatforms);
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorsType = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Enter a valid budget amount';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // In a real app, this would submit to the API
      showNotification('Campaign updated successfully!', 'success');
      router.push(`/campaigns/${id}`);
    } catch {
      showNotification('Failed to update campaign. Please try again.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      // In a real app, this would delete via API
      showNotification('Campaign deleted successfully', 'success');
      router.push('/campaigns');
    } catch {
      showNotification('Failed to delete campaign. Please try again.', 'error');
    }
  };

  const handleReset = () => {
    if (campaign && !Array.isArray(campaign)) {
      const campaignData = campaign as Campaign | UICampaign;
      
      // Extract budget value properly
      let budgetValue = '';
      if (isCampaign(campaignData)) {
        // Check if budget is an object with total property
        const budget = campaignData.budget;
        if (budget && typeof budget === 'object' && 'total' in budget) {
          budgetValue = budget.total.toString();
        } else if (typeof budget === 'number') {
          budgetValue = budget.toString();
        }
      } else {
        // UICampaign has budget as a number
        budgetValue = campaignData.budget?.toString() || '';
      }
      
      // Extract dates properly
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      
      if (isCampaign(campaignData) && 'schedule' in campaignData && campaignData.schedule) {
        startDate = campaignData.schedule.startDate ? new Date(campaignData.schedule.startDate) : null;
        endDate = campaignData.schedule.endDate ? new Date(campaignData.schedule.endDate) : null;
      } else if ('startDate' in campaignData && 'endDate' in campaignData) {
        // UICampaign has startDate/endDate as direct properties
        startDate = campaignData.startDate ? new Date(campaignData.startDate) : null;
        endDate = campaignData.endDate ? new Date(campaignData.endDate) : null;
      }
      
      // Extract platforms
      let platforms: string[] = [];
      if (isCampaign(campaignData)) {
        platforms = campaignData.targeting?.platforms || [];
      } else {
        // UICampaign has platforms as direct property
        platforms = campaignData.platforms || [];
      }
      
      setFormData({
        name: campaignData.name || '',
        description: campaignData.description || '',
        status: campaignData.status || 'draft',
        platforms,
        budget: budgetValue,
        startDate,
        endDate,
      });
      setHasChanges(false);
      setErrors({});
      showNotification('Changes discarded', 'info');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <LoadingSpinner />
        </Container>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <ErrorMessage message="Failed to load campaign. Please try again." />
        </Container>
      </DashboardLayout>
    );
  }

  // Type guard to ensure campaign is a single object
  if (Array.isArray(campaign)) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <ErrorMessage message="Invalid campaign data format." />
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/campaigns/${id}`)}
            sx={{ mb: 2 }}
          >
            Back to Campaign
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Campaign
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Campaign
            </Button>
          </Box>
        </Box>

        {hasChanges && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have unsaved changes
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>

              <TextField
                fullWidth
                label="Campaign Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('description', e.target.value)}
                multiline
                rows={4}
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <TextField
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('status', e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </FormControl>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Target Platforms
                </Typography>
                <FormControl component="fieldset" error={!!errors.platforms}>
                  {errors.platforms && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.platforms}
                    </Alert>
                  )}
                  <FormGroup>
                    <Grid container spacing={2}>
                      {platformOptions.map((platform) => (
                        <Grid item xs={6} sm={4} key={platform.value}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: 2,
                              borderColor: formData.platforms.includes(platform.value)
                                ? 'primary.main'
                                : 'transparent',
                              '&:hover': {
                                borderColor: 'primary.light',
                              },
                            }}
                            onClick={() => handlePlatformToggle(platform.value)}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 1 }}>
                              <Box sx={{ color: 'primary.main', mb: 1 }}>
                                {platform.icon}
                              </Box>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formData.platforms.includes(platform.value)}
                                    onChange={() => handlePlatformToggle(platform.value)}
                                    onClick={(e: React.ClickEvent<HTMLElement>) => e.stopPropagation()}
                                  />
                                }
                                label={platform.name}
                                sx={{ margin: 0 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                </FormControl>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Budget & Timeline
                </Typography>
                <TextField
                  fullWidth
                  label="Campaign Budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('budget', e.target.value)}
                  error={!!errors.budget}
                  helperText={errors.budget}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  margin="normal"
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('startDate', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.startDate}
                            helperText={errors.startDate}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('endDate', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.endDate}
                            helperText={errors.endDate}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  startIcon={<Save />}
                  disabled={!hasChanges}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RestartAlt />}
                  disabled={!hasChanges}
                >
                  Discard Changes
                </Button>
                <Button variant="text" onClick={() => router.push(`/campaigns/${id}`)}>
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Campaign Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(campaign.dateCreated).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body1">
                    {new Date(campaign.lastModified || campaign.dateCreated).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Campaign ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {campaign.id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {campaign.status === 'active' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This campaign is currently active. Changes may affect ongoing performance.
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="error" />
              Delete Campaign
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This action cannot be undone and
              will permanently remove all campaign data and analytics.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete Campaign
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // In a real app, you might fetch the campaign data here
  // For now, we'll rely on client-side data fetching
  return {
    props: {},
  };
};
