import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  LinkedIn,
  MusicNote as TikTok,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const platformOptions = [
  { value: 'facebook', label: 'Facebook', icon: <Facebook sx={{ color: '#1877F2' }} />, color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: <Instagram sx={{ color: '#E4405F' }} />, color: '#E4405F' },
  { value: 'twitter', label: 'Twitter/X', icon: <Twitter sx={{ color: '#1DA1F2' }} />, color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', icon: <LinkedIn sx={{ color: '#0A66C2' }} />, color: '#0A66C2' },
  { value: 'youtube', label: 'YouTube', icon: <YouTube sx={{ color: '#FF0000' }} />, color: '#FF0000' },
  { value: 'tiktok', label: 'TikTok', icon: <TikTok sx={{ color: '#000' }} />, color: '#000' },
];

interface PlatformSelectionProps {
  campaignData: any;
  setCampaignData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const PlatformSelection: React.FC<PlatformSelectionProps> = ({
  campaignData,
  setCampaignData,
  onNext,
  onBack,
}) => {
  const handlePlatformChange = (platform: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const platforms = event.target.checked
      ? [...campaignData.platforms, platform]
      : campaignData.platforms.filter((p: string) => p !== platform);
    
    setCampaignData({
      ...campaignData,
      platforms,
    });
  };

  const isValid = campaignData.platforms && campaignData.platforms.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Platforms
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose which social media platforms this campaign will target.
      </Typography>

      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          Social Media Platforms
        </FormLabel>
        <FormGroup>
          <Grid container spacing={2}>
            {platformOptions.map((platform) => (
              <Grid item xs={12} sm={6} md={4} key={platform.value}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    border: campaignData.platforms?.includes(platform.value) ? 
                      `2px solid ${platform.color}` : '1px solid #e0e0e0',
                    '&:hover': {
                      borderColor: platform.color,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={campaignData.platforms?.includes(platform.value) || false}
                          onChange={handlePlatformChange(platform.value)}
                          sx={{ display: 'none' }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {platform.icon}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {platform.label}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                      onClick={(e) => {
                        const checkbox = e.currentTarget.querySelector('input[type="checkbox"]') as HTMLInputElement;
                        if (checkbox) {
                          checkbox.click();
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </FormControl>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isValid}
          endIcon={<ArrowForwardIcon />}
        >
          Next: Schedule
        </Button>
      </Box>
    </Box>
  );
};

export default PlatformSelection;