import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
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
  CardContent,
  Alert,
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
} from '@mui/icons-material';
import { addDays } from 'date-fns';
import DashboardLayout from '../../components/DashboardLayout';
import { useNotification } from '../../contexts/NotificationContext';
import { useData } from '../../hooks/useData';

const platformOptions = [
  { name: 'Facebook', icon: <Facebook />, value: 'facebook' },
  { name: 'Instagram', icon: <Instagram />, value: 'instagram' },
  { name: 'Twitter', icon: <Twitter />, value: 'twitter' },
  { name: 'YouTube', icon: <YouTube />, value: 'youtube' },
  { name: 'LinkedIn', icon: <LinkedIn />, value: 'linkedin' },
];

interface CampaignFormData {
  name: string;
  description: string;
  client: string;
  platforms: string[];
  budget: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface ErrorsType extends Partial<Record<keyof CampaignFormData, string>> {
  platforms?: string;
}

export default function NewCampaign() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { data: clients } = useData('clients');
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    client: '',
    platforms: [],
    budget: '',
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
  });
  const [errors, setErrors] = useState<ErrorsType>({});

  const validateStep = (step: number): boolean => {
    const newErrors: ErrorsType = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = 'Campaign name is required';
        }
        if (!formData.client) {
          newErrors.client = 'Please select a client';
        }
        break;
      case 1:
        if (formData.platforms.length === 0) {
          newErrors.platforms = 'Select at least one platform';
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

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      // In a real app, this would submit to the API
      showNotification('Campaign created successfully!', 'success');
      router.push('/campaigns');
    } catch {
      showNotification('Failed to create campaign. Please try again.', 'error');
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
            Set up a new marketing campaign across multiple platforms
          </Typography>
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
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, description: e.target.value })}
                        multiline
                        rows={4}
                        margin="normal"
                      />
                      <FormControl fullWidth margin="normal" error={!!errors.client}>
                        <TextField
                          select
                          label="Client"
                          value={formData.client}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, client: e.target.value })}
                          SelectProps={{
                            native: true,
                          }}
                          error={!!errors.client}
                          helperText={errors.client}
                        >
                          <option value="">Select a client</option>
                          {Array.isArray(clients) && clients.map((client: any) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </TextField>
                      </FormControl>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button variant="contained" onClick={handleNext}>
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Target Platforms</StepLabel>
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
                                  <CardContent sx={{ textAlign: 'center' }}>
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
                  <StepLabel>Budget & Timeline</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Campaign Budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, budget: e.target.value })}
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
                              onChange={(e: React.ChangeEvent<HTMLElement>) =>
                                setFormData({ ...formData, startDate: newValue as Date | null })
                              }
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
                              onChange={(e: React.ChangeEvent<HTMLElement>) =>
                                setFormData({ ...formData, endDate: newValue as Date | null })
                              }
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
                            Description
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {formData.description || 'No description provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Platforms
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {formData.platforms.map((platform) => {
                              const option = platformOptions.find((p) => p.value === platform);
                              return (
                                <Box
                                  key={platform}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {option?.icon}
                                  <Typography variant="body1">{option?.name}</Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Budget
                          </Typography>
                          <Typography variant="body1">
                            ${parseFloat(formData.budget || '0').toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body1">
                            {formData.startDate?.toLocaleDateString()} -{' '}
                            {formData.endDate?.toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button onClick={handleBack} sx={{ mr: 1 }}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        startIcon={<CheckCircle />}
                      >
                        Create Campaign
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Info sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Campaign Tips</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  • Choose a clear, descriptive name for your campaign
                </Typography>
                <Typography variant="body2" paragraph>
                  • Select all platforms where you want to run ads
                </Typography>
                <Typography variant="body2" paragraph>
                  • Set a realistic budget based on your goals
                </Typography>
                <Typography variant="body2">
                  • Allow enough time for campaign optimization
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
