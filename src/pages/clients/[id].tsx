import { getErrorMessage } from '@/utils/errorUtils';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  Chip,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  ColorLens as ColorIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Client, Contact } from '@/types/models';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ClientDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Fetch client data
  const { data: client, isLoading, error, refetch } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (client) {
      setEditedClient(client);
    }
  }, [client]);

  const handleSave = async () => {
    if (!editedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update(editedClient)
        .eq('id', id);

      if (error) throw error;
      
      setIsEditing(false);
      refetch();
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Error saving client:', error);
    }
  };

  const handleCancel = () => {
    if (client) {
      setEditedClient(client);
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedClient(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setEditedClient(prev => prev ? {
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    } : null);
  };

  const handleAddContact = () => {
    setEditingContact({
      id: `temp-${Date.now()}`,
      name: '',
      role: '',
      email: '',
      phone: '',
      isActive: true,
    });
    setContactDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (!editingContact || !editedClient) return;

    const contacts = editedClient.contacts || [];
    const existingIndex = contacts.findIndex(c => c.id === editingContact.id);

    if (existingIndex >= 0) {
      contacts[existingIndex] = editingContact;
    } else {
      contacts.push(editingContact);
    }

    setEditedClient({ ...editedClient, contacts });
    setContactDialogOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    if (!editedClient) return;

    const contacts = editedClient.contacts.filter(c => c.id !== contactId);
    setEditedClient({ ...editedClient, contacts });
  };

  if (isLoading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorMessage error={error} onRetry={refetch} /></DashboardLayout>;
  if (!client || !editedClient) return <DashboardLayout><ErrorMessage message="Client not found" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Head>
        <title>{client.name} | AIrWAVE</title>
      </Head>

      <Container maxWidth="lg">
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <IconButton onClick={() => router.push('/clients')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {client.name}
            </Typography>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit Client
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Client Header Card */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ bgcolor: editedClient.primaryColor || 'primary.main', p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                {editedClient.logo ? (
                  <Avatar
                    src={editedClient.logo}
                    sx={{ width: 100, height: 100, bgcolor: 'white' }}
                  />
                ) : (
                  <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', color: editedClient.primaryColor }}>
                    <BusinessIcon sx={{ fontSize: 48 }} />
                  </Avatar>
                )}
              </Grid>
              <Grid item xs>
                <Typography variant="h5" color="white">
                  {editedClient.name}
                </Typography>
                <Typography variant="body1" color="rgba(255, 255, 255, 0.8)">
                  {editedClient.industry}
                </Typography>
                {editedClient.website && (
                  <Button
                    size="small"
                    startIcon={<WebIcon />}
                    sx={{ color: 'white', mt: 1 }}
                    onClick={() => window.open(editedClient.website, '_blank')}
                  >
                    Visit Website
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="General Info" />
            <Tab label="Brand Guidelines" />
            <Tab label="Contacts" />
            <Tab label="Social Media" />
          </Tabs>

          {/* General Info Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={editedClient.name}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  value={editedClient.industry}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('industry', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={editedClient.description}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('description', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={editedClient.website}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('website', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={editedClient.logo}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('logo', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={editedClient.primaryColor}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('primaryColor', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <ColorIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={editedClient.secondaryColor}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('secondaryColor', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <ColorIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Brand Guidelines Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Voice & Tone"
                  value={editedClient.brand_guidelines?.voiceTone || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('brand_guidelines', {
                    ...editedClient.brand_guidelines,
                    voiceTone: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Target Audience"
                  value={editedClient.brand_guidelines?.targetAudience || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleFieldChange('brand_guidelines', {
                    ...editedClient.brand_guidelines,
                    targetAudience: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Key Messages
                </Typography>
                {editedClient.brand_guidelines?.keyMessages?.map((message, index) => (
                  <Chip
                    key={index}
                    label={message}
                    sx={{ mr: 1, mb: 1 }}
                    {...(isEditing ? {
                      onDelete: () => {
                        const messages = [...(editedClient.brand_guidelines?.keyMessages || [])];
                        messages.splice(index, 1);
                        handleFieldChange('brand_guidelines', {
                          ...editedClient.brand_guidelines,
                          keyMessages: messages
                        });
                      }
                    } : {})}
                  />
                ))}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Contacts Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Contacts</Typography>
              {isEditing && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddContact}
                >
                  Add Contact
                </Button>
              )}
            </Box>
            <List>
              {editedClient.contacts?.map((contact) => (
                <ListItem key={contact.id} divider>
                  <ListItemText
                    primary={contact.name}
                    secondary={
                      <>
                        <Typography variant="body2">{contact.role}</Typography>
                        <Typography variant="body2">
                          <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {contact.email}
                          {contact.phone && (
                            <>
                              {' • '}
                              <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              {contact.phone}
                            </>
                          )}
                        </Typography>
                      </>
                    }
                  />
                  {isEditing && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleEditContact(contact)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteContact(contact.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Social Media Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={editedClient.socialMedia?.instagram || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleSocialMediaChange('instagram', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <InstagramIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  value={editedClient.socialMedia?.facebook || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleSocialMediaChange('facebook', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <FacebookIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  value={editedClient.socialMedia?.twitter || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleSocialMediaChange('twitter', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <TwitterIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  value={editedClient.socialMedia?.linkedin || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => handleSocialMediaChange('linkedin', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LinkedInIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Contact Dialog */}
        <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingContact?.id.startsWith('temp-') ? 'Add Contact' : 'Edit Contact'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editingContact?.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setEditingContact(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  value={editingContact?.role || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setEditingContact(prev => prev ? { ...prev, role: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editingContact?.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setEditingContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editingContact?.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setEditingContact(prev => prev ? { ...prev, phone: e.target.value } : null)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveContact} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default ClientDetailPage;
