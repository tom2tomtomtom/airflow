import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Tabs,
  Tab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Upload,
  AutoAwesome,
  VideoCall,
  MicNone,
  Add as AddIcon,
} from '@mui/icons-material';
import { AIImageGenerator } from '@/components/AIImageGenerator';
import DashboardLayout from '@/components/DashboardLayout';
// import AssetCard from '@/components/AssetCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnhancedAssetsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const clientId = 'b962c2f4-b7e4-429d-bfe6-11f35a252223'; // Get from context/router
  const [assets, setAssets] = useState<any[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const speedDialActions = [
    {
      icon: <Upload />, name: 'Upload Files', action: () => { console.log('Open upload modal'); }
    },
    {
      icon: <AutoAwesome />, name: 'AI Image (DALL-E 3)', action: () => { setShowAIGenerator(true); setTabValue(1); }
    },
    {
      icon: <VideoCall />, name: 'AI Video (Coming Soon)', action: () => { alert('Sora video generation will be available when OpenAI releases the API'); }
    },
    {
      icon: <MicNone />, name: 'AI Voice (ElevenLabs)', action: () => { console.log('Open voice generator'); }
    },
  ];

  const handleImageGenerated = (newAsset: any) => {
    setAssets([newAsset, ...assets]);
  };

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" gutterBottom>Asset Library</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Assets" />
            <Tab label="AI Generated" />
            <Tab label="Uploaded" />
            <Tab label="Templates" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {assets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                {/* <AssetCard asset={asset} /> */}
                <Box sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                  {asset.name}
                </Box>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {showAIGenerator ? (
            <AIImageGenerator clientId={clientId} onImageGenerated={handleImageGenerated} />
          ) : (
            <Box textAlign="center" py={5}>
              <AutoAwesome sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No AI-generated assets yet</Typography>
              <Button variant="contained" startIcon={<AutoAwesome />} onClick={() => setShowAIGenerator(true)} sx={{ mt: 2 }}>
                Generate with AI
              </Button>
            </Box>
          )}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {assets.filter((asset) => asset.tags?.includes('ai-generated')).map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Box component="img" src={asset.url} alt={asset.name} sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2, cursor: 'pointer', '&:hover': { opacity: 0.8, }, }} />
                <Typography variant="caption" noWrap>{asset.name}</Typography>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography>Uploaded assets view</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Typography>Templates view</Typography>
        </TabPanel>
        <SpeedDial ariaLabel="Add asset" sx={{ position: 'fixed', bottom: 16, right: 16 }} icon={<SpeedDialIcon openIcon={<AddIcon />} />}>
          {speedDialActions.map((action) => (
            <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.action} />
          ))}
        </SpeedDial>
      </Box>
    </DashboardLayout>
  );
}
