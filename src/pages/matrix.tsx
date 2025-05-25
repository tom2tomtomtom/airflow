import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Grid,
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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Checkbox,
  FormControlLabel,
  Stack,
  Tooltip,
  Badge,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
  Switch,
  Slider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
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
  Compare as CompareIcon,
  Timeline as TimelineIcon,
  Shuffle as ShuffleIcon,
  CheckCircle as ApproveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
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
  const { createMatrix, updateMatrix, isLoading: savingMatrix } = useCreateMatrix();

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
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [router.query.templateId, templates]);

  useEffect(() => {
    // Initialize field values when template is selected
    if (selectedTemplate && variations.length > 0) {
      const initialValues: FieldValue[] = [];
      selectedTemplate.dynamicFields.forEach(field => {
        variations.forEach(variation => {
          initialValues.push({
            fieldId: field.id,
            variationId: variation.id,
            value: field.defaultValue,
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
      selectedTemplate.dynamicFields.forEach(field => {
        newFieldValues.push({
          fieldId: field.id,
          variationId: newVariation.id,
          value: field.defaultValue,
        });
      });
      setFieldValues([...fieldValues, ...newFieldValues]);
    }
  };

  const handleDuplicateVariation = (variationId: string) => {
    const sourcevVariation = variations.find(v => v.id === variationId);
    if (!sourcevVariation) return;

    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: `${sourcevVariation.name} (Copy)`,
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
        return prev.map(fv =>
          fv.fieldId === fieldId && fv.variationId === variationId
            ? { ...fv, value, assetId, asset }
            : fv
        );
      } else {
        return [...prev, { fieldId, variationId, value, assetId, asset }];
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
    // Generate all possible combinations of active variations
    const activeVariations = variations.filter(v => v.isActive);
    const newCombinations: Combination[] = [];
    
    // For demo, just create a few meaningful combinations
    if (activeVariations.length >= 1) {
      newCombinations.push({
        id: `combo-${Date.now()}-1`,
        name: 'Primary Combination',
        variationIds: [activeVariations[0].id],
        isSelected: true,
        performanceScore: 85,
      });
    }
    
    if (activeVariations.length >= 2) {
      newCombinations.push({
        id: `combo-${Date.now()}-2`,
        name: 'A/B Test Combination',
        variationIds: activeVariations.slice(0, 2).map(v => v.id),
        isSelected: true,
        performanceScore: 72,
      });
    }
    
    if (activeVariations.length >= 3) {
      newCombinations.push({
        id: `combo-${Date.now()}-3`,
        name: 'Full Test Suite',
        variationIds: activeVariations.map(v => v.id),
        isSelected: false,
        performanceScore: 68,
      });
    }

    setCombinations(newCombinations);
    showNotification(`Generated ${newCombinations.length} combinations`, 'success');
  };

  const handleSaveMatrix = async () => {
    if (!selectedTemplate || !matrixName) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const matrixData: Partial<Matrix> = {
      name: matrixName,
      description: matrixDescription,
      clientId: activeClient?.id || '',
      templateId: selectedTemplate.id,
      status: 'draft',
      variations,
      combinations,
      fieldAssignments: selectedTemplate.dynamicFields.reduce((acc, field) => {
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

    const { data, error } = await createMatrix(matrixData);
    if (error) {
      showNotification('Failed to save matrix', 'error');
    } else {
      showNotification('Matrix saved successfully!', 'success');
      router.push('/campaigns');
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

  const filteredTemplates = templates?.filter(template =>
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
    <DashboardLayout title="Matrix Editor">
      <Head>
        <title>Matrix Editor | AIrWAVE</title>
      </Head>

      <Box>
        <Typography variant="h4" gutterBottom>
          Campaign Matrix System
        </Typography>

        <Grid container spacing={3}>
          {/* Template Selection */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          <Grid item xs={12} md={9}>
            {selectedTemplate ? (
              <Paper sx={{ p: 3 }}>
                {/* Matrix Header */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Matrix Name"
                        value={matrixName}
                        onChange={(e) => setMatrixName(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Link to Campaign</InputLabel>
                        <Select
                          value={selectedCampaign?.id || ''}
                          label="Link to Campaign"
                          onChange={(e) => {
                            const campaign = campaigns?.find(c => c.id === e.target.value);
                            setSelectedCampaign(campaign || null);
                          }}
                        >
                          <MenuItem value="">None</MenuItem>
                          {campaigns?.map(campaign => (
                            <MenuItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    onChange={(e) => setMatrixDescription(e.target.value)}
                    multiline
                   
                    sx={{ mt: 2 }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
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
                                    onChange={(e) => {
                                      setVariations(variations.map(v =>
                                        v.id === variation.id ? { ...v, name: e.target.value } : v
                                      ));
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDuplicateVariation(variation.id)}
                                  >
                                    <DuplicateIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteVariation(variation.id)}
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
                                      onChange={(e) => {
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
                          {selectedTemplate.dynamicFields.map((field) => (
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
                                        multiline={field.constraints?.maxLength && field.constraints.maxLength > 50}
                                        rows={field.constraints?.maxLength && field.constraints.maxLength > 50 ? 2 : 1}
                                        value={fieldValue?.value || ''}
                                        onChange={(e) => handleFieldUpdate(field.id, variation.id, e.target.value)}
                                        placeholder={field.defaultValue || 'Enter text...'}
                                      />
                                    ) : field.type === 'color' ? (
                                      <TextField
                                        size="small"
                                        type="color"
                                        value={fieldValue?.value || '#000000'}
                                        onChange={(e) => handleFieldUpdate(field.id, variation.id, e.target.value)}
                                      />
                                    ) : fieldValue?.asset ? (
                                      <Box>
                                        {field.type === 'image' && (
                                          <img
                                            src={fieldValue.asset.url}
                                            alt={fieldValue.asset.name}
                                            style={{ width: 100, height: 60, objectFit: 'cover' }}
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
                          <Grid item xs={12} md={6} key={combo.id}>
                            <Card sx={{ position: 'relative' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                  <Typography variant="h6">{combo.name}</Typography>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={combo.isSelected}
                                        onChange={(e) => {
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
                                      <Slider
                                        value={combo.performanceScore}
                                        disabled
                                        sx={{ flex: 1 }}
                                      />
                                      <Typography variant="body2">
                                        {combo.performanceScore}%
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
                        <Grid item xs={12} md={4} key={variation.id}>
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
                {assets?.filter(asset => {
                  const field = selectedField ? selectedTemplate?.dynamicFields.find(f => f.id === selectedField) : null;
                  return !field || asset.type === field.type;
                }).map(asset => (
                  <ListItem
                    key={asset.id}
                    button
                    onClick={() => handleAssetSelect(asset)}
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
                <Grid item xs={12} md={4} key={variation.id}>
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
  );
};

export default MatrixPage;
