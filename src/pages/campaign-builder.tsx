import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  Stack,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Save,
  Publish,
  Preview,
  Download,
  Share,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { BriefUploadModal } from '@/components/BriefUploadModal';
import CampaignMatrix from '@/components/CampaignMatrix';
import VideoGenerationPanel from '@/components/VideoGenerationPanel';
import AssetUploadModal from '@/components/AssetUploadModal';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface CampaignData {
  id?: string;
  name: string;
  description: string;
  brief?: any;
  motivations: any[];
  copyAssets: any[];
  selectedAssets: any[];
  matrixCombinations: any[];
  generatedVideos: any[];
}

const steps = [
  'Campaign Setup',
  'Strategy & Content',
  'Asset Management', 
  'Campaign Matrix',
  'Video Generation',
  'Export & Publish'
];

const CampaignBuilderPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    motivations: [],
    copyAssets: [],
    selectedAssets: [],
    matrixCombinations: [],
    generatedVideos: [],
  });

  // Modal states
  const [briefUploadOpen, setBriefUploadOpen] = useState(false);
  const [assetUploadOpen, setAssetUploadOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if coming from strategy page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStrategy = urlParams.get('fromStrategy');
    
    if (fromStrategy === 'true') {
      // Load data from strategy page
      const briefId = urlParams.get('briefId');
      const motivations = urlParams.get('motivations');
      const copyAssets = urlParams.get('copyAssets');
      
      if (motivations) {
        // Load motivations and copy assets
        loadStrategyData(briefId, motivations, copyAssets);
      }
    }
  }, []);

  const loadStrategyData = async (briefId: string | null, motivationIds: string | null, copyAssetIds: string | null) => {
    try {
      setLoading(true);
      
      // Load motivations
      if (motivationIds) {
        const motivationIdArray = JSON.parse(motivationIds);
        const motivationsResponse = await fetch(`/api/motivations?ids=${motivationIdArray.join(',')}`);
        const motivationsData = await motivationsResponse.json();
        
        if (motivationsData.data) {
          setCampaignData(prev => ({ ...prev, motivations: motivationsData.data }));
        }
      }

      // Load copy assets
      if (copyAssetIds) {
        const copyAssetIdArray = JSON.parse(copyAssetIds);
        const copyResponse = await fetch(`/api/copy-assets?ids=${copyAssetIdArray.join(',')}`);
        const copyData = await copyResponse.json();
        
        if (copyData.data) {
          setCampaignData(prev => ({ ...prev, copyAssets: copyData.data }));
        }
      }

      // Set campaign name based on strategy content
      setCampaignData(prev => ({
        ...prev,
        name: `Campaign - ${new Date().toLocaleDateString()}`,
        description: 'Campaign created from strategy workflow',
      }));

      // Jump to matrix step since strategy is done
      setActiveStep(3);
      showNotification('Campaign created from strategy data!', 'success');
      
    } catch (error) {
      console.error('Error loading strategy data:', error);
      showNotification('Failed to load strategy data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleBriefUpload = (brief: any) => {
    setCampaignData(prev => ({ ...prev, brief }));
    setBriefUploadOpen(false);
    showNotification('Brief uploaded successfully!', 'success');
  };

  const handleMatrixCombinations = (combinations: any[]) => {
    setCampaignData(prev => ({ ...prev, matrixCombinations: combinations }));
    showNotification(`${combinations.length} combinations generated!`, 'success');
  };

  const handleVideosGenerated = (videos: any[]) => {
    setCampaignData(prev => ({ ...prev, generatedVideos: videos }));
    showNotification(`${videos.length} videos generated!`, 'success');
  };

  const saveCampaign = async () => {
    if (!activeClient) {
      showNotification('Please select a client first', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: activeClient.id,
          name: campaignData.name,
          description: campaignData.description,
          brief_id: campaignData.brief?.id,
          motivation_ids: campaignData.motivations.map(m => m.id),
          copy_asset_ids: campaignData.copyAssets.map(c => c.id),
          matrix_data: campaignData.matrixCombinations,
          status: 'draft',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCampaignData(prev => ({ ...prev, id: data.campaign.id }));
        showNotification('Campaign saved successfully!', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      showNotification('Failed to save campaign: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportCampaign = async (format: 'json' | 'csv' | 'pdf' | 'xlsx' = 'json') => {
    try {
      const exportData = {
        campaign: {
          id: campaignData.id,
          name: campaignData.name,
          description: campaignData.description,
          client: activeClient?.name,
          created_date: new Date().toISOString(),
        },
        strategy: {
          motivations: campaignData.motivations.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            relevance_score: m.relevance_score,
            category: m.category,
          })),
          copy_assets: campaignData.copyAssets.map(c => ({
            id: c.id,
            platform: c.platform,
            headline: c.headline,
            body: c.body,
            cta: c.cta,
            tone: c.tone,
          })),
        },
        matrix: {
          combinations_count: campaignData.matrixCombinations.length,
          combinations: campaignData.matrixCombinations.map(combo => ({
            id: combo.id,
            name: combo.name,
            fields: combo.fields,
          })),
        },
        videos: {
          generated_count: campaignData.generatedVideos.length,
          videos: campaignData.generatedVideos.map(video => ({
            id: video.id,
            status: video.status,
            platform: video.platform,
            duration: video.duration,
            output_url: video.output_url,
          })),
        },
        export_metadata: {
          export_date: new Date().toISOString(),
          export_format: format,
          exported_by: user?.email,
          version: '1.0',
        },
      };

      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'csv':
          const csvData = convertToCSV(exportData);
          blob = new Blob([csvData], { type: 'text/csv' });
          filename = `campaign-${campaignData.name}-${Date.now()}.csv`;
          break;
        
        case 'pdf':
          showNotification('PDF export coming soon!', 'info');
          return;
        
        case 'xlsx':
          showNotification('Excel export coming soon!', 'info');
          return;
        
        default:
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `campaign-${campaignData.name}-${Date.now()}.json`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification(`Campaign exported as ${format.toUpperCase()} successfully!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export campaign', 'error');
    }
  };

  const convertToCSV = (data: any): string => {
    const rows = [
      ['Type', 'Name', 'Description', 'Details'],
      ['Campaign', data.campaign.name, data.campaign.description, `Client: ${data.campaign.client}`],
      ['', '', '', ''],
      ['Motivations', '', '', ''],
    ];

    data.strategy.motivations.forEach((motivation: any) => {
      rows.push([
        'Motivation',
        motivation.title,
        motivation.description,
        `Score: ${motivation.relevance_score}, Category: ${motivation.category}`,
      ]);
    });

    rows.push(['', '', '', '']);
    rows.push(['Copy Assets', '', '', '']);

    data.strategy.copy_assets.forEach((copy: any) => {
      rows.push([
        'Copy',
        copy.platform,
        copy.headline,
        `Body: ${copy.body}, CTA: ${copy.cta}, Tone: ${copy.tone}`,
      ]);
    });

    rows.push(['', '', '', '']);
    rows.push(['Matrix Combinations', '', '', '']);

    data.matrix.combinations.forEach((combo: any) => {
      rows.push([
        'Combination',
        combo.name,
        '',
        JSON.stringify(combo.fields),
      ]);
    });

    rows.push(['', '', '', '']);
    rows.push(['Generated Videos', '', '', '']);

    data.videos.videos.forEach((video: any) => {
      rows.push([
        'Video',
        video.id,
        video.status,
        `Platform: ${video.platform}, Duration: ${video.duration}s`,
      ]);
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (!activeClient) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Alert severity="warning">
            Please select a client to start building a campaign.
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Campaign Builder | AIrFLOW</title>
      </Head>

      <Container maxWidth="lg">
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4">
              Campaign Builder
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={saveCampaign}
                disabled={saving || !campaignData.name}
              >
                {saving ? 'Saving...' : 'Save Campaign'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportCampaign('json')}
                disabled={!campaignData.name}
              >
                Export
              </Button>
            </Stack>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Build comprehensive marketing campaigns for {activeClient.name}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Campaign Setup */}
          <Step>
            <StepLabel>Campaign Setup</StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Campaign Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Campaign Name
                      </Typography>
                      <input
                        type="text"
                        placeholder="Enter campaign name"
                        value={campaignData.name}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px',
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Description
                      </Typography>
                      <textarea
                        placeholder="Describe your campaign objectives and strategy"
                        value={campaignData.description}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button disabled>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!campaignData.name.trim()}
                      endIcon={<ArrowForward />}
                    >
                      Continue
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 2: Strategy & Content */}
          <Step>
            <StepLabel>
              Strategy & Content
              {campaignData.motivations.length > 0 && (
                <Chip 
                  label={`${campaignData.motivations.length} motivations, ${campaignData.copyAssets.length} copy assets`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Strategy & Content
                  </Typography>

                  {campaignData.motivations.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Create strategic motivations and copy variations, or continue from strategy workflow.
                    </Alert>
                  ) : (
                    <Box mb={3}>
                      <Alert severity="success">
                        Loaded {campaignData.motivations.length} motivations and {campaignData.copyAssets.length} copy variations from strategy workflow.
                      </Alert>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} mb={3}>
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/strategy')}
                    >
                      Go to Strategy Builder
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setBriefUploadOpen(true)}
                    >
                      Upload Brief
                    </Button>
                  </Stack>

                  {campaignData.brief && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Brief: {campaignData.brief.title}
                    </Alert>
                  )}

                  <Box display="flex" justifyContent="space-between">
                    <Button onClick={handleBack} startIcon={<ArrowBack />}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                    >
                      Continue
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 3: Asset Management */}
          <Step>
            <StepLabel>
              Asset Management
              {campaignData.selectedAssets.length > 0 && (
                <Chip 
                  label={`${campaignData.selectedAssets.length} assets selected`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload and Manage Assets
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Upload images, videos, and audio files that will be used in your campaign.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => setAssetUploadOpen(true)}
                    sx={{ mb: 3 }}
                  >
                    Upload Assets
                  </Button>

                  <Box display="flex" justifyContent="space-between">
                    <Button onClick={handleBack} startIcon={<ArrowBack />}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                    >
                      Continue
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 4: Campaign Matrix */}
          <Step>
            <StepLabel>
              Campaign Matrix
              {campaignData.matrixCombinations.length > 0 && (
                <Chip 
                  label={`${campaignData.matrixCombinations.length} combinations`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Configure Campaign Matrix
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Create variations by combining different assets, copy, and content elements.
                  </Typography>

                  <CampaignMatrix
                    campaignId={campaignData.id}
                    onRender={handleMatrixCombinations}
                  />

                  <Box display="flex" justifyContent="space-between" mt={3}>
                    <Button onClick={handleBack} startIcon={<ArrowBack />}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={campaignData.matrixCombinations.length === 0}
                      endIcon={<ArrowForward />}
                    >
                      Continue to Video Generation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 5: Video Generation */}
          <Step>
            <StepLabel>
              Video Generation
              {campaignData.generatedVideos.length > 0 && (
                <Chip 
                  label={`${campaignData.generatedVideos.length} videos`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Generate Videos
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Generate videos based on your campaign matrix combinations using AI-powered video creation.
                  </Typography>

                  <VideoGenerationPanel
                    combinations={campaignData.matrixCombinations}
                    campaignId={campaignData.id}
                    onComplete={handleVideosGenerated}
                  />

                  <Box display="flex" justifyContent="space-between" mt={3}>
                    <Button onClick={handleBack} startIcon={<ArrowBack />}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                    >
                      Continue to Export
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 6: Export & Publish */}
          <Step>
            <StepLabel>Export & Publish</StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Export & Publish Campaign
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Export your generated content and publish to various platforms.
                  </Typography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">{campaignData.motivations.length}</Typography>
                        <Typography variant="caption">Motivations</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">{campaignData.copyAssets.length}</Typography>
                        <Typography variant="caption">Copy Variations</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">{campaignData.generatedVideos.length}</Typography>
                        <Typography variant="caption">Generated Videos</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={2} mb={3}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => exportCampaign('json')}
                    >
                      Export JSON
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => exportCampaign('csv')}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      disabled
                    >
                      Publish to Platforms
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Preview />}
                      disabled
                    >
                      Preview All Content
                    </Button>
                  </Stack>

                  <Alert severity="success">
                    Campaign "{campaignData.name}" is ready for deployment!
                  </Alert>

                  <Box display="flex" justifyContent="space-between" mt={3}>
                    <Button onClick={handleBack} startIcon={<ArrowBack />}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Publish />}
                      onClick={() => router.push('/campaigns')}
                    >
                      Complete Campaign
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </StepContent>
          </Step>
        </Stepper>
      </Container>

      {/* Modals */}
      <BriefUploadModal
        open={briefUploadOpen}
        onClose={() => setBriefUploadOpen(false)}
        onUploadComplete={handleBriefUpload}
      />

      <AssetUploadModal
        open={assetUploadOpen}
        onClose={() => setAssetUploadOpen(false)}
        onUploadComplete={() => {
          setAssetUploadOpen(false);
          showNotification('Assets uploaded successfully!', 'success');
        }}
      />
    </DashboardLayout>
  );
};

export default CampaignBuilderPage;