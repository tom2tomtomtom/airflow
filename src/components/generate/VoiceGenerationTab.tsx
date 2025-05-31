import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Slider,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Mic as MicIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Speed as SpeedIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Interface for generated voice
interface GeneratedVoice {
  id: string;
  url: string;
  text: string;
  voice: string;
  language: string;
  duration: string;
  dateCreated: string;
  favorite: boolean;
}

interface VoiceGenerationTabProps {
  voiceText: string;
  setVoiceText: (text: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  voiceLanguage: string;
  setVoiceLanguage: (language: string) => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  isGeneratingVoice: boolean;
  setIsGeneratingVoice: (isGenerating: boolean) => void;
  generatedVoices: GeneratedVoice[];
  setGeneratedVoices: (voices: GeneratedVoice[]) => void;
  handleGenerateVoice: () => void;
  handleToggleVoiceFavorite: (id: string) => void;
  setSnackbarMessage: (message: string) => void;
  setSnackbarSeverity: (severity: 'success' | 'error') => void;
  setSnackbarOpen: (open: boolean) => void;
}

const VoiceGenerationTab: React.FC<VoiceGenerationTabProps> = ({
  voiceText,
  setVoiceText,
  selectedVoice,
  setSelectedVoice,
  voiceLanguage,
  setVoiceLanguage,
  voiceSpeed,
  setVoiceSpeed,
  isGeneratingVoice,
  generatedVoices,
  handleGenerateVoice,
  handleToggleVoiceFavorite,
}) => {
  // State for audio playback
  const [playingVoiceId, setPlayingVoiceId] = React.useState<string | null>(null);

  // Handle play/pause
  const handlePlayPause = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voiceId);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate Voiceovers
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create professional AI-generated voiceovers for your content.
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Voice Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Text to Convert
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Enter the text you want to convert to speech..."
                value={voiceText}
                onChange={(e: React.ChangeEvent<HTMLElement>) => setVoiceText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                For best results, use clear and concise text with proper punctuation.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Voice
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="voice-select-label">Select Voice</InputLabel>
                <Select
                  labelId="voice-select-label"
                  id="voice-select"
                  value={selectedVoice}
                  label="Select Voice"
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setSelectedVoice(e.target.value)}
                >
                  <MenuItem value="emma">Emma (Female, Conversational)</MenuItem>
                  <MenuItem value="james">James (Male, Professional)</MenuItem>
                  <MenuItem value="sophia">Sophia (Female, Warm)</MenuItem>
                  <MenuItem value="michael">Michael (Male, Authoritative)</MenuItem>
                  <MenuItem value="olivia">Olivia (Female, Friendly)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={voiceLanguage}
                  label="Language"
                  onChange={(e: React.ChangeEvent<HTMLElement>) => setVoiceLanguage(e.target.value)}
                >
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="en-GB">English (UK)</MenuItem>
                  <MenuItem value="es-ES">Spanish</MenuItem>
                  <MenuItem value="fr-FR">French</MenuItem>
                  <MenuItem value="de-DE">German</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Speaking Speed
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <SpeedIcon fontSize="small" color="action" />
                </Grid>
                <Grid item xs>
                  <Slider
                    value={voiceSpeed}
                    onChange={(_, newValue) => setVoiceSpeed(newValue as number)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1.0, label: '1.0x' },
                      { value: 1.5, label: '1.5x' },
                      { value: 2.0, label: '2.0x' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice || !voiceText.trim()}
                startIcon={isGeneratingVoice ? <CircularProgress size={20} /> : <RecordVoiceOverIcon />}
              >
                {isGeneratingVoice ? 'Generating...' : 'Generate Voiceover'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Generated Voiceovers
            </Typography>
            
            {isGeneratingVoice && (
              <Box sx={{ width: '100%', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Converting text to speech...
                </Typography>
                <LinearProgress />
              </Box>
            )}
            
            <Stack spacing={2}>
              {generatedVoices.map((voice) => (
                <Card key={voice.id} variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="subtitle1" gutterBottom>
                          {voice.text.length > 100 ? voice.text.substring(0, 100) + '...' : voice.text}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {voice.text}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <Box sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Chip size="small" icon={<PersonIcon />} label={voice.voice} />
                              <Chip size="small" icon={<LanguageIcon />} label={voice.language} variant="outlined" />
                            </Stack>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Duration: {voice.duration} • Created: {new Date(voice.dateCreated).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handlePlayPause(voice.id)}
                            >
                              {playingVoiceId === voice.id ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            
                            <Box>
                              <IconButton
                                size="small"
                                color={voice.favorite ? 'error' : 'default'}
                                onClick={() => handleToggleVoiceFavorite(voice.id)}
                              >
                                {voice.favorite ? <StarIcon /> : <StarBorderIcon />}
                              </IconButton>
                              <IconButton size="small">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="primary">
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            
            {generatedVoices.length === 0 && !isGeneratingVoice && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MicIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No voiceovers generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter text and configure voice settings to create AI-generated voiceovers
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VoiceGenerationTab;
