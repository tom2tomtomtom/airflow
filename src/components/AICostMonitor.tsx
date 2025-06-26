// src/components/AICostMonitor.tsx
// Real-time AI cost monitoring and budget alerts

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Speed,
} from '@mui/icons-material';

interface UsageStats {
  service: string;
  usage: {
    totalCost: number;
    totalTokens: number;
    callCount: number;
    byModel: Record<string, { cost: number; tokens: number; calls: number }>;
  };
  budget: number;
  percentUsed: number;
  daysRemaining: number;
  projectedTotal: number;
}

interface CostMonitorProps {
  userId?: string;
  showDetails?: boolean;
  refreshInterval?: number;
}

export const AICostMonitor: React.FC<CostMonitorProps> = ({
  userId,
  showDetails = false,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [stats, setStats] = useState<Record<string, UsageStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(showDetails);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/usage-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data = await response.json();
      setStats(data.services || {});
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsageStats();

    const interval = setInterval(fetchUsageStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchUsageStats, refreshInterval]);

  const getTotalUsage = () => {
    return Object.values(stats).reduce((total, service) => total + service.usage.totalCost, 0);
  };

  const getTotalBudget = () => {
    return Object.values(stats).reduce((total, service) => total + service.budget, 0);
  };

  const getOverallStatus = () => {
    const totalUsage = getTotalUsage();
    const totalBudget = getTotalBudget();
    const percentUsed = (totalUsage / totalBudget) * 100;

    if (percentUsed >= 100) return { color: 'error', icon: <Warning />, text: 'Over Budget' };
    if (percentUsed >= 80) return { color: 'warning', icon: <Warning />, text: 'High Usage' };
    return { color: 'success', icon: <CheckCircle />, text: 'On Track' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getUsageColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'error';
    if (percentUsed >= 80) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <AttachMoney color="primary" />
            <Typography variant="h6">AI Cost Monitor</Typography>
          </Box>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={fetchUsageStats}>
            <Speed />
          </IconButton>
        }
      >
        Failed to load cost data: {error}
      </Alert>
    );
  }

  const overallStatus = getOverallStatus();
  const totalUsage = getTotalUsage();
  const totalBudget = getTotalBudget();

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <AttachMoney color="primary" />
            <Typography variant="h6">AI Cost Monitor</Typography>
            <Chip
              icon={overallStatus.icon}
              label={overallStatus.text}
              color={overallStatus.color as any}
              size="small"
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Overall Usage */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight={500}>
              Total Monthly Usage
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(totalUsage)} / {formatCurrency(totalBudget)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((totalUsage / totalBudget) * 100, 100)}
            color={getUsageColor((totalUsage / totalBudget) * 100)}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {((totalUsage / totalBudget) * 100).toFixed(1)}% of monthly budget used
          </Typography>
        </Box>

        {/* Service Breakdown */}
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
        >
          {Object.entries(stats).map(([service, data]) => (
            <Paper key={service} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" textTransform="capitalize">
                  {service}
                </Typography>
                <Chip
                  label={`${data?.percentUsed?.toFixed(0)}%`}
                  size="small"
                  color={getUsageColor(data.percentUsed)}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(data.percentUsed, 100)}
                color={getUsageColor(data.percentUsed)}
                sx={{ mb: 1, height: 6, borderRadius: 1 }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(data?.usage?.totalCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(data.budget)}
                </Typography>
              </Box>
              {data.projectedTotal > data.budget && (
                <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                  <Typography variant="caption">
                    Projected: {formatCurrency(data.projectedTotal)}
                  </Typography>
                </Alert>
              )}
            </Paper>
          ))}
        </Box>

        {/* Detailed Breakdown */}
        <Collapse in={expanded}>
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Detailed Usage by Model
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell align="right">Calls</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(stats).map(([service, data]) =>
                    Object.entries(data?.usage?.byModel).map(([model, modelData]) => (
                      <TableRow key={`${service}-${model}`}>
                        <TableCell>{service}</TableCell>
                        <TableCell>{model}</TableCell>
                        <TableCell align="right">{modelData.calls.toLocaleString()}</TableCell>
                        <TableCell align="right">{modelData.tokens.toLocaleString()}</TableCell>
                        <TableCell align="right">{formatCurrency(modelData.cost)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AICostMonitor;
