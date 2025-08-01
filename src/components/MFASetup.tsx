import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider} from '@mui/material';
import {
  Security as SecurityIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ContentCopy as CopyIcon} from '@mui/icons-material';

interface MFAStatus {
  isConfigured: boolean;
  isEnabled: boolean;
  isRequired: boolean;
  backupCodesCount: number;
  lastUsedAt?: string;
}

interface MFASetupData {
  qrCodeUrl: string;
  backupCodes: string[];
  secret?: string;
}

export const MFASetup: React.FC = () => {
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');

  // Load MFA status on component mount
  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const response = await fetch('/api/auth/mfa/status');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error || 'Failed to load MFA status');
      }
    } catch (err: any) {
      setError('Network error while loading MFA status');
    } finally {
      setLoading(false);
    }
  };

  const startMFASetup = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST'});
      const data = await response.json();

      if (data.success) {
        setSetupData(data.data);
        setShowSetupDialog(true);
        setSetupStep('qr');
      } else {
        setError(data.error || 'Failed to setup MFA');
      }
    } catch (err: any) {
      setError('Network error while setting up MFA');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
      
      },
        body: JSON.stringify({ token: verificationCode })});
      const data = await response.json();

      if (data.success) {
        setSuccess('MFA has been successfully enabled!');
        setSetupStep('backup');
        setVerificationCode('');
        // Reload status to reflect changes
        await loadMFAStatus();
      } else {
        setError(data.error || 'Failed to verify MFA');
      }
    } catch (err: any) {
      setError('Network error while verifying MFA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    });
  };

  const handleSetupComplete = () => {
    setShowSetupDialog(false);
    setSetupData(null);
    setVerificationCode('');
    setSetupStep('qr');
    setShowBackupCodes(false);
  };

  if (loading && !status) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Multi-Factor Authentication
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current MFA Status
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    {status?.isEnabled ? <CheckCircleIcon color="success" /> : <WarningIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary="MFA Status"
                    secondary={
                      <>
       <Chip
                          label={status?.isEnabled ? 'Enabled' : 'Disabled'}
                          color={status?.isEnabled ? 'success' : 'warning'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {status?.isRequired && (
                          <Chip label="Required" color="error" size="small" />
                        )}
                      </>
                    }
                  />
                </ListItem>

                {status?.isEnabled && (
                  <>
       <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <KeyIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Backup Codes"
                        secondary={`${status.backupCodesCount} unused backup codes available`}
                      />
                      <Button
                        size="small"
                        onClick={() => setShowBackupCodes(true)}
                        disabled={status.backupCodesCount === 0}
                      >
                        View Codes
                      </Button>
                    </ListItem>

                    {status.lastUsedAt && (
                      <>
       <Divider variant="inset" component="li" />
                        <ListItem>
                          <ListItemText
                            primary="Last Used"
                            secondary={new Date(status.lastUsedAt).toLocaleDateString()}
                          />
                        </ListItem>
                      </>
                    )}
                  </>
                )}
              </List>

              <Box mt={2}>
                {!status?.isEnabled ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={startMFASetup}
                    disabled={loading}
                    startIcon={<SecurityIcon />}
                  >
                    {loading ? 'Setting up...' : 'Setup MFA'}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled // TODO: Implement disable MFA
                  >
                    Disable MFA
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About MFA
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Multi-Factor Authentication adds an extra layer of security to your account by requiring a verification code from your phone in addition to your password.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We recommend using apps like Google Authenticator, Authy, or 1Password for generating verification codes.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MFA Setup Dialog */}
      <Dialog open={showSetupDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Setup Multi-Factor Authentication
        </DialogTitle>
        <DialogContent>
          {setupStep === 'qr' && (
            <Box>
              <Typography paragraph>
                1. Install an authenticator app on your phone (Google Authenticator, Authy, etc.)
              </Typography>
              <Typography paragraph>
                2. Scan this QR code with your authenticator app:
              </Typography>
              
              {setupData?.qrCodeUrl && (
                <Box display="flex" justifyContent="center" mb={2}>
                  <img src={setupData.qrCodeUrl} alt="MFA QR Code" style={{ maxWidth: 256 }} />
                </Box>
              )}

              {process.env.NODE_ENV === 'development' && setupData?.secret && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Development Mode:</strong> Secret key: {setupData.secret}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => copyToClipboard(setupData.secret!)}
                    startIcon={<CopyIcon />}
                  >
                    Copy Secret
                  </Button>
                </Alert>
              )}

              <Typography paragraph>
                3. Enter the 6-digit code from your app to verify the setup:
              </Typography>

              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {setupStep === 'backup' && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>Important:</strong> Save these backup codes in a secure location. 
                  You can use them to access your account if you lose your phone.
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>
                Backup Codes
              </Typography>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                {setupData?.backupCodes.map((code, index) => (
                  <Grid size={{ xs: 6 }} key={index}>
                    <Box
                      p={1}
                      border={1}
                      borderColor="grey.300"
                      borderRadius={1}
                      textAlign="center"
                      fontFamily="monospace"
                    >
                      {code}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => copyToClipboard(setupData?.backupCodes.join('\n') || '')}
                startIcon={<CopyIcon />}
                sx={{ mb: 2 }}
              >
                Copy All Backup Codes
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSetupComplete}>
            {setupStep === 'backup' ? 'Complete Setup' : 'Cancel'}
          </Button>
          {setupStep === 'qr' && (
            <Button
              variant="contained"
              onClick={verifyMFA}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};