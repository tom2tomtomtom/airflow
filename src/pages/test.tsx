import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Icon,
  Stack,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Home
} from '@mui/icons-material';

const TestPage: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h2" gutterBottom>
        Material-UI Test Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page tests Material-UI components and icons rendering
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Icon Tests
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="body2">Email Icon:</Typography>
            <EmailIcon />
          </Box>
          <Box>
            <Typography variant="body2">Lock Icon:</Typography>
            <LockIcon />
          </Box>
          <Box>
            <Typography variant="body2">Visibility Icon:</Typography>
            <Visibility />
          </Box>
          <Box>
            <Typography variant="body2">Home Icon:</Typography>
            <Home />
          </Box>
        </Stack>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Icon Component (using font)
        </Typography>
        <Stack direction="row" spacing={2}>
          <Icon>home</Icon>
          <Icon>settings</Icon>
          <Icon>person</Icon>
          <Icon>email</Icon>
          <Icon>lock</Icon>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Button Tests
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="contained" startIcon={<EmailIcon />}>
            With Icon
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          TextField with Icons
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            type="password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <VisibilityOff />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Theme Colors Test
        </Typography>
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 1
        }}>
          Gradient Background Test
        </Box>
      </Paper>
    </Box>
  );
};

export default TestPage;
