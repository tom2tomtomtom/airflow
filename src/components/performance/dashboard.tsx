// Performance dashboard component
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const PerformanceDashboard: React.FC = () => {
  const metrics = {
    fcp: '1.2s',
    lcp: '2.8s',
    tti: '3.2s',
    cls: '0.08',
    performanceScore: 85,
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <Card>
          <CardContent>
            <Typography variant="h6">First Contentful Paint</Typography>
            <Typography variant="h4" color="primary">
              {metrics.fcp}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Largest Contentful Paint</Typography>
            <Typography variant="h4" color="primary">
              {metrics.lcp}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Time to Interactive</Typography>
            <Typography variant="h4" color="primary">
              {metrics.tti}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Performance Score</Typography>
            <Typography variant="h4" color="primary">
              {metrics.performanceScore}/100
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
