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

interface WelcomeEmailProps {
  firstName: string;
  verificationUrl?: string;
}

export const WelcomeEmail = ({
  firstName,
  verificationUrl,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to AIrWAVE, ${firstName}!`;

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
          
          <Heading style={h1}>Welcome to AIrWAVE! 🚀</Heading>
          
          <Text style={text}>
            Hi {firstName},
          </Text>
          
          <Text style={text}>
            We're thrilled to have you join AIrWAVE, the platform that transforms weeks of ad creation into hours.
          </Text>
          
          <Section style={featuresSection}>
            <Heading style={h2}>Here's what you can do with AIrWAVE:</Heading>
            
            <div style={featureItem}>
              <Text style={featureIcon}>🎯</Text>
              <div>
                <Text style={featureTitle}>AI-Powered Strategy</Text>
                <Text style={featureDescription}>
                  Generate customer motivations and copy variations using advanced AI
                </Text>
              </div>
            </div>
            
            <div style={featureItem}>
              <Text style={featureIcon}>🎨</Text>
              <div>
                <Text style={featureTitle}>Campaign Matrix</Text>
                <Text style={featureDescription}>
                  Create hundreds of ad variations with our unique matrix system
                </Text>
              </div>
            </div>
            
            <div style={featureItem}>
              <Text style={featureIcon}>⚡</Text>
              <div>
                <Text style={featureTitle}>Automated Rendering</Text>
                <Text style={featureDescription}>
                  Generate professional videos across all platforms instantly
                </Text>
              </div>
            </div>
            
            <div style={featureItem}>
              <Text style={featureIcon}>✅</Text>
              <div>
                <Text style={featureTitle}>Client Approvals</Text>
                <Text style={featureDescription}>
                  Streamline feedback with our integrated approval system
                </Text>
              </div>
            </div>
          </Section>
          
          {verificationUrl && (
            <>
              <Section style={buttonContainer}>
                <Button style={button} href={verificationUrl}>
                  Verify Your Email
                </Button>
              </Section>
              
              <Text style={text}>
                Please verify your email address to access all features.
              </Text>
            </>
          )}
          
          <Section style={ctaSection}>
            <Heading style={h3}>Ready to get started?</Heading>
            <Text style={text}>
              Here are some quick actions to begin:
            </Text>
            
            <div style={quickLinks}>
              <Link href="https://app.airwave.com/clients/new" style={link}>
                → Create your first client
              </Link>
              <Link href="https://app.airwave.com/assets" style={link}>
                → Upload brand assets
              </Link>
              <Link href="https://app.airwave.com/campaigns/new" style={link}>
                → Start a new campaign
              </Link>
              <Link href="https://docs.airwave.com" style={link}>
                → Read the documentation
              </Link>
            </div>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Need help? Our team is here for you. Reply to this email or visit our{' '}
            <Link href="https://support.airwave.com" style={link}>
              support center
            </Link>
            .
          </Text>
          
          <Text style={footer}>
            Happy creating!<br />
            The AIrWAVE Team
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
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const h3 = {
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

const featuresSection = {
  padding: '20px',
  margin: '20px 0',
};

const featureItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '24px',
};

const featureIcon = {
  fontSize: '24px',
  marginRight: '16px',
  marginTop: '4px',
};

const featureTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 4px',
};

const featureDescription = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '20px',
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

const ctaSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '20px',
  padding: '24px',
};

const quickLinks = {
  marginTop: '16px',
};

const link = {
  color: '#5e6ad2',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '12px',
  fontSize: '15px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 10px',
  padding: '0 20px',
  textAlign: 'center' as const,
};

export default WelcomeEmail;
