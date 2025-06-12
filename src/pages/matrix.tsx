import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  Stack,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
  Switch,
  Slider,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Videocam as VideoIcon,
  Audiotrack as AudiotrackIcon,
  ColorLens as ColorLensIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  AutoAwesome as MagicIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTemplates, useAssets, useCreateMatrix, useCampaigns } from '@/hooks/useData';
import type { Template, Asset, Matrix, Campaign } from '@/types/models';

// Variation interface
interface Variation {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  performance?: {
    views: number;
    clicks: number;
    conversions: number;
    score: number;
  };
}

// Field value interface
interface FieldValue {
  fieldId: string;
  variationId: string;
  value?: string;
  assetId?: string;
  asset?: Asset;
}

// Combination interface
interface Combination {
  id: string;
  name: string;
  variationIds: string[];
  isSelected: boolean;
  performanceScore?: number;
}

const MatrixPage: React.FC = () => {
  const router = useRouter();
  const { activeClient } = useClient();
  const { showNotification } = useNotification();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: assets, isLoading: assetsLoading } = useAssets(activeClient?.id);
  const { data: campaigns } = useCampaigns(activeClient?.id);
  const { createMatrix, isLoading: savingMatrix } = useCreateMatrix();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [variations, setVariations] = useState<Variation[]>([
    { id: 'var-1', name: 'Version A', isActive: true, isDefault: true },
  ]);
  const [fieldValues, setFieldValues] = useState<FieldValue[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [matrixName, setMatrixName] = useState('');
  const [matrixDescription, setMatrixDescription] = useState('');

  const isLoading = templatesLoading || assetsLoading;

  useEffect(() => {
    // Load template from query params if provided
    const templateId = router.query.templateId as string;
    if (templateId && templates) {
      const template = templates.find((t: Template) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [router.query.templateId, templates]);

  useEffect(() => {
    // Initialize field values when template is selected
    if (selectedTemplate && variations.length > 0) {
      const initialValues: FieldValue[] = [];
      // TEMPORARY FIX: Check if dynamicFields exists (missing in current schema)
      const dynamicFields = selectedTemplate.dynamicFields || [];
      dynamicFields.forEach(field => {
        variations.forEach(variation => {
          initialValues.push({
            fieldId: field.id,
            variationId: variation.id,
            value: field.defaultValue || '',
          });
        });
      });
      setFieldValues(initialValues);
    }
  }, [selectedTemplate, variations]);

  const handleAddVariation = () => {
    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: `Version ${String.fromCharCode(65 + variations.length)}`,
      isActive: true,
      isDefault: false,
    };
    setVariations([...variations, newVariation]);

    // Add field values for new variation
    if (selectedTemplate) {
      const newFieldValues: FieldValue[] = [];
      (selectedTemplate.dynamicFields || []).forEach(field => {
        newFieldValues.push({
          fieldId: field.id,
          variationId: newVariation.id,
          value: field.defaultValue || '',
        });
      });
      setFieldValues([...fieldValues, ...newFieldValues]);
    }
  };

  const handleDuplicateVariation = (variationId: string) => {
    const sourceVariation = variations.find(v => v.id === variationId);
    if (!sourceVariation) return;

    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: `${sourceVariation.name} (Copy)`,
      isActive: true,
      isDefault: false,
    };
    setVariations([...variations, newVariation]);

    // Copy field values
    const sourceValues = fieldValues.filter(fv => fv.variationId === variationId);
    const newFieldValues = sourceValues.map(sv => ({
      ...sv,
      variationId: newVariation.id,
    }));
    setFieldValues([...fieldValues, ...newFieldValues]);
    showNotification('Variation duplicated successfully', 'success');
  };

  const handleDeleteVariation = (variationId: string) => {
    if (variations.length === 1) {
      showNotification('Cannot delete the last variation', 'error');
      return;
    }
    setVariations(variations.filter(v => v.id !== variationId));
    setFieldValues(fieldValues.filter(fv => fv.variationId !== variationId));
    showNotification('Variation deleted', 'info');
  };

  const handleFieldUpdate = (fieldId: string, variationId: string, value?: string, assetId?: string, asset?: Asset) => {
    setFieldValues(prev => {
      const existing = prev.find(fv => fv.fieldId === fieldId && fv.variationId === variationId);
      if (existing) {
        return prev.map(fv => {
          if (fv.fieldId === fieldId && fv.variationId === variationId) {
            const updatedValue: FieldValue = { ...fv, value: value || '' };
            if (assetId !== undefined) {
              updatedValue.assetId = assetId;
            } else {
              delete updatedValue.assetId;
            }
            if (asset !== undefined) {
              updatedValue.asset = asset;
            } else {
              delete updatedValue.asset;
            }
            return updatedValue;
          }
          return fv;
        });
      } else {
        const newFieldValue: FieldValue = { fieldId, variationId, value: value || '' };
        if (assetId !== undefined) {
          newFieldValue.assetId = assetId;
        }
        if (asset !== undefined) {
          newFieldValue.asset = asset;
        }
        return [...prev, newFieldValue];
      }
    });
  };

  const handleAssetSelect = (asset: Asset) => {
    if (selectedField && selectedVariation) {
      handleFieldUpdate(selectedField, selectedVariation, undefined, asset.id, asset);
      setAssetDialogOpen(false);
      setSelectedField(null);
      setSelectedVariation(null);
    }
  };

  const handleGenerateCombinations = () => {
    // Generate strategic combinations based on active variations
    const activeVariations = variations.filter(v => v.isActive);
    const newCombinations: Combination[] = [];

    if (activeVariations.length === 0) {
      showNotification('Please create and activate variations first', 'warning');
      return;
    }

    // Single variation tests (for baseline performance)
    activeVariations.forEach((variation, index) => {
      newCombinations.push({
        id: `single-${variation.id}`,
        name: `${variation.name} Solo Test`,
        variationIds: [variation.id],
        isSelected: index < 2, // Auto-select first 2
        performanceScore: 75 + Math.random() * 20, // Simulated score
      });
    });

    // A/B test combinations (pairs)
    if (activeVariations.length >= 2) {
      for (let i = 0; i < activeVariations.length - 1; i++) {
        for (let j = i + 1; j < activeVariations.length; j++) {
          newCombinations.push({
            id: `ab-${activeVariations[i].id}-${activeVariations[j].id}`,
            name: `${activeVariations[i].name} vs ${activeVariations[j].name}`,
            variationIds: [activeVariations[i].id, activeVariations[j].id],
            isSelected: newCombinations.filter(c => c.isSelected).length < 3,
            performanceScore: 70 + Math.random() * 25,
          });
        }
      }
    }

    // Multi-variant tests (3+ variations)
    if (activeVariations.length >= 3) {
      // Full test with all variations
      newCombinations.push({
        id: `multi-all`,
        name: 'Complete Test Suite',
        variationIds: activeVariations.map(v => v.id),
        isSelected: false,
        performanceScore: 65 + Math.random() * 20,
      });

      // Subset tests (75% of variations)
      const subsetSize = Math.max(3, Math.floor(activeVariations.length * 0.75));
      if (subsetSize < activeVariations.length) {
        newCombinations.push({
          id: `subset-${subsetSize}`,
          name: `Top ${subsetSize} Variations`,
          variationIds: activeVariations.slice(0, subsetSize).map(v => v.id),
          isSelected: false,
          performanceScore: 68 + Math.random() * 22,
        });
      }
    }

    // Performance-based combination (select top performing if available)
    const hasPerformanceData = variations.some(v => v.performance?.score);
    if (hasPerformanceData && activeVariations.length >= 2) {
      const topPerformers = activeVariations
        .filter(v => v.performance?.score)
        .sort((a, b) => (b.performance?.score || 0) - (a.performance?.score || 0))
        .slice(0, 3);

      if (topPerformers.length >= 2) {
        newCombinations.push({
          id: `top-performers`,
          name: 'Top Performers Test',
          variationIds: topPerformers.map(v => v.id),
          isSelected: true,
          performanceScore: Math.max(...topPerformers.map(v => v.performance?.score || 0)) + 5,
        });
      }
    }

    setCombinations(newCombinations);
    showNotification(`Generated ${newCombinations.length} strategic combinations`, 'success');
  };

  const handleSaveMatrix = async () => {
    if (!selectedTemplate || !matrixName) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (!selectedCampaign) {
      showNotification('Please select a campaign to link this matrix', 'error');
      return;
    }

    const matrixData = {
      name: matrixName,
      description: matrixDescription,
      campaign_id: selectedCampaign.id,
      template_id: selectedTemplate.id,
      variations,
      combinations,
      field_assignments: (selectedTemplate.dynamicFields || []).reduce((acc, field) => {
        acc[field.id] = {
          status: 'completed',
          content: variations.map(v => {
            const fv = fieldValues.find(val => val.fieldId === field.id && val.variationId === v.id);
            return {
              id: `content-${field.id}-${v.id}`,
              variationId: v.id,
              content: fv?.value || '',
            };
          }),
          assets: variations
            .map(v => {
              const fv = fieldValues.find(val => val.fieldId === field.id && val.variationId === v.id);
              return fv?.assetId ? { variationId: v.id, assetId: fv.assetId } : null;
            })
            .filter(Boolean) as any[],
        };
        return acc;
      }, {} as any),
    };

    const { error } = await createMatrix(matrixData);
    if (error) {
      showNotification('Failed to save matrix', 'error');
    } else {
      showNotification('Matrix saved successfully!', 'success');
      router.push(`/campaigns/${selectedCampaign.id}?tab=matrices`);
    }
  };

  const handleSubmitForApproval = () => {
    handleSaveMatrix();
    showNotification('Matrix submitted for approval', 'success');
    router.push('/sign-off');
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextFieldsIcon />;
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'audio': return <AudiotrackIcon />;
      case 'color': return <ColorLensIcon />;
      case 'link': return <LinkIcon />;
      default: return <TextFieldsIcon />;
    }
  };

  const getFieldValue = (fieldId: string, variationId: string) => {
    return fieldValues.find(fv => fv.fieldId === fieldId && fv.variationId === variationId);
  };

  const getMatrixQualityScore = () => {
    let score = 100;
    const issues: string[] = [];

    // Check basic requirements
    if (!matrixName || matrixName.length < 3) {
      score -= 20;
      issues.push('Matrix needs a descriptive name');
    }

    if (!matrixDescription || matrixDescription.length < 10) {
      score -= 15;
      issues.push('Add a detailed description');
    }

    if (!selectedCampaign) {
      score -= 20;
      issues.push('Link matrix to a campaign');
    }

    // Check variations
    const activeVariations = variations.filter(v => v.isActive);
    if (activeVariations.length === 0) {
      score -= 25;
      issues.push('Create at least one active variation');
    } else if (activeVariations.length === 1) {
      score -= 10;
      issues.push('Add more variations for A/B testing');
    }

    // Check field completeness
    if (selectedTemplate) {
      const totalFields = (selectedTemplate.dynamicFields || []).length;
      const completedFields = (selectedTemplate.dynamicFields || []).filter(field => {
        return variations.some(variation => {
          const fv = getFieldValue(field.id, variation.id);
          return fv && (fv.value || fv.assetId);
        });
      }).length;

      const completionRatio = totalFields > 0 ? completedFields / totalFields : 1;
      if (completionRatio < 0.5) {
        score -= 15;
        issues.push('Complete more template fields');
      } else if (completionRatio < 1) {
        score -= 5;
        issues.push('Fill remaining template fields');
      }
    }

    // Check combinations
    if (combinations.length === 0) {
      score -= 10;
      issues.push('Generate test combinations');
    }

    return {
      score: Math.max(0, score),
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
      issues,
      isReady: score >= 70 && selectedCampaign && matrixName && activeVariations.length > 0
    };
  };

  const getMatrixInsights = () => {
    const insights: string[] = [];
    const activeVariations = variations.filter(v => v.isActive);

    if (activeVariations.length === 2) {
      insights.push('Perfect setup for A/B testing');
    } else if (activeVariations.length > 4) {
      insights.push('High variation count enables comprehensive testing');
    }

    if (selectedTemplate?.platform) {
      insights.push(`Optimized for ${selectedTemplate.platform} platform`);
    }

    if (combinations.filter(c => c.isSelected).length > 0) {
      insights.push('Test combinations selected and ready');
    }

    const totalAssets = fieldValues.filter(fv => fv.assetId).length;
    if (totalAssets > 0) {
      insights.push(`${totalAssets} assets assigned to variations`);
    }

    return insights;
  };

  const filteredTemplates = templates?.filter((template: Template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.platform.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!activeClient) {
    return (
      <DashboardLayout title="Matrix Editor">
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to create matrices
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout title="Matrix Editor">
        <Head>
          <title>Matrix Editor | AIrFLOW</title>
        </Head>
        <Box>
        <Typography variant="h4" gutterBottom>
          Campaign Matrix System
        </Typography>
        <Grid container spacing={3}>
          {/* Template Selection */}
          <Grid xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Select Template
              </Typography>
              {isLoading ? (
                <LoadingSkeleton variant="list" />
              ) : (
                <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                  {filteredTemplates.map((template: any) => (
                    <Card
                      key={template.id}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        border: selectedTemplate?.id === template.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1">
                          {template.name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip label={template.platform} size="small" />
                          <Chip label={template.aspectRatio} size="small" variant="outlined" />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Matrix Editor */}
          <Grid xs={12} md={9}>
            {selectedTemplate ? (
              <Paper sx={{ p: 3 }}>
                {/* Matrix Header */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Matrix Name"
                        value={matrixName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatrixName(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Link to Campaign</InputLabel>
                        <Select
                          value={selectedCampaign?.id || ''}
                          label="Link to Campaign"
                          onChange={(e: any) => {
                            const campaign = campaigns?.find((c: Campaign) => c.id === e.target.value);
                            setSelectedCampaign(campaign || null);
                          }}
                        >
                          <MenuItem value="">None</MenuItem>
                          {campaigns?.map((campaign: Campaign) => (
                            <MenuItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveMatrix}
                          disabled={savingMatrix || !matrixName}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<PreviewIcon />}
                          onClick={() => setPreviewOpen(true)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<SendIcon />}
                          onClick={handleSubmitForApproval}
                        >
                          Submit
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Description"
                    value={matrixDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatrixDescription(e.target.value)}
                    multiline
                    rows={2}
                    sx={{ mt: 2 }}
                  />

                  {/* Matrix Quality Indicator */}
                  {selectedTemplate && (
                    <Card sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6">Matrix Quality</Typography>
                            <Chip
                              label={`Grade ${getMatrixQualityScore().grade}`}
                              color={getMatrixQualityScore().score >= 80 ? 'success' : getMatrixQualityScore().score >= 60 ? 'warning' : 'error'}
                              variant="outlined"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {getMatrixQualityScore().score}/100
                            </Typography>
                          </Box>
                          {getMatrixQualityScore().issues.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {getMatrixQualityScore().issues.slice(0, 2).map((issue, index) => (
                                <Typography key={index} variant="caption" color="warning.main" display="block">
                                  • {issue}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Grid>
                        <Grid xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Insights</Typography>
                          {getMatrixInsights().slice(0, 3).map((insight, index) => (
                            <Typography key={index} variant="caption" color="text.secondary" display="block">
                              • {insight}
                            </Typography>
                          ))}
                        </Grid>
                      </Grid>
                    </Card>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                  <Tab label={`Variations (${variations.length})`} />
                  <Tab label={`Combinations (${combinations.length})`} />
                  <Tab label="Performance" />
                </Tabs>

                {/* Variations Tab */}
                {activeTab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Variations</Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddVariation}
                        variant="outlined"
                      >
                        Add Variation
                      </Button>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Field</TableCell>
                            {variations.map(variation => (
                              <TableCell key={variation.id} align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TextField
                                    size="small"
                                    value={variation.name}
                                    onChange={(e: any) => {
                                      setVariations(variations.map(v =>
                                        v.id === variation.id ? { ...v, name: e.target.value } : v
                                      ));
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDuplicateVariation(variation.id)}
                                    aria-label="Duplicate variation"
                                  >
                                    <DuplicateIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteVariation(variation.id)}
                                    aria-label="Delete variation"
                                    disabled={variations.length === 1}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      checked={variation.isActive}
                                      onChange={(e: any) => {
                                        setVariations(variations.map(v =>
                                          v.id === variation.id ? { ...v, isActive: e.target.checked } : v
                                        ));
                                      }}
                                    />
                                  }
                                  label="Active"
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(selectedTemplate.dynamicFields || []).map((field) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getFieldIcon(field.type)}
                                  <Box>
                                    <Typography variant="body2">
                                      {field.name}
                                      {field.required && <Chip label="Required" size="small" sx={{ ml: 1 }} />}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {field.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              {variations.map(variation => {
                                const fieldValue = getFieldValue(field.id, variation.id);
                                return (
                                  <TableCell key={variation.id} align="center">
                                    {field.type === 'text' ? (
                                      <TextField
                                        size="small"
                                        fullWidth
                                        multiline={!!(field.constraints?.maxLength && field.constraints.maxLength > 50)}
                                        rows={field.constraints?.maxLength && field.constraints.maxLength > 50 ? 2 : 1}
                                        value={fieldValue?.value || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                          handleFieldUpdate(field.id, variation.id, e.target.value)}
                                        placeholder={field.defaultValue || 'Enter text...'}
                                      />
                                    ) : field.type === 'color' ? (
                                      <TextField
                                        size="small"
                                        type="color"
                                        value={fieldValue?.value || '#000000'}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                          handleFieldUpdate(field.id, variation.id, e.target.value)}
                                      />
                                    ) : fieldValue?.asset ? (
                                      <Box>
                                        {field.type === 'image' && (
                                          <Image
                                            src={fieldValue.asset.url}
                                            alt={fieldValue.asset.name}
                                            width={100}
                                            height={60}
                                          />
                                        )}
                                        <Typography variant="caption" display="block">
                                          {fieldValue.asset.name}
                                        </Typography>
                                        <Button
                                          size="small"
                                          onClick={() => {
                                            setSelectedField(field.id);
                                            setSelectedVariation(variation.id);
                                            setAssetDialogOpen(true);
                                          }}
                                        >
                                          Change
                                        </Button>
                                      </Box>
                                    ) : (
                                      <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                          setSelectedField(field.id);
                                          setSelectedVariation(variation.id);
                                          setAssetDialogOpen(true);
                                        }}
                                      >
                                        Select {field.type}
                                      </Button>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Combinations Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Combinations</Typography>
                      <Button
                        startIcon={<MagicIcon />}
                        onClick={handleGenerateCombinations}
                        variant="contained"
                        color="secondary"
                      >
                        Generate Combinations
                      </Button>
                    </Box>
                    {combinations.length === 0 ? (
                      <Alert severity="info">
                        No combinations generated yet. Click "Generate Combinations" to create optimized variation sets.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {combinations.map(combo => (
                          <Grid xs={12} md={6} key={combo.id}>
                            <Card sx={{ position: 'relative' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                  <Typography variant="h6">{combo.name}</Typography>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={combo.isSelected}
                                        onChange={(e: any) => {
                                          setCombinations(combinations.map(c =>
                                            c.id === combo.id ? { ...c, isSelected: e.target.checked } : c
                                          ));
                                        }}
                                      />
                                    }
                                    label="Active"
                                  />
                                </Box>
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                  {combo.variationIds.map(varId => {
                                    const variation = variations.find(v => v.id === varId);
                                    return variation ? (
                                      <Chip key={varId} label={variation.name} size="small" />
                                    ) : null;
                                  })}
                                </Stack>
                                {combo.performanceScore && (
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Performance Score
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Slider value={combo.performanceScore} disabled sx={{ flex: 1 }} />
                                      <Typography variant="body2">
                                        {Math.round(combo.performanceScore)}%
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {/* Performance Tab */}
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Performance Predictions
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Performance predictions will be available after the matrix is executed and receives initial engagement data.
                    </Alert>
                    <Grid container spacing={2}>
                      {variations.map(variation => (
                        <Grid xs={12} md={4} key={variation.id}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {variation.name}
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Predicted Engagement
                                </Typography>
                                <Slider value={75} disabled />
                                <Typography variant="body2" color="text.secondary">
                                  Predicted Conversion
                                </Typography>
                                <Slider value={60} disabled />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a template to begin creating your matrix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose from the templates on the left to start building your campaign variations
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Asset Selection Dialog */}
        <Dialog
          open={assetDialogOpen}
          onClose={() => setAssetDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Select Asset</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                placeholder="Search assets..."
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <List>
                {assets?.filter((asset: Asset) => {
                  const field = selectedField ? (selectedTemplate?.dynamicFields || []).find(f => f.id === selectedField) : null;
                  return !field || asset.type === field.type;
                }).map((asset: Asset) => (
                  <ListItem
                    key={asset.id}
                    onClick={() => handleAssetSelect(asset)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemAvatar>
                      {asset.type === 'image' && asset.thumbnail ? (
                        <Avatar src={asset.thumbnail} variant="rounded" />
                      ) : (
                        <Avatar variant="rounded">
                          {getFieldIcon(asset.type)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={asset.name}
                      secondary={asset.tags?.join(', ')}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssetDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Matrix Preview</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Preview functionality will display rendered variations once integrated with Creatomate
            </Alert>
            <Grid container spacing={2}>
              {variations.filter(v => v.isActive).map(variation => (
                <Grid xs={12} md={4} key={variation.id}>
                  <Card>
                    <Box
                      sx={{
                        height: 300,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        {variation.name} Preview
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="h6">{variation.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedTemplate?.name} - {selectedTemplate?.platform}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        </Box>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default MatrixPage;