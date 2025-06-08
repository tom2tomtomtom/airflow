import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Paper,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  AutoAwesome,
  ContentCopy,
  Refresh,
  CheckCircle,
  Edit,
  Delete,
  ArrowForward,
  ArrowBack,
  Save,
  Psychology,
  Campaign,
  ThumbUp,
  ThumbDown,
  Add,
  PlayArrow,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { BriefUploadModal } from '@/components/BriefUploadModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

// Interfaces
interface Motivation {
  id: string;
  title: string;
  description: string;
  category: string;
  relevance_score: number;
  target_emotions: string[];
  use_cases: string[];
  selected?: boolean;
}

interface CopyVariation {
  id: string;
  platform: string;
  headline: string;
  body_text: string;
  call_to_action: string;
  hashtags: string[];
  selected?: boolean;
}

interface BriefData {
  id?: string;
  title: string;
  content: string;
  target_audience?: string;
  campaign_objectives?: string;
}

const steps = [
  'Brief Analysis',
  'Strategic Motivations', 
  'Copy Generation',
  'Campaign Setup'
];

const StrategyPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [briefUploadOpen, setBriefUploadOpen] = useState(false);
  
  // Form states
  const [briefContent, setBriefContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignObjectives, setCampaignObjectives] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'Facebook']);
  const [copyTone, setCopyTone] = useState('professional');
  const [copyStyle, setCopyStyle] = useState('engaging');

  const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Twitter', 'Email', 'Website'];
  const tones = ['professional', 'casual', 'friendly', 'authoritative', 'playful', 'urgent'];
  const styles = ['engaging', 'informative', 'persuasive', 'storytelling', 'direct', 'emotional'];

  // Check if user has access to generate content
  const canGenerate = activeClient && user;

  // Handle brief upload
  const handleBriefUpload = (uploadedBrief: any) => {
    setBriefData({
      id: uploadedBrief.id,
      title: uploadedBrief.title,
      content: uploadedBrief.objective + ' ' + uploadedBrief.targetAudience,
      target_audience: uploadedBrief.targetAudience,
      campaign_objectives: uploadedBrief.objective,
    });
    setBriefContent(uploadedBrief.objective + ' ' + uploadedBrief.targetAudience);
    setTargetAudience(uploadedBrief.targetAudience);
    setCampaignObjectives(uploadedBrief.objective);
    setBriefUploadOpen(false);
    setActiveStep(1);
    showNotification('Brief uploaded successfully!', 'success');
  };

  // Handle manual brief creation
  const handleManualBrief = () => {
    if (!briefContent.trim()) {
      showNotification('Please enter brief content', 'error');
      return;
    }

    setBriefData({
      title: 'Manual Brief',
      content: briefContent,
      target_audience: targetAudience,
      campaign_objectives: campaignObjectives,
    });
    setActiveStep(1);
    showNotification('Brief created successfully!', 'success');
  };

  // Generate motivations
  const generateMotivations = async (regenerate = false) => {
    if (!canGenerate || !briefData) {
      showNotification('Please select a client and create a brief first', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/strategy-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brief_id: briefData.id,
          client_id: activeClient.id,
          brief_content: briefData.content,
          target_audience: briefData.target_audience,
          campaign_objectives: briefData.campaign_objectives,
          regenerate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMotivations(data.motivations.map((m: any) => ({ ...m, selected: false })));
        showNotification(`Generated ${data.count} strategic motivations!`, 'success');
        if (activeStep < 1) setActiveStep(1);
      } else {
        throw new Error(data.error || 'Failed to generate motivations');
      }
    } catch (error: any) {
      console.error('Error generating motivations:', error);
      showNotification('Failed to generate motivations: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate copy
  const generateCopy = async () => {
    const selectedMotivations = motivations.filter(m => m.selected);
    
    if (selectedMotivations.length === 0) {
      showNotification('Please select at least one motivation', 'error');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showNotification('Please select at least one platform', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/copy-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: activeClient.id,
          motivation_ids: selectedMotivations.map(m => m.id),
          platforms: selectedPlatforms,
          tone: copyTone,
          style: copyStyle,
          variations_per_platform: 3,
          target_audience: targetAudience,
          campaign_objectives: campaignObjectives,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCopyVariations(data.copy_assets.map((c: any) => ({ ...c, selected: false })));
        showNotification(`Generated ${data.count} copy variations!`, 'success');
        setActiveStep(2);
      } else {
        throw new Error(data.error || 'Failed to generate copy');
      }
    } catch (error: any) {
      console.error('Error generating copy:', error);
      showNotification('Failed to generate copy: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle motivation selection
  const toggleMotivation = (id: string) => {
    setMotivations(prev => prev.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  // Toggle copy selection
  const toggleCopy = (id: string) => {
    setCopyVariations(prev => prev.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  // Navigate to generate page with brief data
  const generateContent = () => {
    if (!briefData) {
      showNotification('Please create a brief first', 'error');
      return;
    }

    // Save brief data to localStorage for the generate page
    const briefContext = {
      briefData,
      targetAudience,
      campaignObjectives,
      selectedPlatforms,
      copyTone,
      copyStyle,
      motivations: motivations.filter(m => m.selected),
      timestamp: Date.now()
    };

    localStorage.setItem('airwave_brief_context', JSON.stringify(briefContext));
    showNotification('Brief data loaded for content generation', 'success');
    
    // Navigate to generate page
    router.push('/generate-enhanced');
  };

  // Create campaign with selected content
  const createCampaign = () => {
    const selectedCopy = copyVariations.filter(c => c.selected);
    const selectedMotivationsList = motivations.filter(m => m.selected);
    
    if (selectedCopy.length === 0) {
      showNotification('Please select at least one copy variation', 'error');
      return;
    }

    // Navigate to campaign creation with data
    router.push({
      pathname: '/campaigns/new',
      query: {
        fromStrategy: 'true',
        briefId: briefData?.id,
        motivations: JSON.stringify(selectedMotivationsList.map(m => m.id)),
        copyAssets: JSON.stringify(selectedCopy.map(c => c.id)),
      }
    });
  };

  if (!activeClient) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Alert severity="warning">
            Please select a client to start creating strategy content.
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Strategy & Content Generation | AIrFLOW</title>
      </Head>

      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Strategy & Content Generation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create strategic motivations and generate platform-specific copy for {activeClient.name}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Brief Analysis */}
          <Step>
            <StepLabel>Brief Analysis</StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Start with Your Campaign Brief
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CloudUpload />}
                        onClick={() => setBriefUploadOpen(true)}
                        sx={{ mb: 2, height: 120 }}
                      >
                        Upload Brief Document
                        <Typography variant="caption" display="block">
                          PDF, Word, or Text file
                        </Typography>
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Or create manually:
                      </Typography>
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Campaign Brief"
                        value={briefContent}
                        onChange={(e) => setBriefContent(e.target.value)}
                        placeholder="Describe your campaign objectives, target audience, and key messaging..."
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Target Audience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="Who is your target audience?"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Campaign Objectives"
                        value={campaignObjectives}
                        onChange={(e) => setCampaignObjectives(e.target.value)}
                        placeholder="What are your campaign goals?"
                        sx={{ mb: 2 }}
                      />
                      
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleManualBrief}
                        disabled={!briefContent.trim()}
                      >
                        Create Brief
                      </Button>
                    </Grid>
                  </Grid>

                  {briefData && (
                    <Box mt={3}>
                      <Alert severity="success" icon={<CheckCircle />}>
                        Brief created: {briefData.title}
                      </Alert>
                      <Button
                        onClick={() => setActiveStep(1)}
                        sx={{ mt: 2 }}
                        endIcon={<ArrowForward />}
                      >
                        Continue to Motivations
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 2: Strategic Motivations */}
          <Step>
            <StepLabel>
              Strategic Motivations
              {motivations.length > 0 && (
                <Chip 
                  label={`${motivations.filter(m => m.selected).length}/${motivations.length} selected`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                      AI-Generated Strategic Motivations
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => generateMotivations(true)}
                        disabled={loading || !briefData}
                      >
                        Regenerate
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AutoAwesome />}
                        onClick={() => generateMotivations(false)}
                        disabled={loading || !briefData}
                      >
                        Generate Motivations
                      </Button>
                    </Stack>
                  </Box>

                  {loading && <LinearProgress sx={{ mb: 2 }} />}

                  {motivations.length > 0 ? (
                    <>
                      <Grid container spacing={2}>
                        {motivations.map((motivation) => (
                          <Grid item xs={12} md={6} key={motivation.id}>
                            <Card 
                              variant="outlined"
                              sx={{ 
                                cursor: 'pointer',
                                border: motivation.selected ? 2 : 1,
                                borderColor: motivation.selected ? 'primary.main' : 'divider',
                                '&:hover': { borderColor: 'primary.main' }
                              }}
                              onClick={() => toggleMotivation(motivation.id)}
                            >
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                  <Typography variant="h6" component="h3">
                                    {motivation.title}
                                  </Typography>
                                  <Chip 
                                    label={`${motivation.relevance_score}%`} 
                                    size="small" 
                                    color={motivation.relevance_score > 80 ? 'success' : motivation.relevance_score > 60 ? 'warning' : 'default'}
                                  />
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {motivation.description}
                                </Typography>
                                
                                <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                                  <Chip label={motivation.category} size="small" />
                                  {motivation.target_emotions.slice(0, 2).map((emotion) => (
                                    <Chip key={emotion} label={emotion} size="small" variant="outlined" />
                                  ))}
                                </Box>
                                
                                {motivation.selected && (
                                  <Chip 
                                    icon={<CheckCircle />} 
                                    label="Selected" 
                                    color="primary" 
                                    size="small" 
                                    sx={{ mt: 1 }} 
                                  />
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      <Box mt={3} display="flex" justifyContent="space-between">
                        <Button onClick={() => setActiveStep(0)} startIcon={<ArrowBack />}>
                          Back to Brief
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(2)}
                          disabled={motivations.filter(m => m.selected).length === 0}
                          endIcon={<ArrowForward />}
                        >
                          Continue to Copy Generation
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Alert severity="info">
                      Generate strategic motivations based on your brief to continue.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 3: Copy Generation */}
          <Step>
            <StepLabel>
              Copy Generation
              {copyVariations.length > 0 && (
                <Chip 
                  label={`${copyVariations.filter(c => c.selected).length}/${copyVariations.length} selected`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Generate Platform-Specific Copy
                  </Typography>

                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Platforms</InputLabel>
                        <Select
                          multiple
                          value={selectedPlatforms}
                          onChange={(e) => setSelectedPlatforms(e.target.value as string[])}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {platforms.map((platform) => (
                            <MenuItem key={platform} value={platform}>
                              <Checkbox checked={selectedPlatforms.indexOf(platform) > -1} />
                              {platform}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Tone</InputLabel>
                        <Select value={copyTone} onChange={(e) => setCopyTone(e.target.value)}>
                          {tones.map((tone) => (
                            <MenuItem key={tone} value={tone}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Style</InputLabel>
                        <Select value={copyStyle} onChange={(e) => setCopyStyle(e.target.value)}>
                          {styles.map((style) => (
                            <MenuItem key={style} value={style}>
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    startIcon={<ContentCopy />}
                    onClick={generateCopy}
                    disabled={loading || motivations.filter(m => m.selected).length === 0}
                    fullWidth
                    size="large"
                  >
                    Generate Copy Variations
                  </Button>

                  {loading && <LinearProgress sx={{ mt: 2 }} />}

                  {copyVariations.length > 0 && (
                    <Box mt={4}>
                      <Typography variant="h6" gutterBottom>
                        Generated Copy Variations
                      </Typography>
                      
                      {platforms.map((platform) => {
                        const platformCopy = copyVariations.filter(c => c.platform === platform);
                        if (platformCopy.length === 0) return null;
                        
                        return (
                          <Box key={platform} mb={3}>
                            <Typography variant="subtitle1" gutterBottom>
                              {platform}
                            </Typography>
                            <Grid container spacing={2}>
                              {platformCopy.map((copy) => (
                                <Grid item xs={12} md={4} key={copy.id}>
                                  <Card 
                                    variant="outlined"
                                    sx={{ 
                                      cursor: 'pointer',
                                      border: copy.selected ? 2 : 1,
                                      borderColor: copy.selected ? 'primary.main' : 'divider',
                                      '&:hover': { borderColor: 'primary.main' }
                                    }}
                                    onClick={() => toggleCopy(copy.id)}
                                  >
                                    <CardContent>
                                      <Typography variant="subtitle2" gutterBottom>
                                        {copy.headline}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" paragraph>
                                        {copy.body_text}
                                      </Typography>
                                      <Typography variant="body2" color="primary" gutterBottom>
                                        {copy.call_to_action}
                                      </Typography>
                                      {copy.hashtags && copy.hashtags.length > 0 && (
                                        <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                                          {copy.hashtags.slice(0, 3).map((tag) => (
                                            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                                          ))}
                                        </Box>
                                      )}
                                      {copy.selected && (
                                        <Chip 
                                          icon={<CheckCircle />} 
                                          label="Selected" 
                                          color="primary" 
                                          size="small" 
                                          sx={{ mt: 1 }} 
                                        />
                                      )}
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        );
                      })}

                      <Box mt={3} display="flex" justifyContent="space-between">
                        <Button onClick={() => setActiveStep(1)} startIcon={<ArrowBack />}>
                          Back to Motivations
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(3)}
                          disabled={copyVariations.filter(c => c.selected).length === 0}
                          endIcon={<ArrowForward />}
                        >
                          Continue to Campaign
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 4: Campaign Setup */}
          <Step>
            <StepLabel>Campaign Setup</StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ready to Create Campaign
                  </Typography>
                  
                  <Alert severity="success" sx={{ mb: 3 }}>
                    You have selected {motivations.filter(m => m.selected).length} motivations 
                    and {copyVariations.filter(c => c.selected).length} copy variations.
                  </Alert>

                  <Typography variant="body1" paragraph>
                    Your strategic content is ready! Create a campaign to organize your content 
                    into a matrix for video generation.
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button onClick={() => setActiveStep(2)} startIcon={<ArrowBack />}>
                      Back to Copy
                    </Button>
                    
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<AutoAwesome />}
                        onClick={generateContent}
                        disabled={!briefData}
                      >
                        Generate Content
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Campaign />}
                        onClick={createCampaign}
                        disabled={copyVariations.filter(c => c.selected).length === 0}
                      >
                        Create Campaign
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>
        </Stepper>
      </Container>

      {/* Brief Upload Modal */}
      <BriefUploadModal
        open={briefUploadOpen}
        onClose={() => setBriefUploadOpen(false)}
        onUploadComplete={handleBriefUpload}
      />
    </DashboardLayout>
  );
};

export default StrategyPage;