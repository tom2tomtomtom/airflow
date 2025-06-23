import React from 'react';
import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Dynamically import the AssetUploadModal with loading state
const AssetUploadModal = dynamic(() => import('./AssetUploadModal'), {
  loading: () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  ),
  ssr: false, // Don't render on server-side for modals
});

type AssetUploadModalProps = ComponentProps<typeof AssetUploadModal>;

export default function LazyAssetUploadModal(props: AssetUploadModalProps) {
  return <AssetUploadModal {...props} />;
}
