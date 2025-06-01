import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
  Avatar,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  ColorLens as ColorIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Upload as UploadIcon,
  Language as WebsiteIcon,
  Palette as PaletteIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
// Dynamic import for MuiColorInput to avoid SSR issues
const MuiColorInput = dynamic(() => import('mui-color-input').then(mod => ({ default: mod.MuiColorInput })), {
  ssr: false,
  loading: () => <div>Loading color picker...</div>
});

import DashboardLayout from '@/components/DashboardLayout';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Real Estate',
  'Food & Beverage', 'Fashion', 'Automotive', 'Entertainment', 'Travel',
  'Sports & Fitness', 'Non-profit', 'Government', 'Manufacturing', 'Other'
];

const voiceTones = [
  'Professional', 'Friendly', 'Casual', 'Authoritative', 'Playful',
  'Empathetic', 'Inspirational', 'Educational', 'Conversational', 'Luxury'
];

export default function CreateClient() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [keyMessages, setKeyMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    website: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logo: '',
    // Brand Guidelines
    voiceTone: '',
    targetAudience: '',
    // Contact for current step
    contactName: '',
    contactEmail: '',
    contactRole: '',
    contactPhone: '',
  });

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `client-logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo: urlData.publicUrl }));
      showNotification('Logo uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showNotification('Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      handleLogoUpload(file);
    }
  };

  const handleAddContact = () => {
    if (!formData.contactName || !formData.contactEmail) {
      showNotification('Name and email are required for contacts', 'error');
      return;
    }

    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: formData.contactName,
      email: formData.contactEmail,
      role: formData.contactRole,
      phone: formData.contactPhone,
      isActive: true,
    };

    setContacts([...contacts, newContact]);
    setFormData(prev => ({
      ...prev,
      contactName: '',
      contactEmail: '',
      contactRole: '',
      contactPhone: '',
    }));
  };

  const handleRemoveContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
  };

  const handleAddKeyMessage = () => {
    if (newMessage.trim() && !keyMessages.includes(newMessage.trim())) {
      setKeyMessages([...keyMessages, newMessage.trim()]);
      setNewMessage('');
    }
  };

  const handleRemoveKeyMessage = (message: string) => {
    setKeyMessages(keyMessages.filter(m => m !== message));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.name && formData.industry);
      case 1:
        return !!(formData.primaryColor && formData.secondaryColor);
      case 2:
        return true; // Contacts are optional
      case 3:
        return !!(formData.voiceTone && formData.targetAudience);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');

    try {
      const clientData = {
        name: formData.name,
        industry: formData.industry,
        description: formData.description,
        website: formData.website,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        logo: formData.logo,
        socialMedia: {},
        contacts: contacts,
        brand_guidelines: {
          voiceTone: formData.voiceTone,
          targetAudience: formData.targetAudience,
          keyMessages: keyMessages,
        },
        tenantId: 'tenant-1',
        isActive: true,
      };

      // Create client in Supabase
      const { data, error: supabaseError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      showNotification('Client created successfully!', 'success');
      router.push('/clients');
      
    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message || 'Failed to create client. Please try again.');
      showNotification('Failed to create client', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const steps = ['Basic Information', 'Brand & Design', 'Contacts', 'Brand Guidelines'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                error={!formData.name && activeStep > 0}
                helperText={!formData.name && activeStep > 0 ? 'Client name is required' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!formData.industry && activeStep > 0}>
                <InputLabel>Industry</InputLabel>
                <Select
                  name="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebsiteIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the client and their business"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon />
                Brand Colors
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <MuiColorInput
                format="hex"
                value={formData.primaryColor}
                onChange={(color) => setFormData(prev => ({ ...prev, primaryColor: color }))}
                label="Primary Color"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <MuiColorInput
                format="hex"
                value={formData.secondaryColor}
                onChange={(color) => setFormData(prev => ({ ...prev, secondaryColor: color }))}
                label="Secondary Color"
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <UploadIcon />
                Logo Upload
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ p: 3, border: '2px dashed', borderColor: 'grey.300' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  {logoPreview ? (
                    <Avatar
                      src={logoPreview}
                      sx={{ width: 120, height: 120, border: '2px solid', borderColor: 'grey.300' }}
                    />
                  ) : (
                    <Avatar sx={{ width: 120, height: 120, bgcolor: 'grey.100' }}>
                      <BusinessIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={uploadingLogo ? <CircularProgress size={20} /> : <UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Recommended: PNG or JPG, max 5MB
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Add Contacts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add key contacts for this client. You can add more contacts later.
              </Typography>
            </Grid>
            
            {/* Contact Form */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add New Contact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Role/Title"
                      name="contactRole"
                      value={formData.contactRole}
                      onChange={handleChange}
                      placeholder="e.g., Marketing Director"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddContact}
                      disabled={!formData.contactName || !formData.contactEmail}
                    >
                      Add Contact
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Contact List */}
            {contacts.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Added Contacts ({contacts.length})
                </Typography>
                <List>
                  {contacts.map((contact) => (
                    <ListItem
                      key={contact.id}
                      sx={{ 
                        border: 1, 
                        borderColor: 'grey.200', 
                        borderRadius: 1, 
                        mb: 1 
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveContact(contact.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={contact.name}
                        secondary={`${contact.role} • ${contact.email} ${contact.phone ? '• ' + contact.phone : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                Brand Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define the brand voice and messaging guidelines for this client.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Voice & Tone</InputLabel>
                <Select
                  name="voiceTone"
                  value={formData.voiceTone}
                  onChange={(e) => setFormData(prev => ({ ...prev, voiceTone: e.target.value }))}
                >
                  {voiceTones.map((tone) => (
                    <MenuItem key={tone} value={tone}>
                      {tone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Target Audience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="Describe the target audience demographics, interests, and characteristics"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Key Messages
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  label="Add key message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Enter a key brand message"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyMessage();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddKeyMessage}
                  disabled={!newMessage.trim()}
                >
                  Add
                </Button>
              </Box>
              
              {keyMessages.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap">
                  {keyMessages.map((message, index) => (
                    <Chip
                      key={index}
                      label={message}
                      onDelete={() => handleRemoveKeyMessage(message)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Create New Client">
      <Head>
        <title>Create Client | AIrWAVE</title>
      </Head>
      
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Create New Client
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set up a new client profile with brand information and contacts
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="h6">{label}</Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {renderStepContent(index)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                    >
                      Back
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                      disabled={loading || !validateStep(index)}
                      startIcon={index === steps.length - 1 ? <CheckIcon /> : undefined}
                    >
                      {loading ? (
                        <CircularProgress size={20} />
                      ) : index === steps.length - 1 ? (
                        'Create Client'
                      ) : (
                        'Next'
                      )}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/clients')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}