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
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCampaigns } from '@/hooks/useData';

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
  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
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

  const handleGenerateFromBrief = async (brief: Brief) => {
    setGenerating(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const timestamp = Date.now();
      const newContent: StrategicContentItem = {
        id: `sc${timestamp}`,
        title: `Strategy for: ${brief.title}`,
        type: 'framework',
        description: `AI-generated strategic content based on brief: ${brief.objective}`,
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        briefId: brief.id,
        content: [
          {
            id: `idea${timestamp}-1`,
            title: 'Content Pillars',
            description: 'Key content themes aligned with your objectives',
            details: `Based on your target audience (${brief.targetAudience}) and objectives, focus on: Educational content about product benefits, Behind-the-scenes stories, User testimonials and case studies, Industry insights and trends.`
          },
          {
            id: `idea${timestamp}-2`,
            title: 'Channel Strategy',
            description: 'Optimized platform approach for maximum reach',
            details: 'Instagram: Visual storytelling with carousel posts and Reels. LinkedIn: Thought leadership articles and company updates. Email: Nurture sequences with valuable content. Blog: SEO-optimized long-form content.'
          },
          {
            id: `idea${timestamp}-3`,
            title: 'Content Calendar',
            description: 'Strategic posting schedule for consistent engagement',
            details: `Week 1-2: Launch phase with teaser content. Week 3-4: Educational series highlighting key messages. Week 5-6: User-generated content campaign. Week 7-8: Results and testimonials showcase.`
          },
          {
            id: `idea${timestamp}-4`,
            title: 'Key Messaging Framework',
            description: 'Core messages tailored to your audience',
            details: brief.keyMessages.join(' • ') + ` Tone: ${brief.tone}. Focus on emotional connection while maintaining credibility.`
          }
        ]
      };
      
      setStrategicContent([newContent, ...strategicContent]);
      setGenerating(false);
      showNotification('Strategic content generated successfully!', 'success');
    }, 3000);
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

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                    onChange={(e) => setTypeFilter(e.target.value)}
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
                          onChange={(e) => setBriefForm({ ...briefForm, title: e.target.value })}
                          required
                        />
                        <FormControl fullWidth>
                          <InputLabel>Brief Type</InputLabel>
                          <Select
                            value={briefForm.type}
                            label="Brief Type"
                            onChange={(e) => setBriefForm({ ...briefForm, type: e.target.value as Brief['type'] })}
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
                              onChange={(e) => setBriefForm({ ...briefForm, campaignId: e.target.value })}
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
                          onChange={(e) => setBriefForm({ ...briefForm, objective: e.target.value })}
                          required
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Target Audience"
                          value={briefForm.targetAudience}
                          onChange={(e) => setBriefForm({ ...briefForm, targetAudience: e.target.value })}
                          required
                        />
                        <FormControl fullWidth>
                          <InputLabel>Tone of Voice</InputLabel>
                          <Select
                            value={briefForm.tone}
                            label="Tone of Voice"
                            onChange={(e) => setBriefForm({ ...briefForm, tone: e.target.value })}
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
                                onChange={(e) => {
                                  const newMessages = [...briefForm.keyMessages];
                                  newMessages[index] = e.target.value;
                                  setBriefForm({ ...briefForm, keyMessages: newMessages });
                                }}
                                placeholder="Enter key message"
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveKeyMessage(index)}
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
                                onChange={(e) => {
                                  const newDeliverables = [...briefForm.deliverables];
                                  newDeliverables[index] = e.target.value;
                                  setBriefForm({ ...briefForm, deliverables: newDeliverables });
                                }}
                                placeholder="Enter deliverable"
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveDeliverable(index)}
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
                          onChange={(e) => setBriefForm({ ...briefForm, timeline: e.target.value })}
                          placeholder="e.g., 2 weeks, Q1 2024"
                        />
                        <TextField
                          fullWidth
                          label="Budget (Optional)"
                          value={briefForm.budget}
                          onChange={(e) => setBriefForm({ ...briefForm, budget: e.target.value })}
                          placeholder="e.g., $5,000"
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Additional Notes"
                          value={briefForm.additionalNotes}
                          onChange={(e) => setBriefForm({ ...briefForm, additionalNotes: e.target.value })}
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
      </DashboardLayout>
    </>
  );
};

export default StrategicContent;
