import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  ColorLens as ColorIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useNotification } from '@/contexts/NotificationContext';
import { isDemoMode } from '@/lib/demo-data';
import { supabase } from '@/lib/supabase';

export default function CreateClient() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    website: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logo: '',
    // Contact
    contactName: '',
    contactEmail: '',
    contactRole: '',
    contactPhone: '',
    // Brand Guidelines
    voiceTone: '',
    targetAudience: '',
    keyMessages: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        contacts: formData.contactName ? [{
          id: `contact-${Date.now()}`,
          name: formData.contactName,
          email: formData.contactEmail,
          role: formData.contactRole,
          phone: formData.contactPhone,
          isActive: true,
        }] : [],
        brandGuidelines: {
          voiceTone: formData.voiceTone,
          targetAudience: formData.targetAudience,
          keyMessages: formData.keyMessages.split(',').map(m => m.trim()).filter(Boolean),
        },
        tenantId: 'tenant-1',
        isActive: true,
      };

      if (isDemoMode()) {
        // In demo mode, just show success and redirect
        showNotification('Client created successfully! (Demo Mode)', 'success');
        setTimeout(() => {
          router.push('/clients');
        }, 1000);
        return;
      }

      // Create client in Supabase
      const { data, error: supabaseError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      showNotification('Client created successfully!', 'success');
      router.push(`/clients/${data.id}`);
      
    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message || 'Failed to create client. Please try again.');
      showNotification('Failed to create client', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DashboardLayout title="Create New Client">
      <Head>
        <title>Create Client | AIrWAVE</title>
      </Head>
      
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Create New Client
          </Typography>
          
          {isDemoMode() && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You're in demo mode. Client data won't be permanently saved.
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Technology, Healthcare, Retail"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the client and their business"
                />
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
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </Grid>

              {/* Brand Colors */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Brand Colors
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  name="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ColorIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  name="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ColorIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Primary Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Primary Contact (Optional)
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
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
                  label="Contact Role"
                  name="contactRole"
                  value={formData.contactRole}
                  onChange={handleChange}
                  placeholder="e.g., Marketing Director"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
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
                  label="Contact Phone"
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

              {/* Brand Guidelines */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Brand Guidelines
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Voice & Tone"
                  name="voiceTone"
                  value={formData.voiceTone}
                  onChange={handleChange}
                  placeholder="e.g., Professional, friendly, innovative"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Target Audience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  placeholder="Describe your target audience demographics and characteristics"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Key Messages"
                  name="keyMessages"
                  value={formData.keyMessages}
                  onChange={handleChange}
                  placeholder="Enter key messages separated by commas"
                  helperText="Separate multiple messages with commas"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/clients')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.name || !formData.industry}
                  >
                    {loading ? 'Creating...' : 'Create Client'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
