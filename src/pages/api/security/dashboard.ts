/**
 * Security Monitoring Dashboard API
 * Provides security metrics and alerts for monitoring
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { withRateLimit } from '@/middleware/withRateLimit';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import { securityLogger } from '@/lib/security/security-logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' }});
  }

  try {
    const { timeRange = 24 } = req.query;
    const timeRangeHours = parseInt(timeRange as string, 10) || 24;

    // Get security metrics
    const metrics = securityLogger.getMetrics(timeRangeHours);

    // Get recent alerts
    const alerts = securityLogger.getAlerts('OPEN');

    // Get recent high-severity events
    const recentEvents = securityLogger.getEvents({
      severity: 'HIGH',
      minutes: timeRangeHours * 60,
      limit: 50});

    const dashboard = {
      overview: {},
  timeRange: `${timeRangeHours} hours`,
        totalEvents: metrics.totalEvents,
        activeAlerts: metrics.activeAlerts,
        threatLevel: calculateThreatLevel(metrics),
        lastUpdate: new Date().toISOString() },
  metrics: {},
  eventsByType: metrics.eventsByType,
        eventsBySeverity: metrics.eventsBySeverity,
        topIPs: metrics.topIPs },
  alerts: alerts.slice(0, 10), // Most recent 10 alerts
      recentThreats: recentEvents.slice(0, 20), // Most recent 20 high-severity events
      healthScore: calculateSecurityHealthScore(metrics)};

    return res.status(200).json({
      success: true,
      data: dashboard,
      meta: { timestamp: new Date().toISOString() }});
  } catch (error) {
    console.error('Security dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate security dashboard' }});
  }
}

function calculateThreatLevel(metrics: any): string {
  const { eventsBySeverity } = metrics;
  const criticalCount = eventsBySeverity.CRITICAL || 0;
  const highCount = eventsBySeverity.HIGH || 0;
  const mediumCount = eventsBySeverity.MEDIUM || 0;

  if (criticalCount > 0) return 'CRITICAL';
  if (highCount > 5) return 'HIGH';
  if (highCount > 0 || mediumCount > 20) return 'MEDIUM';
  return 'LOW';
}

function calculateSecurityHealthScore(metrics: any): {
  score: number;
  grade: string;
  indicators: string[];
} {
  let score = 100;
  const indicators: string[] = [];

  const { eventsBySeverity, activeAlerts } = metrics;

  // Deduct points for security events
  const criticalCount = eventsBySeverity.CRITICAL || 0;
  const highCount = eventsBySeverity.HIGH || 0;
  const mediumCount = eventsBySeverity.MEDIUM || 0;

  score -= criticalCount * 20; // -20 per critical event
  score -= highCount * 10; // -10 per high event
  score -= mediumCount * 2; // -2 per medium event
  score -= activeAlerts * 5; // -5 per active alert

  if (criticalCount > 0) indicators.push(`${criticalCount} critical events`);
  if (highCount > 0) indicators.push(`${highCount} high-severity events`);
  if (activeAlerts > 0) indicators.push(`${activeAlerts} active alerts`);

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine grade
  let grade = 'F';
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 85) grade = 'B+';
  else if (score >= 80) grade = 'B';
  else if (score >= 75) grade = 'C+';
  else if (score >= 70) grade = 'C';
  else if (score >= 65) grade = 'D+';
  else if (score >= 60) grade = 'D';

  return { score, grade, indicators };
}

// Apply security middleware
export default withSecurityHeaders(withAuth(withRateLimit('api')(handler)));
