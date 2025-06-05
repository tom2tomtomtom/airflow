import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  Alert,
  MenuItem,
  Chip,
  TextField,
  Divider,
  CardContent,
  CircularProgress,
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
  Info,
  CheckCircle,
  MusicNote as TikTok,
  Add as AddIcon,
} from '@mui/icons-material';
import { addDays } from 'date-fns';
import DashboardLayout from '../../components/DashboardLayout';
import { useNotification } from '../../contexts/NotificationContext';
import { useClient } from '../../contexts/ClientContext';
import { useBriefs } from '../../hooks/useData';

const platformOptions = [
  { name: 'Facebook', icon: <Facebook />, value: 'facebook' },
  { name: 'Instagram', icon: <Instagram />, value: 'instagram' },
  { name: 'Twitter', icon: <Twitter />, value: 'twitter' },
  { name: 'YouTube', icon: <YouTube />, value: 'youtube' },
  { name: 'LinkedIn', icon: <LinkedIn />, value: 'linkedin' },
  { name: 'TikTok', icon: <TikTok />, value: 'tiktok' },
];

const campaignTypes = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'retention', label: 'Customer Retention' },
  { value: 'mixed', label: 'Mixed Objectives' },
];

const priorities = [
  { value: 'low', label: 'Low', color: '#4caf50' },
  { value: 'medium', label: 'Medium', color: '#ff9800' },
  { value: 'high', label: 'High', color: '#f44336' },
  { value: 'urgent', label: 'Urgent', color: '#9c27b0' },
];

const kpiOptions = [
  'Brand Awareness',
  'Website Traffic',
  'Lead Generation',
  'Sales/Conversions',
  'Engagement Rate',
  'Click-through Rate',
  'Cost per Acquisition',
  'Return on Ad Spend',
  'Video Views',
  'App Downloads',
];

interface CampaignFormData {
  name: string;
  description: string;
  objective: string;
  brief_id: string;
  platforms: string[];
  budget: string;
  startDate: Date | null;
  endDate: Date | null;
  campaign_type: string;
  priority: string;
  kpis: string[];
  tags: string[];
  creative_requirements: {
    video_length?: number;
    image_formats?: string[];
    copy_length?: number;
    brand_compliance?: boolean;
  };
}

interface ErrorsType extends Partial<Record<keyof CampaignFormData, string>> {
  platforms?: string;
  kpis?: string;
}

export default function NewCampaign() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { activeClient } = useClient();
  const { data: briefs, isLoading: briefsLoading } = useBriefs(activeClient?.id);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    objective: '',
    brief_id: '',
    platforms: [],
    budget: '',
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    campaign_type: 'awareness',
    priority: 'medium',
    kpis: [],
    tags: [],
    creative_requirements: {
      brand_compliance: true,
    },
  });
  const [errors, setErrors] = useState<ErrorsType>({});
  const [newTag, setNewTag] = useState('');

  const validateStep = (step: number): boolean => {
    const newErrors: ErrorsType = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = 'Campaign name is required';
        }
        if (!formData.objective.trim()) {
          newErrors.objective = 'Campaign objective is required';
        }
        if (!activeClient) {
          newErrors.client = 'Please select a client first';
        }
        break;
      case 1:
        if (formData.platforms.length === 0) {
          newErrors.platforms = ' at least one platform';
        }
        if (formData.kpis.length === 0) {
          newErrors.kpis = ' at least one KPI to track';
        }
        break;
      case 2:
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
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleKPIToggle = (kpi: string) => {
    setFormData((prev) => ({
      ...prev,
      kpis: prev.kpis.includes(kpi)
        ? prev.kpis.filter((k) => k !== kpi)
        : [...prev.kpis, kpi],
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep) || !activeClient) return;

    setIsSubmitting(true);
    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        objective: formData.objective,
        brief_id: formData.brief_id || undefined,
        platforms: formData.platforms,
        budget: parseFloat(formData.budget),
        start_date: formData.startDate?.toISOString().split('T')[0],
        end_date: formData.endDate?.toISOString().split('T')[0],
        campaign_type: formData.campaign_type,
        priority: formData.priority,
        kpis: formData.kpis,
        tags: formData.tags,
        creative_requirements: formData.creative_requirements,
        client_id: activeClient.id,
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create campaign');
      }

      showNotification('Campaign created successfully!', 'success');
      router.push(`/campaigns/${result.data.id}`);
    } catch (error) {
      console.error('Campaign creation error:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to create campaign. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/campaigns')}
            sx={{ mb: 2 }}
          >
            Back to Campaigns
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Create New Campaign
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set up a new marketing campaign for {activeClient?.name}
          </Typography>
          {!activeClient && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please select a client before creating a campaign
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>Basic Information</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Campaign Name"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                        margin="normal"
                        placeholder="e.g., Summer 2024 Product Launch"
                      />
                      <TextField
                        fullWidth
                        label="Campaign Objective"
                        value={formData.objective}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, objective: e.target.value })}
                        error={!!errors.objective}
                        helperText={errors.objective}
                        margin="normal"
                        placeholder="e.g., Increase brand awareness and drive website traffic"
                      />
                      <TextField
                        fullWidth
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                        multiline
                        rows={3}
                        margin="normal"
                        placeholder="Additional details about this campaign..."
                      />
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <TextField
                              select
                              label="Campaign Type"
                              value={formData.campaign_type}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, campaign_type: e.target.value })}
                            >
                              {campaignTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <TextField
                              select
                              label="Priority"
                              value={formData.priority}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: e.target.value })}
                            >
                              {priorities.map((priority) => (
                                <MenuItem key={priority.value} value={priority.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: priority.color,
                                        mr: 1,
                                      }}
                                    />
                                    {priority.label}
                                  </Box>
                                </MenuItem>
                              ))}
                            </TextField>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {briefs && briefs.length > 0 && (
                        <FormControl fullWidth margin="normal">
                          <TextField
                            select
                            label="Link to Brief (Optional)"
                            value={formData.brief_id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, brief_id: e.target.value })}
                          >
                            <MenuItem value="">No brief selected</MenuItem>
                            {briefs.map((brief: any) => (
                              <MenuItem key={brief.id} value={brief.id}>
                                {brief.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </FormControl>
                      )}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleNext}
                        disabled={!activeClient}
                      >
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Platforms & KPIs</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 3 }}>
                      <FormControl component="fieldset" error={!!errors.platforms}>
                        <FormLabel component="legend">Select platforms for this campaign</FormLabel>
                        {errors.platforms && (
                          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                            {errors.platforms}
                          </Alert>
                        )}
                        <FormGroup>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                                    <Box sx={{ color: 'primary.main', mb: 1, fontSize: 24 }}>
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

                      <Divider sx={{ my: 3 }} />

                      <FormControl component="fieldset" error={!!errors.kpis} sx={{ width: '100%' }}>
                        <FormLabel component="legend">Key Performance Indicators (KPIs)</FormLabel>
                        {errors.kpis && (
                          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                            {errors.kpis}
                          </Alert>
                        )}
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {kpiOptions.map((kpi) => (
                            <Grid item xs={12} sm={6} md={4} key={kpi}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formData.kpis.includes(kpi)}
                                    onChange={() => handleKPIToggle(kpi)}
                                  />
                                }
                                label={kpi}
                                sx={{ 
                                  border: 1,
                                  borderColor: formData.kpis.includes(kpi) ? 'primary.main' : 'divider',
                                  borderRadius: 1,
                                  p: 1,
                                  m: 0,
                                  width: '100%',
                                  '&:hover': {
                                    borderColor: 'primary.light',
                                  },
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </FormControl>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button onClick={handleBack} sx={{ mr: 1 }}>
                        Back
                      </Button>
                      <Button variant="contained" onClick={handleNext}>
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Budget, Timeline & Tags</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Campaign Budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, budget: e.target.value })}
                        error={!!errors.budget}
                        helperText={errors.budget || 'Enter total budget for this campaign'}
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
                              onChange={(newValue: Date | null) =>
                                setFormData({ ...formData, startDate: newValue })
                              }
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!errors.startDate,
                                  helperText: errors.startDate,
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label="End Date"
                              value={formData.endDate}
                              onChange={(newValue: Date | null) =>
                                setFormData({ ...formData, endDate: newValue })
                              }
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!errors.endDate,
                                  helperText: errors.endDate,
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </LocalizationProvider>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="subtitle1" gutterBottom>
                        Campaign Tags
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {formData.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => handleRemoveTag(tag)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Add Tag"
                          value={newTag}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="e.g., Q4-2024, Product-Launch"
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          onClick={handleAddTag}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button onClick={handleBack} sx={{ mr: 1 }}>
                        Back
                      </Button>
                      <Button variant="contained" onClick={handleNext}>
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Review & Create</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 3 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Please review your campaign details before creating.
                      </Alert>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Campaign Overview
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Campaign Name
                                  </Typography>
                                  <Typography variant="body1" gutterBottom>
                                    {formData.name}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Objective
                                  </Typography>
                                  <Typography variant="body1" gutterBottom>
                                    {formData.objective}
                                  </Typography>
                                </Grid>
                                {formData.description && (
                                  <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Description
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      {formData.description}
                                    </Typography>
                                  </Grid>
                                )}
                                <Grid item xs={6}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Type
                                  </Typography>
                                  <Typography variant="body1">
                                    {campaignTypes.find(t => t.value === formData.campaign_type)?.label}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Priority
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: priorities.find(p => p.value === formData.priority)?.color,
                                        mr: 1,
                                      }}
                                    />
                                    <Typography variant="body1">
                                      {priorities.find(p => p.value === formData.priority)?.label}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Target Platforms
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {formData.platforms.map((platform) => {
                                  const option = platformOptions.find((p) => p.value === platform);
                                  return (
                                    <Chip
                                      key={platform}
                                      icon={option?.icon}
                                      label={option?.name}
                                      color="primary"
                                      variant="outlined"
                                    />
                                  );
                                })}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Key Performance Indicators
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {formData.kpis.map((kpi) => (
                                  <Chip
                                    key={kpi}
                                    label={kpi}
                                    color="secondary"
                                    variant="outlined"
                                    size="small"
                                  />
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Budget & Timeline
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Budget
                                  </Typography>
                                  <Typography variant="h6" color="primary">
                                    ${parseFloat(formData.budget || '0').toLocaleString()}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Duration
                                  </Typography>
                                  <Typography variant="body1">
                                    {formData.startDate?.toLocaleDateString()} - {formData.endDate?.toLocaleDateString()}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>

                        {formData.tags.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                              <>
                                <Typography variant="h6" gutterBottom>
                                  Tags
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {formData.tags.map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                    />
                                  ))}
                                </Box>
                              </>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button onClick={handleBack} sx={{ mr: 1 }} disabled={isSubmitting}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircle />}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Info sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Campaign Tips</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  <strong>Step 1:</strong> Choose a clear name and specific objective. Link to a brief if available.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Step 2:</strong>  platforms where your audience is most active. Choose KPIs that align with your objectives.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Step 3:</strong> Set realistic budgets and timelines. Use tags for easy organization.
                </Typography>
                <Typography variant="body2">
                  <strong>Step 4:</strong> Review all details carefully. You can edit these later if needed.
                </Typography>
                
                {activeClient && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Client:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {activeClient.name}
                    </Typography>
                  </Box>
                )}
              </>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
