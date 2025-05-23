import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to assets page as default dashboard view
    router.push('/assets');
  }, [router]);

  return (
    <DashboardLayout>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" color="textSecondary">
          Loading AIrWAVE Dashboard...
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default HomePage;
