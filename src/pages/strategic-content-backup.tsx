import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  Lightbulb as IdeaIcon,
  Campaign as CampaignIcon,
  Insights as InsightsIcon,
  Description as DocumentIcon,
  SmartToy as BotIcon,
  AutoAwesome as MagicIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Article as BriefIcon,
  CloudUpload as CloudUploadIcon,
  Upload as UploadIcon,
  Palette as PaletteIcon,
  TextFormat as TextFormatIcon,
  VoiceOverOff as VoiceOverOffIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { UnifiedBriefWorkflow } from '@/components/UnifiedBriefWorkflow';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCampaigns } from '@/hooks/useData';
import { useRouter } from 'next/router';

// Content type icons mapping
const contentTypeIcons: Record<string, React.ReactNode> = {
  campaign: <CampaignIcon sx={{ color: '#3a86ff' }} />,
  analysis: <InsightsIcon sx={{ color: '#8338ec' }} />,
  framework: <DocumentIcon sx={{ color: '#06d6a0' }} />,
  ideas: <IdeaIcon sx={{ color: '#ffbe0b' }} />,
  brief: <BriefIcon sx={{ color: '#ff006e' }} />,
};

// Interface for brief data
interface Brief {
  id: string;
  title: string;
  type: 'campaign' | 'content' | 'product' | 'general';
  campaignId?: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  tone: string;
  deliverables: string[];
  timeline: string;
  budget?: string;
  additionalNotes?: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'completed';
  dateCreated: string;
  lastModified: string;
  generatedContent?: {
    id: string;
    type: string;
    content: string;
    timestamp: string;
  }[];
}

// Interface for strategic content data
interface ContentItem {
  id: string;
  title: string;
  description: string;
  details: string;
}

interface StrategicContentItem {
  id: string;
  title: string;
  type: string;
  description: string;
  dateCreated: string;
  lastModified: string;
  content: ContentItem[];
  briefId?: string;
}

const StrategicContent: React.FC = () => {
  const router = useRouter();
  const { activeClient } = useClient();
  const { showNotification } = useNotification();
  const { data: campaigns } = useCampaigns(activeClient?.id);
  
  const [strategicContent, setStrategicContent] = useState<StrategicContentItem[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [openBriefDialog, setOpenBriefDialog] = useState(false);
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [brandGuidelinesUploading, setBrandGuidelinesUploading] = useState(false);
  const [brandGuidelines, setBrandGuidelines] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load existing brand guidelines when client changes
  React.useEffect(() => {
    const loadBrandGuidelines = async () => {
      if (!activeClient?.id) {
        setBrandGuidelines(null);
        return;
      }

      try {
        // Check if brand guidelines exist for this client
        if (activeClient.brand_guidelines) {
          setBrandGuidelines(activeClient.brand_guidelines);
        } else {
          setBrandGuidelines(null);
        }
      } catch (error) {
        console.error('Error loading brand guidelines:', error);
      }
    };

    loadBrandGuidelines();
  }, [activeClient?.id]);
  
  // Brief form state
  const [briefForm, setBriefForm] = useState({
    title: '',
    type: 'campaign' as Brief['type'],
    campaignId: '',
    objective: '',
    targetAudience: '',
    keyMessages: [''],
    tone: '',
    deliverables: [''],
    timeline: '',
    budget: '',
    additionalNotes: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateBrief = () => {
    setCurrentBrief(null);
    setBriefForm({
      title: '',
      type: 'campaign',
      campaignId: '',
      objective: '',
      targetAudience: '',
      keyMessages: [''],
      tone: '',
      deliverables: [''],
      timeline: '',
      budget: '',
      additionalNotes: '',
    });
    setActiveStep(0);
    setOpenBriefDialog(true);
  };

  const handleSubmitBrief = () => {
    if (!briefForm.title || !briefForm.objective) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const newBrief: Brief = {
      id: `brief-${Date.now()}`,
      ...briefForm,
      keyMessages: briefForm.keyMessages.filter(m => m.trim()),
      deliverables: briefForm.deliverables.filter(d => d.trim()),
      status: 'submitted',
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    setBriefs([...briefs, newBrief]);
    showNotification('Brief submitted successfully!', 'success');
    setOpenBriefDialog(false);
    
    // Trigger AI generation
    handleGenerateFromBrief(newBrief);
  };

  const handleWorkflowComplete = (workflowData: any) => {
    // Create brief from workflow data
    const newBrief: Brief = {
      id: `brief-${Date.now()}`,
      title: workflowData.brief.title,
      type: 'campaign',
      campaignId: '',
      objective: workflowData.brief.objective,
      targetAudience: workflowData.brief.targetAudience,
      keyMessages: workflowData.brief.keyMessages || [],
      tone: 'professional',
      deliverables: ['Video content', 'Social media posts'],
      timeline: workflowData.brief.timeline,
      budget: workflowData.brief.budget,
      status: 'completed',
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    setBriefs([...briefs, newBrief]);
    
    // Create strategic content from workflow
    const timestamp = Date.now();
    const newContent: StrategicContentItem = {
      id: `wf-${timestamp}`,
      title: `Workflow: ${workflowData.brief.title}`,
      type: 'framework',
      description: 'Generated from unified brief workflow',
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      briefId: newBrief.id,
      content: [
        {
          id: `wf-motivations-${timestamp}`,
          title: 'Selected Motivations',
          description: 'Strategic motivations chosen from AI generation',
          details: workflowData.motivations.map((m: any) => `${m.title}: ${m.description}`).join(' • ')
        },
        {
          id: `wf-copy-${timestamp}`,
          title: 'Copy Variations',
          description: 'Platform-specific copy variations',
          details: workflowData.copy.map((c: any) => `${c.platform}: ${c.text}`).join(' • ')
        },
        {
          id: `wf-template-${timestamp}`,
          title: 'Selected Template',
          description: 'Chosen video template for rendering',
          details: `Template: ${workflowData.template} - Ready for Creatomate rendering`
        }
      ]
    };
    
    setStrategicContent([newContent, ...strategicContent]);
    setOpenWorkflow(false);
    showNotification('Workflow completed! Content and brief created.', 'success');
  };

  const handleGenerateFromBrief = async (brief: Brief) => {
    if (!activeClient?.id) {
      showNotification('Please select a client first', 'error');
      return;
    }

    setGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: `Generate strategic content framework for campaign: ${brief.title}. Objective: ${brief.objective}. Target Audience: ${brief.targetAudience}. Key Messages: ${brief.keyMessages.join(', ')}. Tone: ${brief.tone}.`,
          type: 'text',
          parameters: {
            tone: brief.tone,
            style: 'strategic',
            purpose: 'campaign framework'
          },
          clientId: activeClient.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate strategic content');
      }

      const result = await response.json();
      
      if (result.success && result.result) {
        const timestamp = Date.now();
        const generatedText = Array.isArray(result.result.content) 
          ? result.result.content.join('\n\n') 
          : result.result.content;

        const newContent: StrategicContentItem = {
          id: `sc${timestamp}`,
          title: `AI Strategy: ${brief.title}`,
          type: 'framework',
          description: `AI-generated strategic content based on brief: ${brief.objective}`,
          dateCreated: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          briefId: brief.id,
          content: [
            {
              id: `idea${timestamp}-1`,
              title: 'AI-Generated Strategic Framework',
              description: 'AI-powered content strategy based on your brief',
              details: generatedText
            }
          ]
        };
        
        setStrategicContent([newContent, ...strategicContent]);
        showNotification('Strategic content generated successfully!', 'success');
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error generating strategic content:', error);
      showNotification('Failed to generate strategic content. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddKeyMessage = () => {
    setBriefForm({
      ...briefForm,
      keyMessages: [...briefForm.keyMessages, '']
    });
  };

  const handleRemoveKeyMessage = (index: number) => {
    setBriefForm({
      ...briefForm,
      keyMessages: briefForm.keyMessages.filter((_, i) => i !== index)
    });
  };

  const handleAddDeliverable = () => {
    setBriefForm({
      ...briefForm,
      deliverables: [...briefForm.deliverables, '']
    });
  };

  const handleRemoveDeliverable = (index: number) => {
    setBriefForm({
      ...briefForm,
      deliverables: briefForm.deliverables.filter((_, i) => i !== index)
    });
  };

  // Brand Guidelines Upload Handlers
  const handleBrandGuidelinesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await uploadBrandGuidelines(file);
  };

  const handleBrandGuidelinesDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    await uploadBrandGuidelines(file);
  };

  const uploadBrandGuidelines = async (file: File) => {
    if (!activeClient?.id) {
      showNotification('Please select a client first', 'error');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please upload a PDF, DOCX, or TXT file', 'error');
      return;
    }

    setBrandGuidelinesUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/brand-guidelines/analyze', {
        method: 'POST',
        headers: {
          'X-Client-Id': activeClient.id,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze brand guidelines');
      }

      const result = await response.json();
      
      if (result.success) {
        setBrandGuidelines(result.guidelines);
        showNotification('Brand guidelines analyzed and saved successfully!', 'success');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error uploading brand guidelines:', error);
      showNotification('Failed to analyze brand guidelines. Please try again.', 'error');
    } finally {
      setBrandGuidelinesUploading(false);
    }
  };

  const filteredContent = strategicContent.filter(item => {
    if (tabValue === 1) return item.briefId; // AI Generated
    if (tabValue === 2) return !item.briefId; // Manual
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (typeFilter !== 'All' && item.type !== typeFilter.toLowerCase()) return false;
    return true;
  });

  const filteredBriefs = briefs.filter(brief => {
    if (searchQuery && !brief.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!activeClient) {
    return (
      <DashboardLayout title="Strategic Content">
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to manage strategic content
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Strategic Content | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Strategic Content">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Strategic Content
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered strategic content planning and brief management
          </Typography>
        </Box>

        {/* Brand Guidelines Upload Section */}
        <Paper sx={{ p: 3, mb: 4, border: '2px dashed', borderColor: dragActive ? 'primary.main' : 'grey.300', bgcolor: dragActive ? 'primary.50' : 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Brand Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload your brand guidelines document to automatically extract colors, tone of voice, fonts, and other brand elements for use across all content generation.
          </Typography>
          
          {!brandGuidelines ? (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleBrandGuidelinesDrop}
              onClick={() => document.getElementById('brand-guidelines-input')?.click()}
            >
              <input
                id="brand-guidelines-input"
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
                onChange={handleBrandGuidelinesUpload}
              />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {brandGuidelinesUploading ? 'Analyzing brand guidelines...' : 'Upload Brand Guidelines'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag and drop or click to select a PDF, DOCX, or TXT file
              </Typography>
              {brandGuidelinesUploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon />
                  <Typography variant="body2">
                    Brand guidelines analyzed and saved for client: {activeClient?.name}
                  </Typography>
                </Box>
              </Alert>
              
              <Grid container spacing={3}>
                {/* Colors */}
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Colors</Typography>
                      </Box>
                      {brandGuidelines.colors && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Primary
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            {brandGuidelines.colors.primary?.map((color: string, index: number) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: color,
                                  borderRadius: 1,
                                  border: '1px solid #ccc',
                                }}
                                title={color}
                              />
                            ))}
                          </Stack>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Secondary
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {brandGuidelines.colors.secondary?.map((color: string, index: number) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: color,
                                  borderRadius: 1,
                                  border: '1px solid #ccc',
                                }}
                                title={color}
                              />
                            ))}
                          </Stack>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Tone of Voice */}
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <VoiceOverOffIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Tone</Typography>
                      </Box>
                      {brandGuidelines.toneOfVoice && (
                        <>
                          <Typography variant="body2" paragraph>
                            {brandGuidelines.toneOfVoice.communication_style}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {brandGuidelines.toneOfVoice.personality?.map((trait: string, index: number) => (
                              <Chip key={index} label={trait} size="small" />
                            ))}
                          </Stack>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Typography */}
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TextFormatIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Typography</Typography>
                      </Box>
                      {brandGuidelines.typography && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary">
                            Primary Font
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {brandGuidelines.typography.primary_font}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Secondary Font
                          </Typography>
                          <Typography variant="body2">
                            {brandGuidelines.typography.secondary_font}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Actions */}
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => setBrandGuidelines(null)}
                        >
                          Upload New Guidelines
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => router.push('/generate-enhanced')}
                        >
                          Use in Generation
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <CloudUploadIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="inherit">Brief to Execution</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Complete workflow from brief upload to video rendering
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                  startIcon={<MagicIcon />}
                  onClick={() => setOpenWorkflow(true)}
                >
                  Start Workflow
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <BriefIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Create Brief</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submit a detailed brief for AI content generation
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={handleCreateBrief}
                >
                  Create New Brief
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <BotIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Quick Generate</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate strategic content using AI instantly
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  color="secondary"
                  startIcon={generating ? <RefreshIcon /> : <MagicIcon />}
                  onClick={() => {
                    setGenerating(true);
                    setTimeout(() => {
                      setGenerating(false);
                      showNotification('Quick content generated!', 'success');
                    }, 2000);
                  }}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Quick Generate'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Content" />
            <Tab label="AI Generated" />
            <Tab label="Manual Content" />
            <Tab label="Briefs" />
          </Tabs>
        </Box>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search content and briefs..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setSearchQuery(e.target.value)}
                size="small"
              />
            </Grid>
            {tabValue !== 3 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Content Type"
                    onChange={(e: React.ChangeEvent<HTMLElement>) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="All">All Types</MenuItem>
                    <MenuItem value="Campaign">Campaign</MenuItem>
                    <MenuItem value="Analysis">Analysis</MenuItem>
                    <MenuItem value="Framework">Framework</MenuItem>
                    <MenuItem value="Ideas">Ideas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Content Display */}
        {tabValue === 3 ? (
          // Briefs Tab
          <Grid container spacing={3}>
            {filteredBriefs.length > 0 ? (
              filteredBriefs.map((brief) => (
                <Grid item xs={12} md={6} lg={4} key={brief.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{brief.title}</Typography>
                        <Chip 
                          label={brief.status} 
                          size="small"
                          color={brief.status === 'completed' ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {brief.objective}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip label={brief.type} size="small" />
                        <Chip label={brief.timeline} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(brief.dateCreated).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => {
                        setCurrentBrief(brief);
                        setOpenBriefDialog(true);
                      }}>
                        View Details
                      </Button>
                      {brief.status === 'submitted' && (
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handleGenerateFromBrief(brief)}
                        >
                          Generate Content
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">
                  No briefs created yet. Create your first brief to get started!
                </Alert>
              </Grid>
            )}
          </Grid>
        ) : (
          // Content Tabs
          <Grid container spacing={3}>
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                          {contentTypeIcons[item.type] || <AIIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                        {item.briefId && (
                          <Chip label="AI Generated" size="small" color="secondary" />
                        )}
                      </Box>
                      
                      {item.content.map((contentItem, index) => (
                        <Accordion key={contentItem.id} defaultExpanded={index === 0}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">{contentItem.title}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              {contentItem.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {contentItem.details}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">
                  {generating ? (
                    <Box>
                      <Typography>Generating strategic content...</Typography>
                      <LinearProgress sx={{ mt: 2 }} />
                    </Box>
                  ) : (
                    'No content found. Create a brief or use quick generate to get started!'
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        {/* Brief Creation Dialog */}
        <Dialog open={openBriefDialog} onClose={() => setOpenBriefDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentBrief ? 'View Brief' : 'Create Strategic Brief'}
          </DialogTitle>
          <DialogContent>
            {currentBrief ? (
              // View mode
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Objective</Typography>
                <Typography variant="body2" paragraph>{currentBrief.objective}</Typography>
                
                <Typography variant="subtitle1" gutterBottom>Target Audience</Typography>
                <Typography variant="body2" paragraph>{currentBrief.targetAudience}</Typography>
                
                <Typography variant="subtitle1" gutterBottom>Key Messages</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {currentBrief.keyMessages.map((msg, i) => (
                    <Chip key={i} label={msg} />
                  ))}
                </Stack>
                
                <Typography variant="subtitle1" gutterBottom>Deliverables</Typography>
                {currentBrief.deliverables.map((del, i) => (
                  <Typography key={i} variant="body2">• {del}</Typography>
                ))}
              </Box>
            ) : (
              // Create mode
              <Box sx={{ pt: 2 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                  <Step>
                    <StepLabel>Basic Information</StepLabel>
                    <StepContent>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Brief Title"
                          value={briefForm.title}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, title: e.target.value })}
                          required
                        />
                        <FormControl fullWidth>
                          <InputLabel>Brief Type</InputLabel>
                          <Select
                            value={briefForm.type}
                            label="Brief Type"
                            onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, type: e.target.value as Brief['type'] })}
                          >
                            <MenuItem value="campaign">Campaign Brief</MenuItem>
                            <MenuItem value="content">Content Brief</MenuItem>
                            <MenuItem value="product">Product Brief</MenuItem>
                            <MenuItem value="general">General Brief</MenuItem>
                          </Select>
                        </FormControl>
                        {briefForm.type === 'campaign' && campaigns && campaigns.length > 0 && (
                          <FormControl fullWidth>
                            <InputLabel>Link to Campaign</InputLabel>
                            <Select
                              value={briefForm.campaignId}
                              label="Link to Campaign"
                              onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, campaignId: e.target.value })}
                            >
                              <MenuItem value="">None</MenuItem>
                              {campaigns.map((campaign: any) => (
                                <MenuItem key={campaign.id} value={campaign.id}>
                                  {campaign.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <Button onClick={() => setActiveStep(1)} variant="contained">
                          Next
                        </Button>
                      </Stack>
                    </StepContent>
                  </Step>
                  
                  <Step>
                    <StepLabel>Objectives & Audience</StepLabel>
                    <StepContent>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Objective"
                          value={briefForm.objective}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, objective: e.target.value })}
                          required
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Target Audience"
                          value={briefForm.targetAudience}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, targetAudience: e.target.value })}
                          required
                        />
                        <FormControl fullWidth>
                          <InputLabel>Tone of Voice</InputLabel>
                          <Select
                            value={briefForm.tone}
                            label="Tone of Voice"
                            onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, tone: e.target.value })}
                          >
                            <MenuItem value="professional">Professional</MenuItem>
                            <MenuItem value="casual">Casual</MenuItem>
                            <MenuItem value="friendly">Friendly</MenuItem>
                            <MenuItem value="authoritative">Authoritative</MenuItem>
                            <MenuItem value="playful">Playful</MenuItem>
                          </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button onClick={() => setActiveStep(0)}>Back</Button>
                          <Button onClick={() => setActiveStep(2)} variant="contained">
                            Next
                          </Button>
                        </Box>
                      </Stack>
                    </StepContent>
                  </Step>
                  
                  <Step>
                    <StepLabel>Messages & Deliverables</StepLabel>
                    <StepContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Key Messages
                          </Typography>
                          {briefForm.keyMessages.map((msg, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                value={msg}
                                onChange={(e: React.ChangeEvent<HTMLElement>) => {
                                  const newMessages = [...briefForm.keyMessages];
                                  newMessages[index] = e.target.value;
                                  setBriefForm({ ...briefForm, keyMessages: newMessages });
                                }}
                                placeholder="Enter key message"
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveKeyMessage(index)} aria-label="Icon button"
                                disabled={briefForm.keyMessages.length === 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          <Button size="small" startIcon={<AddIcon />} onClick={handleAddKeyMessage}>
                            Add Message
                          </Button>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Deliverables
                          </Typography>
                          {briefForm.deliverables.map((del, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                value={del}
                                onChange={(e: React.ChangeEvent<HTMLElement>) => {
                                  const newDeliverables = [...briefForm.deliverables];
                                  newDeliverables[index] = e.target.value;
                                  setBriefForm({ ...briefForm, deliverables: newDeliverables });
                                }}
                                placeholder="Enter deliverable"
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveDeliverable(index)} aria-label="Icon button"
                                disabled={briefForm.deliverables.length === 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          <Button size="small" startIcon={<AddIcon />} onClick={handleAddDeliverable}>
                            Add Deliverable
                          </Button>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button onClick={() => setActiveStep(1)}>Back</Button>
                          <Button onClick={() => setActiveStep(3)} variant="contained">
                            Next
                          </Button>
                        </Box>
                      </Stack>
                    </StepContent>
                  </Step>
                  
                  <Step>
                    <StepLabel>Timeline & Budget</StepLabel>
                    <StepContent>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Timeline"
                          value={briefForm.timeline}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, timeline: e.target.value })}
                          placeholder="e.g., 2 weeks, Q1 2024"
                        />
                        <TextField
                          fullWidth
                          label="Budget (Optional)"
                          value={briefForm.budget}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, budget: e.target.value })}
                          placeholder="e.g., $5,000"
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Additional Notes"
                          value={briefForm.additionalNotes}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setBriefForm({ ...briefForm, additionalNotes: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button onClick={() => setActiveStep(2)}>Back</Button>
                          <Button onClick={handleSubmitBrief} variant="contained" startIcon={<SendIcon />}>
                            Submit Brief
                          </Button>
                        </Box>
                      </Stack>
                    </StepContent>
                  </Step>
                </Stepper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBriefDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Unified Brief Workflow */}
        <UnifiedBriefWorkflow
          open={openWorkflow}
          onClose={() => setOpenWorkflow(false)}
          onComplete={handleWorkflowComplete}
        />
      </DashboardLayout>
    </>
  );
};

export default StrategicContent;
