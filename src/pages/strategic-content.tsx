import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Psychology as AIIcon,
  Article as BriefIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCampaigns } from '@/hooks/useData';
import { useRouter } from 'next/router';

// Lazy load heavy components for better performance
const BrandGuidelinesSection = dynamic(
  () => import('@/components/strategic/BrandGuidelinesSection'),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
);

const BriefDialog = dynamic(
  () => import('@/components/strategic/BriefDialog'),
  {
    loading: () => <CircularProgress />,
    ssr: false,
  }
);

const UnifiedBriefWorkflow = dynamic(
  () => import('@/components/UnifiedBriefWorkflow').then(mod => ({ default: mod.UnifiedBriefWorkflow })),
  {
    loading: () => <CircularProgress />,
    ssr: false,
  }
);

// Content type icons mapping
const contentTypeIcons: Record<string, React.ReactNode> = {
  campaign: <BriefIcon sx={{ color: '#3a86ff' }} />,
  analysis: <AIIcon sx={{ color: '#8338ec' }} />,
  framework: <BriefIcon sx={{ color: '#06d6a0' }} />,
  ideas: <MagicIcon sx={{ color: '#ffbe0b' }} />,
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
    const newBrief: Brief = {
      id: `brief-${Date.now()}`,
      ...briefForm,
      status: 'draft',
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    setBriefs([...briefs, newBrief]);
    setOpenBriefDialog(false);
    showNotification('Brief created successfully', 'success');
  };

  const handleBrandGuidelinesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeClient?.id) return;

    setBrandGuidelinesUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', activeClient.id);

      const response = await fetch('/api/brand-guidelines/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload');

      const result = await response.json();
      setBrandGuidelines(result.guidelines);
      showNotification('Brand guidelines analyzed successfully', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Failed to analyze brand guidelines', 'error');
    } finally {
      setBrandGuidelinesUploading(false);
    }
  };

  const handleBrandGuidelinesDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files?.[0];
    if (!file || !activeClient?.id) return;

    setBrandGuidelinesUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', activeClient.id);

      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, DOCX, or TXT file');
      }

      const response = await fetch('/api/brand-guidelines/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload');

      const result = await response.json();
      setBrandGuidelines(result.guidelines);
      showNotification('Brand guidelines analyzed successfully', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to analyze brand guidelines', 'error');
    } finally {
      setBrandGuidelinesUploading(false);
    }
  };

  const handleWorkflowComplete = (data: any) => {
    console.log('Workflow completed with data:', data);
    setOpenWorkflow(false);
    
    if (data.briefContext) {
      localStorage.setItem('airwave_brief_context', JSON.stringify({
        ...data.briefContext,
        timestamp: Date.now()
      }));
      
      showNotification('Brief processed successfully! Navigate to Generate page to create content.', 'success');
      setTimeout(() => {
        router.push('/generate-enhanced');
      }, 2000);
    }
  };

  const filteredBriefs = briefs.filter(brief => {
    const matchesSearch = brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brief.objective.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || brief.type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <>
      <Head>
        <title>Strategic Content | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Strategic Content">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Strategic Content Development
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create strategic briefs and generate AI-powered content frameworks
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
        >
          <Tab
            icon={<CloudUploadIcon />}
            label="Brand Guidelines"
            value={0}
            iconPosition="start"
          />
          <Tab
            icon={<BriefIcon />}
            label="Strategic Briefs"
            value={1}
            iconPosition="start"
          />
          <Tab
            icon={<AIIcon />}
            label="AI Content Generation"
            value={2}
            iconPosition="start"
          />
        </Tabs>

        <Box>
          {tabValue === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Brand Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload your brand guidelines to ensure AI-generated content aligns with your brand identity.
              </Typography>
              
              <BrandGuidelinesSection
                brandGuidelines={brandGuidelines}
                brandGuidelinesUploading={brandGuidelinesUploading}
                dragActive={dragActive}
                activeClient={activeClient}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleBrandGuidelinesDrop}
                onUpload={handleBrandGuidelinesUpload}
              />
            </Paper>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Strategic Briefs</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateBrief}
                >
                  Create Brief
                </Button>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search briefs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Content">Content</option>
                    <option value="Product">Product</option>
                    <option value="General">General</option>
                  </TextField>
                </Grid>
              </Grid>

              {filteredBriefs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <BriefIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No briefs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Create your first strategic brief to get started with AI content generation.
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateBrief}>
                    Create Brief
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredBriefs.map((brief) => (
                    <Grid item xs={12} md={6} lg={4} key={brief.id}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {contentTypeIcons[brief.type]}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {brief.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {brief.objective}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            px: 1, 
                            py: 0.5, 
                            bgcolor: 'primary.50', 
                            borderRadius: 1 
                          }}>
                            {brief.type}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            px: 1, 
                            py: 0.5, 
                            bgcolor: 'secondary.50', 
                            borderRadius: 1 
                          }}>
                            {brief.status}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(brief.dateCreated).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI Content Generation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use our unified workflow to upload briefs and generate strategic content with AI.
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<MagicIcon />}
                  onClick={() => setOpenWorkflow(true)}
                >
                  Start AI Content Workflow
                </Button>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Brief Dialog */}
        <BriefDialog
          open={openBriefDialog}
          onClose={() => setOpenBriefDialog(false)}
          briefForm={briefForm}
          setBriefForm={setBriefForm}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          campaigns={campaigns || []}
          onSubmit={handleSubmitBrief}
        />

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