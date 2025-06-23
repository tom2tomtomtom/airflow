import React from 'react';
import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';

// Lazy load the heavy ImageGenerationTab component
const ImageGenerationTab = dynamic(() => import('./ImageGenerationTab') as any, {
  loading: () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  ),
  ssr: false, // Disable SSR for this component to improve initial load
});

export default ImageGenerationTab;
