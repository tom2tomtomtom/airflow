import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SystemAlertEmailProps {
  alertType: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp: string;
}

export const SystemAlertEmail = ({
  alertType,
  message,
  details,
  timestamp,
}: SystemAlertEmailProps) => {
  const alertConfig = {
    error: {
      emoji: '🚨',
      color: '#dc2626',
      bgColor: '#fee2e2',
      title: 'System Error',
    },
    warning: {
      emoji: '⚠️',
      color: '#d97706',
      bgColor: '#fef3c7',
      title: 'System Warning',
    },
    info: {
      emoji: 'ℹ️',
      color: '#2563eb',
      bgColor: '#dbeafe',
      title: 'System Information',
    },
  };

  const config = alertConfig[alertType];
  const previewText = `${config.emoji} ${config.title}: ${message.slice(0, 50)}...`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://airwave.app/logo.png"
              width="150"
              height="50"
              alt="AIrWAVE"
              style={logo}
            />
          </Section>
          
          <Section style={{
            ...alertSection,
            backgroundColor: config.bgColor,
            borderColor: config.color,
          }}>
            <Text style={alertEmoji}>{config.emoji}</Text>
            <Heading style={{ ...alertTitle, color: config.color }}>
              {config.title}
            </Heading>
          </Section>
          
          <Text style={messageText}>
            {message}
          </Text>
          
          {details && (
            <Section style={detailsSection}>
              <Heading style={h2}>Details:</Heading>
              <pre style={codeBlock}>{details}</pre>
            </Section>
          )}
          
          <Section style={metadataSection}>
            <Text style={metadataItem}>
              <strong>Time:</strong> {new Date(timestamp).toLocaleString()}
            </Text>
            <Text style={metadataItem}>
              <strong>Environment:</strong> {process.env.NODE_ENV || 'production'}
            </Text>
            <Text style={metadataItem}>
              <strong>Alert ID:</strong> {Math.random().toString(36).substring(7).toUpperCase()}
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={actionsSection}>
            <Heading style={h3}>Recommended Actions:</Heading>
            {alertType === 'error' && (
              <ul style={list}>
                <li style={listItem}>Check the error logs in Sentry</li>
                <li style={listItem}>Review recent deployments</li>
                <li style={listItem}>Monitor system health dashboard</li>
                <li style={listItem}>Contact on-call engineer if critical</li>
              </ul>
            )}
            {alertType === 'warning' && (
              <ul style={list}>
                <li style={listItem}>Monitor the situation</li>
                <li style={listItem}>Check resource utilization</li>
                <li style={listItem}>Review scaling policies</li>
                <li style={listItem}>Prepare mitigation plan</li>
              </ul>
            )}
            {alertType === 'info' && (
              <ul style={list}>
                <li style={listItem}>No immediate action required</li>
                <li style={listItem}>Review for awareness</li>
                <li style={listItem}>Update documentation if needed</li>
              </ul>
            )}
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            This is an automated alert from AIrWAVE monitoring system.
            <br />
            View the{' '}
            <Link href="https://app.airwave.com/admin/monitoring" style={link}>
              monitoring dashboard
            </Link>
            {' '}for more information.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,Courier,monospace',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  padding: '32px 20px',
};

const logo = {
  margin: '0 auto',
};

const alertSection = {
  margin: '0 20px 20px',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid',
  textAlign: 'center' as const,
};

const alertEmoji = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const alertTitle = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const messageText = {
  color: '#111827',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
  padding: '0 20px',
  fontWeight: '500',
};

const detailsSection = {
  margin: '20px',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const h3 = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const codeBlock = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
  padding: '16px',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
  fontFamily: 'Courier, monospace',
};

const metadataSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '20px',
  padding: '16px',
};

const metadataItem = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 8px',
};

const actionsSection = {
  margin: '20px',
};

const list = {
  margin: '0',
  padding: '0 0 0 20px',
};

const listItem = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const link = {
  color: '#5e6ad2',
  textDecoration: 'underline',
};

export default SystemAlertEmail;
