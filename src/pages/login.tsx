import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      // Use the AuthContext login function
      await login(email, password);
      
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    
    // Set demo user data
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: 'demo@airwave.app',
      name: 'Demo User',
      token: 'demo-token-' + Math.random().toString(36).substring(7)
    };
    
    // Store in localStorage to persist auth state
    localStorage.setItem('airwave_user', JSON.stringify(demoUser));
    
    // Also set a demo client
    const demoClient = {
      id: 'demo-client-' + Date.now(),
      name: 'Demo Company',
      description: 'Demo client for testing AIrWAVE features',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      logoUrl: ''
    };
    
    localStorage.setItem('airwave_active_client', JSON.stringify(demoClient));
    localStorage.setItem('airwave_clients', JSON.stringify([demoClient]));
    
    setTimeout(() => {
      setLoading(false);
      // Force a page reload to trigger auth context update
      window.location.href = '/';
    }, 500);
  };

  return (
    <>
      <Head>
        <title>Login | AIrWAVE</title>
      </Head>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 3,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            maxWidth: 400,
            width: '100%',
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              AIrWAVE
            </Typography>
            <Typography variant="h6" color="text.secondary">
              AI-Powered Digital Asset Production
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} data-testid="error-message">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} data-testid="login-form">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              data-testid="email-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
              data-testid="password-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              data-testid="sign-in-button"
              sx={{
                mb: 2,
                height: 48,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleDemoLogin}
            disabled={loading}
            data-testid="demo-login-button"
            sx={{
              mb: 3,
              height: 48,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            Continue with Demo
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Navigate to signup page
                }}
                sx={{ color: 'primary.main', textDecoration: 'none' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              <strong>Demo Note:</strong> Click &quot;Continue with Demo&quot; to explore the application with sample data.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;
