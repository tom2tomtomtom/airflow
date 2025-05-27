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

interface PasswordResetEmailProps {
  resetUrl: string;
  expiresIn: string;
}

export const PasswordResetEmail = ({
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) => {
  const previewText = 'Reset your AIrWAVE password';

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
          
          <Heading style={h1}>Password Reset Request</Heading>
          
          <Text style={text}>
            We received a request to reset your password for your AIrWAVE account.
          </Text>
          
          <Text style={text}>
            Click the button below to create a new password:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          
          <Section style={infoSection}>
            <Text style={infoText}>
              This link will expire in <strong>{expiresIn}</strong>
            </Text>
          </Section>
          
          <Text style={text}>
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
          </Text>
          
          <Hr style={hr} />
          
          <Section style={securitySection}>
            <Heading style={h2}>Security Tips:</Heading>
            <ul style={list}>
              <li style={listItem}>Never share your password with anyone</li>
              <li style={listItem}>Use a unique password for AIrWAVE</li>
              <li style={listItem}>Consider using a password manager</li>
              <li style={listItem}>Enable two-factor authentication when available</li>
            </ul>
          </Section>
          
          <Text style={footer}>
            If you're having trouble with the button above, copy and paste this URL into your browser:
          </Text>
          <Text style={footerLink}>
            {resetUrl}
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            This is an automated message from AIrWAVE. Please do not reply to this email.
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

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px',
  padding: '0 20px',
};

const buttonContainer = {
  padding: '27px 20px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 40px',
};

const infoSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '20px',
  padding: '16px',
  textAlign: 'center' as const,
};

const infoText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
};

const securitySection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '20px',
  padding: '20px',
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
  margin: '0 0 10px',
  padding: '0 20px',
};

const footerLink = {
  color: '#8898aa',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '0',
  padding: '0 20px',
  wordBreak: 'break-all' as const,
};

export default PasswordResetEmail;
