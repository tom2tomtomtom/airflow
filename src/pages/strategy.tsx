import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  AutoAwesome,
  Psychology,
  ExpandMore,
  CloudUpload,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  CenterFocusStrong as Target,
  Refresh,
  Info,
  Star,
  StarBorder,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { BriefUploadModal } from '@/components/BriefUploadModal';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

interface Motivation {
  id?: string;
  title: string;
  description: string;
  category: 'emotional' | 'rational' | 'social' | 'fear' | 'aspiration' | 'convenience' | 'status' | 'safety';
  relevance_score: number;
  target_emotions: string[];
  use_cases: string[];
  psychological_rationale: string;
}

interface StrategyGenerationRequest {
  brief_id?: string;
  client_id: string;
  brief_content: string;
  target_audience?: string;
  campaign_objectives?: string;
  regenerate?: boolean;
  feedback?: string;
}

const StrategyPage: React.FC = () => {
  const { activeClient } = useClient();
  const { showNotification } = useNotification();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefUploadOpen, setBriefUploadOpen] = useState(false);

  // Form data
  const [briefContent, setBriefContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignObjectives, setCampaignObjectives] = useState('');
  const [feedback, setFeedback] = useState('');

  // Generated motivations
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);

  // Brief upload handling
  const handleBriefUpload = (briefData: any) => {
    if (briefData.content) {
      setBriefContent(briefData.content);
      setTargetAudience(briefData.target_audience || '');
      setCampaignObjectives(briefData.objectives || '');
      setActiveStep(1);
      showNotification('Brief uploaded and parsed successfully!', 'success');
    }
    setBriefUploadOpen(false);
  };

  // Generate motivations using AI
  const generateMotivations = async (regenerate = false) => {
    if (!activeClient) {
      setError('Please select a client first');
      return;
    }

    if (!briefContent.trim()) {
      setError('Please provide brief content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: StrategyGenerationRequest = {
        client_id: activeClient.id,
        brief_content: briefContent,
        target_audience: targetAudience,
        campaign_objectives: campaignObjectives,
        regenerate,
        feedback: feedback || undefined,
      };

      const response = await fetch('/api/strategy-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setMotivations(result.motivations || []);
        setActiveStep(2);
        showNotification(
          regenerate ? 'Motivations regenerated successfully!' : 'Strategic motivations generated successfully!',
          'success'
        );
      } else {
        setError(result.error || 'Failed to generate motivations');
      }
    } catch (err) {
      setError('Failed to generate motivations. Please try again.');
      console.error('Strategy generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle motivation selection
  const toggleMotivationSelection = (motivationId: string) => {
    setSelectedMotivations(prev =>
      prev.includes(motivationId)
        ? prev.filter(id => id !== motivationId)
        : [...prev, motivationId]
    );
  };

  // Category colors and icons
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      emotional: '#e91e63',
      rational: '#2196f3',
      social: '#ff9800',
      fear: '#f44336',
      aspiration: '#9c27b0',
      convenience: '#4caf50',
      status: '#ff5722',
      safety: '#607d8b',
    };
    return colors[category] || '#757575';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      emotional: <Psychology />,
      rational: <Lightbulb />,
      social: <Target />,
      fear: <TrendingUp />,
      aspiration: <Star />,
      convenience: <CheckCircle />,
      status: <StarBorder />,
      safety: <Info />,
    };
    return icons[category] || <Lightbulb />;
  };

  const steps = [
    'Upload Brief',
    'Generate Strategy',
    'Review Motivations',
    'Finalize Selection',
  ];

  return (
    <>
      <Head>
        <title>Strategy Generator | AIRFLOW</title>
      </Head>
      <DashboardLayout title="Strategy Generator">
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <AutoAwesome sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              AI Strategy Generator
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Generate strategic motivational concepts using AI to drive your campaign success
          </Typography>
        </Box>

        {!activeClient && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please select a client to begin strategy generation.
          </Alert>
        )}

        {activeClient && (
          <Grid container spacing={3}>
            {/* Progress Stepper */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={activeStep} orientation="horizontal">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            </Grid>

            {/* Step Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Step 0: Upload Brief */}
              {activeStep === 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Step 1: Provide Campaign Brief
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Upload a brief document or manually enter your campaign details
                    </Typography>

                    <Box display="flex" gap={2} mb={3}>
                      <Button
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => setBriefUploadOpen(true)}
                      >
                        Upload Brief Document
                      </Button>
                      <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                        or enter manually below
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Campaign Brief Content"
                      placeholder="Describe your campaign objectives, target audience, key messages, and any specific requirements..."
                      value={briefContent}
                      onChange={(e) => setBriefContent(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Target Audience"
                          placeholder="e.g., Young professionals aged 25-35"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Campaign Objectives"
                          placeholder="e.g., Increase brand awareness, Drive conversions"
                          value={campaignObjectives}
                          onChange={(e) => setCampaignObjectives(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Box mt={3}>
                      <Button
                        variant="contained"
                        onClick={() => generateMotivations()}
                        disabled={!briefContent.trim() || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                      >
                        {loading ? 'Generating Strategy...' : 'Generate Strategic Motivations'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Step 1: Generate Strategy (Loading State) */}
              {activeStep === 1 && (
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <CircularProgress size={24} />
                      <Typography variant="h6">
                        Generating Strategic Motivations...
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Our AI is analyzing your brief and generating strategic motivational concepts
                      tailored to your target audience and campaign objectives.
                    </Typography>
                    <Alert severity="info">
                      This process typically takes 10-30 seconds depending on the complexity of your brief.
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Review Motivations */}
              {activeStep === 2 && motivations.length > 0 && (
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justify-content="space-between" mb={3}>
                      <Typography variant="h6">
                        Generated Strategic Motivations ({motivations.length})
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Regenerate with feedback">
                          <IconButton onClick={() => generateMotivations(true)} disabled={loading}>
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Review the AI-generated motivational concepts below. Select the ones that best align
                      with your campaign strategy.
                    </Typography>

                    {feedback && (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Feedback for Regeneration"
                        placeholder="Provide feedback to improve the generated motivations..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        sx={{ mb: 3 }}
                      />
                    )}

                    <Grid container spacing={2}>
                      {motivations.map((motivation, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={motivation.id || index}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: selectedMotivations.includes(motivation.id || index.toString())
                                ? `2px solid ${getCategoryColor(motivation.category)}`
                                : '1px solid',
                              '&:hover': {
                                boxShadow: 2,
                                transform: 'translateY(-2px)',
                              },
                            }}
                            onClick={() => toggleMotivationSelection(motivation.id || index.toString())}
                          >
                            <CardContent>
                              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                                <Avatar
                                  sx={{
                                    bgcolor: getCategoryColor(motivation.category),
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {getCategoryIcon(motivation.category)}
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="h6" gutterBottom>
                                    {motivation.title}
                                  </Typography>
                                  <Chip
                                    label={motivation.category}
                                    size="small"
                                    sx={{
                                      bgcolor: getCategoryColor(motivation.category),
                                      color: 'white',
                                      mb: 1,
                                    }}
                                  />
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Rating
                                    value={motivation.relevance_score / 2}
                                    precision={0.1}
                                    size="small"
                                    readOnly
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {motivation.relevance_score}/10
                                  </Typography>
                                </Box>
                              </Box>

                              <Typography variant="body2" paragraph>
                                {motivation.description}
                              </Typography>

                              <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                  <Typography variant="subtitle2">
                                    Psychological Insights
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Typography variant="body2" paragraph>
                                    <strong>Rationale:</strong> {motivation.psychological_rationale}
                                  </Typography>

                                  {motivation.target_emotions.length > 0 && (
                                    <Box mb={2}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Target Emotions:
                                      </Typography>
                                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {motivation.target_emotions.map((emotion, idx) => (
                                          <Chip
                                            key={idx}
                                            label={emotion}
                                            size="small"
                                            variant="outlined"
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  )}

                                  {motivation.use_cases.length > 0 && (
                                    <Box>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Use Cases:
                                      </Typography>
                                      <List dense>
                                        {motivation.use_cases.map((useCase, idx) => (
                                          <ListItem key={idx} sx={{ py: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 20 }}>
                                              <CheckCircle sx={{ fontSize: 16 }} />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={useCase}
                                              primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Box>
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Box mt={3} display="flex" gap={2}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(3)}
                        disabled={selectedMotivations.length === 0}
                      >
                        Continue with Selected ({selectedMotivations.length})
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                      >
                        Back to Brief
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Finalize Selection */}
              {activeStep === 3 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Finalize Your Strategic Selection
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You've selected {selectedMotivations.length} strategic motivations.
                      These will be used to generate targeted content for your campaign.
                    </Typography>

                    <Alert severity="success" sx={{ mb: 3 }}>
                      Your strategic motivations are ready! You can now proceed to generate
                      content based on these insights.
                    </Alert>

                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          showNotification('Strategy saved successfully!', 'success');
                          // Here you would typically save to database or proceed to next step
                        }}
                      >
                        Save Strategy
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(2)}
                      >
                        Back to Review
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Strategy Overview
                  </Typography>

                  {activeClient && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Client
                      </Typography>
                      <Typography variant="body1">
                        {activeClient.name}
                      </Typography>
                    </Box>
                  )}

                  {briefContent && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Brief Summary
                      </Typography>
                      <Typography variant="body2">
                        {briefContent.substring(0, 150)}
                        {briefContent.length > 150 ? '...' : ''}
                      </Typography>
                    </Box>
                  )}

                  {targetAudience && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Target Audience
                      </Typography>
                      <Typography variant="body2">
                        {targetAudience}
                      </Typography>
                    </Box>
                  )}

                  {campaignObjectives && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Campaign Objectives
                      </Typography>
                      <Typography variant="body2">
                        {campaignObjectives}
                      </Typography>
                    </Box>
                  )}

                  {motivations.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Generated Motivations
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {motivations.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Strategic concepts generated
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
            </Grid>
          </Grid>
        )}

        {/* Brief Upload Modal */}
        <BriefUploadModal
          open={briefUploadOpen}
          onClose={() => setBriefUploadOpen(false)}
          onUploadComplete={handleBriefUpload}
        />
      </DashboardLayout>
    </>
  );
};

export default StrategyPage;
