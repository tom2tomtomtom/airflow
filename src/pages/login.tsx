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
      
      // Redirect to intended page after successful login
      const from = router.query.from as string;
      const redirectTo = from && from !== '/login' ? from : '/dashboard';
      
      // Use window.location to avoid Next.js router issues with middleware
      window.location.href = redirectTo;
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
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
          backgroundColor: '#030712', // Carbon Black primary background
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
                background: 'linear-gradient(45deg, #FBBF24, #F59E0B)',
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
              onChange={(e: React.ChangeEvent<HTMLElement>) => setEmail(e.target.value)}
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
              onChange={(e: React.ChangeEvent<HTMLElement>) => setPassword(e.target.value)}
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
                backgroundColor: '#FBBF24', // Carbon Black amber
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#F59E0B',
                  boxShadow: '0 0 0 2px rgba(251, 191, 36, 0.3)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>


          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                sx={{ color: '#FBBF24', textDecoration: 'none' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>

        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;
