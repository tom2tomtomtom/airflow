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

interface ClientApprovalEmailProps {
  clientName: string;
  campaignName: string;
  approvalUrl: string;
  submitterName: string;
  assetCount: number;
  message?: string;
}

export const ClientApprovalEmail = ({
  clientName,
  campaignName,
  approvalUrl,
  submitterName,
  assetCount,
  message,
}: ClientApprovalEmailProps) => {
  const previewText = `${submitterName} has submitted ${campaignName} for your review`;

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
          
          <Heading style={h1}>Review Required</Heading>
          
          <Text style={text}>
            Hi {clientName},
          </Text>
          
          <Text style={text}>
            {submitterName} has submitted <strong>{campaignName}</strong> for your review and approval.
          </Text>
          
          <Section style={statsSection}>
            <Text style={statsText}>
              <strong>{assetCount}</strong> assets ready for review
            </Text>
          </Section>
          
          {message && (
            <Section style={messageSection}>
              <Text style={messageLabel}>Message from {submitterName}:</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          )}
          
          <Section style={buttonContainer}>
            <Button style={button} href={approvalUrl}>
              Review Campaign
            </Button>
          </Section>
          
          <Text style={text}>
            This review link will expire in 7 days. If you have any questions, please contact {submitterName} directly.
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            This email was sent by AIrWAVE. If you believe this was sent in error, please ignore this email.
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
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px',
  padding: '0 20px',
};

const statsSection = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const statsText = {
  color: '#333',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0',
  textAlign: 'center' as const,
};

const messageSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
};

const messageLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const messageText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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

export default ClientApprovalEmail;
