import {
  Body,
  Button,
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

interface RenderCompleteEmailProps {
  campaignName: string;
  renderCount: number;
  successCount: number;
  failedCount: number;
  downloadUrl: string;
  completedAt: string;
}

export const RenderCompleteEmail = ({
  campaignName,
  renderCount,
  successCount,
  failedCount,
  downloadUrl,
  completedAt,
}: RenderCompleteEmailProps) => {
  const previewText = `Your campaign ${campaignName} has finished rendering`;
  const successRate = Math.round((successCount / renderCount) * 100);

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
          
          <Heading style={h1}>Render Complete! 🎉</Heading>
          
          <Text style={text}>
            Your campaign <strong>{campaignName}</strong> has finished rendering.
          </Text>
          
          <Section style={statsSection}>
            <div style={statsGrid}>
              <div style={statBox}>
                <Text style={statNumber}>{renderCount}</Text>
                <Text style={statLabel}>Total Renders</Text>
              </div>
              <div style={statBox}>
                <Text style={statNumberSuccess}>{successCount}</Text>
                <Text style={statLabel}>Successful</Text>
              </div>
              {failedCount > 0 && (
                <div style={statBox}>
                  <Text style={statNumberError}>{failedCount}</Text>
                  <Text style={statLabel}>Failed</Text>
                </div>
              )}
            </div>
            
            <div style={progressBar}>
              <div style={{ ...progressFill, width: `${successRate}%` }} />
            </div>
            <Text style={progressText}>{successRate}% Success Rate</Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={downloadUrl}>
              Download Assets
            </Button>
          </Section>
          
          <Text style={text}>
            Completed at: {new Date(completedAt).toLocaleString()}
          </Text>
          
          {failedCount > 0 && (
            <Section style={warningSection}>
              <Text style={warningText}>
                ⚠️ {failedCount} render{failedCount > 1 ? 's' : ''} failed. Please check the dashboard for details.
              </Text>
            </Section>
          )}
          
          <Hr style={hr} />
          
          <Text style={footer}>
            You can always access your renders from the <Link href="https://app.airwave.com/campaigns" style={link}>campaigns dashboard</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px',
  padding: '0 20px',
};

const statsSection = {
  margin: '30px 20px',
};

const statsGrid = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '20px',
};

const statBox = {
  textAlign: 'center' as const,
  flex: 1,
};

const statNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#333',
  margin: '0',
};

const statNumberSuccess = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#10b981',
  margin: '0',
};

const statNumberError = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#ef4444',
  margin: '0',
};

const statLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0 0',
};

const progressBar = {
  backgroundColor: '#e5e7eb',
  borderRadius: '8px',
  height: '8px',
  margin: '20px 0 8px',
  overflow: 'hidden',
};

const progressFill = {
  backgroundColor: '#10b981',
  height: '100%',
  transition: 'width 0.3s ease',
};

const progressText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  textAlign: 'center' as const,
};

const buttonContainer = {
  padding: '27px 20px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5e6ad2',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 40px',
};

const warningSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '20px',
  padding: '16px',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
};

const link = {
  color: '#5e6ad2',
  textDecoration: 'underline',
};

export default RenderCompleteEmail;
