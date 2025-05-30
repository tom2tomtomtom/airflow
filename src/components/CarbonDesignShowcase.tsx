import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Stack,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Settings,
  Favorite,
  FavoriteBorder,
  Visibility,
  Share,
  Download,
  Star,
} from '@mui/icons-material';
import { carbonColors } from '@/styles/theme';

const CarbonDesignShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [switchState, setSwitchState] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: carbonColors.background.primary, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" className="carbon-text-gradient" gutterBottom>
          Carbon Black Design System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Premium minimalist dark UI for AIrWAVE - Technical precision meets amber elegance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Color Palette */}
        <Grid item xs={12} md={6}>
          <Card className="carbon-elevation-2">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Color Palette
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Amber Accent
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        backgroundColor: carbonColors.amber.main,
                        borderRadius: 1,
                        border: `1px solid ${carbonColors.amber.border}`,
                      }}
                    />
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        backgroundColor: carbonColors.amber.hover,
                        borderRadius: 1,
                        border: `1px solid ${carbonColors.amber.border}`,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Primary: {carbonColors.amber.main} • Hover: {carbonColors.amber.hover}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Background Hierarchy
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        backgroundColor: carbonColors.background.primary,
                        borderRadius: 1,
                        border: `1px solid ${carbonColors.amber.border}`,
                      }}
                    />
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        backgroundColor: carbonColors.background.secondary,
                        borderRadius: 1,
                        border: `1px solid ${carbonColors.amber.border}`,
                      }}
                    />
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        backgroundColor: carbonColors.background.card,
                        borderRadius: 1,
                        border: `1px solid ${carbonColors.amber.border}`,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Primary • Secondary • Card
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Interactive Elements */}
        <Grid item xs={12} md={6}>
          <Card className="carbon-elevation-2">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Interactive Elements
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Buttons
                  </Typography>
                  <Box className="carbon-cluster">
                    <Button variant="contained">Primary Action</Button>
                    <Button variant="outlined">Secondary</Button>
                    <Button variant="text">Text Button</Button>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Icon Buttons
                  </Typography>
                  <Box className="carbon-cluster">
                    <IconButton className="carbon-interactive">
                      <PlayArrow />
                    </IconButton>
                    <IconButton className="carbon-interactive">
                      <Pause />
                    </IconButton>
                    <IconButton className="carbon-interactive">
                      <Settings />
                    </IconButton>
                    <IconButton 
                      className="carbon-interactive"
                      onClick={() => setLiked(!liked)}
                    >
                      {liked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Form Controls
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      placeholder="Enter campaign name..."
                      size="small"
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={switchState}
                          onChange={(e) => setSwitchState(e.target.checked)}
                        />
                      }
                      label="Enable real-time updates"
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Status and Feedback */}
        <Grid item xs={12} md={6}>
          <Card className="carbon-elevation-2">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Status & Feedback
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Status Chips
                  </Typography>
                  <Box className="carbon-cluster">
                    <Chip 
                      label="Active" 
                      className="carbon-status-success"
                      size="small"
                    />
                    <Chip 
                      label="Processing" 
                      className="carbon-status-warning"
                      size="small"
                    />
                    <Chip 
                      label="Failed" 
                      className="carbon-status-error"
                      size="small"
                    />
                    <Chip 
                      label="Premium" 
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Loading States
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleLoadingDemo}
                    disabled={loading}
                    className={loading ? 'carbon-pulse-loading' : ''}
                  >
                    {loading ? 'Processing...' : 'Start Process'}
                  </Button>
                  {loading && (
                    <LinearProgress 
                      sx={{ 
                        mt: 1,
                        backgroundColor: carbonColors.background.secondary,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: carbonColors.amber.main,
                        }
                      }} 
                    />
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Elevation and Effects */}
        <Grid item xs={12} md={6}>
          <Card className="carbon-elevation-2">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Elevation & Effects
              </Typography>
              
              <Stack spacing={2}>
                <Paper className="carbon-elevation-1 carbon-interactive" sx={{ p: 2 }}>
                  <Typography variant="body2">Elevation 1 - Hover for glow effect</Typography>
                </Paper>
                <Paper className="carbon-elevation-2" sx={{ p: 2 }}>
                  <Typography variant="body2">Elevation 2 - Subtle amber border</Typography>
                </Paper>
                <Paper className="carbon-elevation-3" sx={{ p: 2 }}>
                  <Typography variant="body2">Elevation 3 - Strong amber glow</Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Typography Showcase */}
        <Grid item xs={12}>
          <Card className="carbon-elevation-2">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Typography System
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="h1">H1 Heading</Typography>
                    <Typography variant="h2">H2 Heading</Typography>
                    <Typography variant="h3">H3 Heading</Typography>
                    <Typography variant="h4">H4 Heading</Typography>
                    <Typography variant="h5">H5 Heading</Typography>
                    <Typography variant="h6">H6 Heading</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="body1">
                      Body 1 text with primary color for high readability and clean appearance.
                      Perfect for main content areas and descriptions.
                    </Typography>
                    <Typography variant="body2">
                      Body 2 text with secondary color for supporting information and captions.
                      Provides excellent hierarchy and visual organization.
                    </Typography>
                    <Box className="carbon-code">
                      <Typography variant="body2" component="code">
                        # Technical code block with monospace font
                        campaign.render(template="premium", quality="4k")
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Panel */}
        <Grid item xs={12}>
          <Card className="carbon-elevation-2">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Action Panel
              </Typography>
              
              <Box 
                sx={{ 
                  p: 3, 
                  backgroundColor: carbonColors.background.secondary,
                  borderRadius: 1,
                  border: `1px solid ${carbonColors.amber.border}`,
                }}
              >
                <Box className="carbon-cluster" sx={{ justifyContent: 'space-between' }}>
                  <Box className="carbon-cluster">
                    <IconButton className="carbon-interactive">
                      <Visibility />
                    </IconButton>
                    <IconButton className="carbon-interactive">
                      <Share />
                    </IconButton>
                    <IconButton className="carbon-interactive">
                      <Download />
                    </IconButton>
                    <IconButton className="carbon-interactive">
                      <Star />
                    </IconButton>
                  </Box>
                  
                  <Box className="carbon-cluster">
                    <Button variant="outlined" size="small">
                      Save Draft
                    </Button>
                    <Button variant="contained" size="small">
                      Publish Campaign
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <hr className="carbon-separator" />
        <Typography variant="body2" color="text.secondary">
          Carbon Black Design System • Ultra-minimal • Precision-focused • Technical Excellence
        </Typography>
      </Box>
    </Box>
  );
};

export default CarbonDesignShowcase;