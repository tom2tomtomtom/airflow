import React, { useState } from 'react';
import Image from 'next/image';
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
// import { AIImageGenerator } from '@/components/AIImageGenerator';
import AssetUploadModal from '@/components/AssetUploadModal';
import DashboardLayout from '@/components/DashboardLayout';
import ClientSelector from '@/components/ClientSelector';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';
import { useAssets } from '@/hooks/useData';
import { useClient } from '@/contexts/ClientContext';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const { activeClient } = useClient();
  const [tabValue, setTabValue] = useState(router.query.tab === 'ai' ? 1 : 0);
  const [showAIGenerator, setShowAIGenerator] = useState(router.query.tab === 'ai');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { data: assets, isLoading, error, refetch } = useAssets(activeClient?.id);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      setShowAIGenerator(true);
    }
  };

  const speedDialActions = [
    {
      icon: <Upload />, 
      name: 'Upload Files', 
      action: () => setShowUploadModal(true)
    },
    {
      icon: <AutoAwesome />, 
      name: 'AI Image (DALL-E 3)', 
      action: () => { 
        setShowAIGenerator(true); 
        setTabValue(1); 
      }
    },
    {
      icon: <VideoCall />, 
      name: 'AI Video (Coming Soon)', 
      action: () => { 
        alert('Sora video generation will be available when OpenAI releases the API'); 
      }
    },
    {
      icon: <MicNone />, 
      name: 'AI Voice (ElevenLabs)', 
      action: () => { 
        if (process.env.NODE_ENV === 'development') {
          console.log('Open voice generator');
        }
      }
    },
  ];

  const _handleImageGenerated = (_newAsset: any) => {
    refetch();
  };

  const handleUploadComplete = () => {
    refetch();
  };

  if (!activeClient) {
    return (
      <DashboardLayout>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to manage assets
          </Typography>
          <ClientSelector variant="button" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>Asset Library</Typography>
          <ClientSelector variant="chip" />
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Assets" />
            <Tab label="AI Generated" />
            <Tab label="Uploaded" />
            <Tab label="Templates" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {isLoading && (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <LoadingSkeleton variant="card" />
                </Grid>
              ))}
            </Grid>
          )}

          {error && <ErrorMessage error={error} onRetry={refetch} />}

          {!isLoading && !error && (
            <Grid container spacing={3}>
              {assets?.map((asset: any) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                  <Box 
                    sx={{ 
                      height: 200, 
                      bgcolor: 'grey.200', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    {asset.type === 'image' && asset.url ? (
                      <Image src={asset.url} alt={asset.name} width={500} height={300} />
                    ) : (
                      <Typography>{asset.name}</Typography>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }} noWrap>
                    {asset.name}
                  </Typography>
                </Grid>
              ))}
              {(!assets || assets.length === 0) && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={5}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No assets yet
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AutoAwesome />} 
                      onClick={() => { setShowAIGenerator(true); setTabValue(1); }}
                      sx={{ mt: 2 }}
                    >
                      Generate with AI
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {showAIGenerator ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                AI Image Generator temporarily disabled
              </Typography>
            </Box>
          ) : (
            <Box textAlign="center" py={5}>
              <AutoAwesome sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No AI-generated assets yet
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AutoAwesome />} 
                onClick={() => setShowAIGenerator(true)} 
                sx={{ mt: 2 }}
              >
                Generate with AI
              </Button>
            </Box>
          )}
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {assets?.filter((asset: any) => asset.tags?.includes('ai-generated')).map((asset: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Box 
                  component="img" 
                  src={asset.url} 
                  alt={asset.name} 
                  sx={{ 
                    width: '100%', 
                    height: 200, 
                    objectFit: 'cover', 
                    borderRadius: 2, 
                    cursor: 'pointer', 
                    '&:hover': { opacity: 0.8 } 
                  }} 
                />
                <Typography variant="caption" noWrap>{asset.name}</Typography>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {assets?.filter((asset: any) => asset.tags?.includes('uploaded')).map((asset: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Box 
                  sx={{ 
                    height: 200, 
                    bgcolor: 'grey.200', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {asset.type === 'image' && asset.url ? (
                    <Image src={asset.url} alt={asset.name} width={500} height={300} />
                  ) : (
                    <Typography>{asset.name}</Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }} noWrap>
                  {asset.name}
                </Typography>
              </Grid>
            ))}
            {(!assets || assets.filter((a: any) => a.tags?.includes('uploaded')).length === 0) && (
              <Grid item xs={12}>
                <Box textAlign="center" py={5}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No uploaded assets yet
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Upload />} 
                    onClick={() => setShowUploadModal(true)}
                    sx={{ mt: 2 }}
                  >
                    Upload Files
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography>Templates view - Coming soon</Typography>
        </TabPanel>

        <SpeedDial 
          ariaLabel="Add asset" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }} 
          icon={<SpeedDialIcon openIcon={<AddIcon />} />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction 
              key={action.name} 
              icon={action.icon} 
              tooltipTitle={action.name} 
              onClick={action.action} 
            />
          ))}
        </SpeedDial>

        <AssetUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      </Box>
    </DashboardLayout>
  );
}
