import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

export default function DebugPage() {
  const envVars = {
    'NEXT_PUBLIC_DEMO_MODE': process.env.NEXT_PUBLIC_DEMO_MODE,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    'NODE_ENV': process.env.NODE_ENV,
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Debug Information
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Environment Variables
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(envVars).map(([key, value]) => (
            <Grid size={{ xs: 12 }} key={key}>
              <Typography>
                <strong>{key}:</strong> {value || 'NOT SET'}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current URL & Timestamp
        </Typography>
        <Typography>URL: {typeof window !== 'undefined' ? window.location.href : 'Server Side'}</Typography>
        <Typography>Build Time: {new Date().toISOString()}</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Expected Behavior
        </Typography>
        <Typography>
          • NEXT_PUBLIC_DEMO_MODE should be "false"<br/>
          • Supabase variables should be "SET"<br/>
          • If demo mode is "true", authentication will be disabled
        </Typography>
      </Paper>
    </Box>
  );
}
