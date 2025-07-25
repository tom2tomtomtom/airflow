import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import { Edit, MusicNote, Palette, Settings, ExpandMore } from '@mui/icons-material';
import {
  ContentElementEditorProps,
  ContentElement,
  ContentElements,
  VoiceOver,
  BrandElements,
} from './types';

/**
 * ContentElementEditor Component
 *
 * Provides tabbed interface for editing video content elements including
 * text overlays, audio settings, branding, and generation settings.
 * Extracted from VideoStudioPage to improve modularity and testability.
 */
export const ContentElementEditor: React.FC<ContentElementEditorProps> = ({
  elements,
  onElementsChange,
  template,
  selectedElement,
  onElementSelect,
  maxElements = 10,
  contentElements = {
    text_overlays: [],
    background_music: true,
    voice_over: undefined,
    brand_elements: undefined,
  },
  generationSettings = {
    variations_count: 1,
    include_captions: false,
    auto_optimize_for_platform: true,
    save_to_assets: true,
  },
  onGenerationSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Helper function to update content elements
  const updateContentElements = (updates: Partial<ContentElements>) => {
    onElementsChange({
      ...contentElements,
      ...updates,
    });
  };

  // Text overlay handlers
  const handleAddTextOverlay = () => {
    const newOverlay: ContentElement = {
      text: '',
      position: 'center',
    };
    onElementsChange([...elements, newOverlay]);
  };

  const handleUpdateTextOverlay = (index: number, updates: Partial<ContentElement>) => {
    const updatedOverlays = [...elements];
    updatedOverlays[index] = { ...updatedOverlays[index], ...updates };
    onElementsChange(updatedOverlays);
  };

  const handleRemoveTextOverlay = (index: number) => {
    const updatedOverlays = elements.filter((_, i) => i !== index);
    onElementsChange(updatedOverlays);

    // Reset selection if removed element was selected
    if (selectedElement === index.toString()) {
      onElementSelect('');
    }
  };

  // Audio handlers
  const handleBackgroundMusicToggle = (checked: boolean) => {
    updateContentElements({
      background_music: checked,
    });
  };

  const handleVoiceOverToggle = (checked: boolean) => {
    if (checked) {
      const newVoiceOver: VoiceOver = {
        text: '',
        voice: 'neural',
        language: 'en',
      };
      updateContentElements({
        voice_over: newVoiceOver,
      });
    } else {
      updateContentElements({
        voice_over: undefined,
      });
    }
  };

  const handleVoiceOverUpdate = (updates: Partial<VoiceOver>) => {
    if (contentElements.voice_over) {
      updateContentElements({
        voice_over: {
          ...contentElements.voice_over,
          ...updates,
        },
      });
    }
  };

  // Brand elements handlers
  const handleBrandElementsUpdate = (updates: Partial<BrandElements>) => {
    updateContentElements({
      brand_elements: {
        ...contentElements.brand_elements,
        ...updates,
      },
    });
  };

  // Generation settings handlers
  const handleGenerationSettingsUpdate = (updates: Partial<typeof generationSettings>) => {
    if (onGenerationSettingsChange) {
      onGenerationSettingsChange(updates);
    }
  };

  const canAddMoreOverlays = elements.length < maxElements;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Customize Content Elements
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add text overlays, voice-over, and brand elements to your video
        </Typography>

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Text Overlays" icon={<Edit />} iconPosition="start" />
          <Tab label="Audio" icon={<MusicNote />} iconPosition="start" />
          <Tab label="Branding" icon={<Palette />} iconPosition="start" />
          <Tab label="Settings" icon={<Settings />} iconPosition="start" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {/* Text Overlays Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Text Overlays
              </Typography>

              {elements.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    No text overlays added yet
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleAddTextOverlay}
                    disabled={!canAddMoreOverlays}
                  >
                    Add Text Overlay
                  </Button>
                </Paper>
              ) : (
                <Box>
                  {elements.map((overlay, index) => (
                    <Accordion
                      key={index}
                      expanded={selectedElement === index.toString()}
                      onChange={() => onElementSelect(index.toString())}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>
                          Text Overlay {index + 1}: {overlay.text || 'Untitled'}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                              fullWidth
                              label="Text"
                              value={overlay.text}
                              onChange={e =>
                                handleUpdateTextOverlay(index, { text: e.target.value })
                              }
                              placeholder="Enter overlay text..."
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                              <InputLabel>Position</InputLabel>
                              <Select
                                value={overlay.position}
                                label="Position"
                                onChange={e =>
                                  handleUpdateTextOverlay(index, {
                                    position: e.target.value as ContentElement['position'],
                                  })
                                }
                              >
                                <MenuItem value="top">Top</MenuItem>
                                <MenuItem value="center">Center</MenuItem>
                                <MenuItem value="bottom">Bottom</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Button
                              color="error"
                              onClick={() => handleRemoveTextOverlay(index)}
                              variant="outlined"
                            >
                              Remove Overlay
                            </Button>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={handleAddTextOverlay}
                    disabled={!canAddMoreOverlays}
                  >
                    Add Another Overlay
                  </Button>
                  {!canAddMoreOverlays && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Maximum {maxElements} overlays allowed
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Audio Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Audio Settings
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={contentElements.background_music}
                      onChange={e => handleBackgroundMusicToggle(e.target.checked)}
                    />
                  }
                  label="Include Background Music"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!contentElements.voice_over}
                      onChange={e => handleVoiceOverToggle(e.target.checked)}
                    />
                  }
                  label="Include Voice Over"
                />
              </Grid>

              {contentElements.voice_over && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Voice Over Text"
                      value={contentElements.voice_over.text}
                      onChange={e => handleVoiceOverUpdate({ text: e.target.value })}
                      placeholder="Enter text to be spoken in the voice over..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Voice</InputLabel>
                      <Select
                        value={contentElements.voice_over.voice}
                        label="Voice"
                        onChange={e => handleVoiceOverUpdate({ voice: e.target.value })}
                      >
                        <MenuItem value="neural">Neural (Default)</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={contentElements.voice_over.language}
                        label="Language"
                        onChange={e => handleVoiceOverUpdate({ language: e.target.value })}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                        <MenuItem value="it">Italian</MenuItem>
                        <MenuItem value="pt">Portuguese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          )}

          {/* Branding Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Brand Elements
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Customize how your brand appears in the video
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={contentElements.brand_elements?.logo_url || ''}
                  onChange={e => handleBrandElementsUpdate({ logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Font Family"
                  value={contentElements.brand_elements?.font_family || ''}
                  onChange={e => handleBrandElementsUpdate({ font_family: e.target.value })}
                  placeholder="Arial, Helvetica, sans-serif"
                />
              </Grid>

              {contentElements.brand_elements?.color_scheme && (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2">Brand Colors:</Typography>
                    {contentElements.brand_elements.color_scheme.map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: color,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    ))}
                    <Typography variant="caption" color="text.secondary">
                      (From client settings)
                    </Typography>
                  </Box>
                </Grid>
              )}

              {template && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Template: {template.name} supports {template.platform.join(', ')} platforms
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Settings Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Generation Settings
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography gutterBottom>
                    Variations: {generationSettings.variations_count}
                  </Typography>
                  <Slider
                    value={generationSettings.variations_count}
                    onChange={(_, value) =>
                      handleGenerationSettingsUpdate({
                        variations_count: value as number,
                      })
                    }
                    min={1}
                    max={5}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 3, label: '3' },
                      { value: 5, label: '5' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Number of video variations to generate
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generationSettings.include_captions}
                      onChange={e =>
                        handleGenerationSettingsUpdate({
                          include_captions: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Include Captions"
                />
                <Typography variant="body2" color="text.secondary">
                  Automatically generate subtitles for the video
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generationSettings.auto_optimize_for_platform}
                      onChange={e =>
                        handleGenerationSettingsUpdate({
                          auto_optimize_for_platform: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Auto-optimize for Platform"
                />
                <Typography variant="body2" color="text.secondary">
                  Automatically adjust video settings for the selected platform
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generationSettings.save_to_assets}
                      onChange={e =>
                        handleGenerationSettingsUpdate({
                          save_to_assets: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Save to Assets Library"
                />
                <Typography variant="body2" color="text.secondary">
                  Automatically save generated videos to your assets library
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
