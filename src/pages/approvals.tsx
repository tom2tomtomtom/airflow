import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
  Stack,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as RequestChangesIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Notifications as NotificationIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import ApprovalWorkflow from '@/components/ApprovalWorkflow';
import { useClient } from '@/contexts/ClientContext';

interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  changes_requested: number;
  overdue: number;
}

const ApprovalsPage: React.FC = () => {
  const { activeClient } = useClient();
  const [tabValue, setTabValue] = useState('overview');

  // Mock stats - in real implementation, these would come from the API
  const stats: ApprovalStats = {
    total: 24,
    pending: 8,
    approved: 12,
    rejected: 2,
    changes_requested: 2,
    overdue: 3,
  };

  if (!activeClient) {
    return (
      <DashboardLayout title="Approvals">
        <Box textAlign="center" py={8}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to view approvals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approval workflows help streamline content review and publishing
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Approvals | AIrWAVE</title>
      </Head>
      <DashboardLayout title="Approvals">
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Approval Workflow
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage content approvals for {activeClient.name}
            </Typography>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Approvals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {stats.changes_requested}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Changes Requested
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {stats.overdue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Alert for overdue items */}
          {stats.overdue > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>{stats.overdue} approval(s) are overdue.</strong> Consider prioritizing these to avoid delays in your content pipeline.
              </Typography>
            </Alert>
          )}

          {/* Quick Actions */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', py: 2 }}>
                <CardContent>
                  <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Quick Approve
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Bulk approve multiple items at once
                  </Typography>
                  <Button variant="outlined" startIcon={<ApproveIcon />}>
                    Bulk Approve
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', py: 2 }}>
                <CardContent>
                  <GroupIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Team Review
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Assign approvals to team members
                  </Typography>
                  <Button variant="outlined" startIcon={<GroupIcon />}>
                    Assign Reviews
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', py: 2 }}>
                <CardContent>
                  <NotificationIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure approval notifications
                  </Typography>
                  <Button variant="outlined" startIcon={<NotificationIcon />}>
                    Setup Alerts
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Overview" value="overview" />
              <Tab label="My Reviews" value="my-reviews" />
              <Tab label="Team Reviews" value="team-reviews" />
              <Tab label="Settings" value="settings" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 'overview' && (
                <ApprovalWorkflow
                  maxHeight={600}
                  showHeader={false}
                  clientId={activeClient.id}
                  showActions={true}
                />
              )}

              {tabValue === 'my-reviews' && (
                <ApprovalWorkflow
                  maxHeight={600}
                  showHeader={false}
                  clientId={activeClient.id}
                  showActions={true}
                />
              )}

              {tabValue === 'team-reviews' && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Team Reviews
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage approvals assigned to your team members
                  </Typography>
                </Box>
              )}

              {tabValue === 'settings' && (
                <Box sx={{ maxWidth: 600 }}>
                  <Typography variant="h6" gutterBottom>
                    Approval Workflow Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure how approvals work for your team and projects.
                  </Typography>

                  <Stack spacing={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Default Approval Types
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Set which approval types are required for different content types.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label="Content Review" size="small" />
                          <Chip label="Legal Review" size="small" />
                          <Chip label="Brand Review" size="small" />
                          <Chip label="Final Approval" size="small" />
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Notification Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Configure when and how you receive approval notifications.
                        </Typography>
                        <Button variant="outlined">
                          Manage Notifications
                        </Button>
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Team Permissions
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Set who can approve different types of content.
                        </Typography>
                        <Button variant="outlined">
                          Manage Permissions
                        </Button>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default ApprovalsPage;