# Environment Variables Documentation

This document provides detailed information about all environment variables used in the AIrWAVE application.

## Table of Contents
- [Overview](#overview)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Setup Guide](#setup-guide)
- [Troubleshooting](#troubleshooting)

## Overview

AIrWAVE uses environment variables to configure various services and settings. These variables should be set in a `.env` file in the root directory of your project. Never commit your `.env` file to version control.

## Required Variables

These variables MUST be set for the application to function properly:

### Application Core
- **`NEXT_PUBLIC_API_URL`** (required)
  - Description: The base URL for the API
  - Example: `http://localhost:3000` (development), `https://api.yourapp.com` (production)
  - Usage: Used by the frontend to make API calls

- **`NODE_ENV`** (required)
  - Description: The environment the application is running in
  - Options: `development`, `production`, `test`
  - Default: `development`
  - Usage: Determines build optimizations and feature flags

### Authentication
- **`JWT_SECRET`** (required)
  - Description: Secret key for signing JWT tokens
  - Requirements: Minimum 32 characters, use a strong random string
  - Example: Generate with: `openssl rand -base64 32`
  - Usage: Used to sign and verify authentication tokens

### Supabase Configuration
- **`NEXT_PUBLIC_SUPABASE_URL`** (required)
  - Description: Your Supabase project URL (public)
  - Example: `https://abcdefghijkl.supabase.co`
  - Usage: Frontend connection to Supabase

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (required)
  - Description: Supabase anonymous/public key
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Usage: Frontend authentication with Supabase

- **`SUPABASE_SERVICE_KEY`** (required)
  - Description: Supabase service role key (private)
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Usage: Backend admin operations with Supabase
  - ⚠️ **Security**: Never expose this key to the frontend

## Optional Variables

These variables enhance functionality but have defaults or are not critical:

### Authentication Settings
- **`JWT_EXPIRY`** (optional)
  - Description: JWT token expiration time
  - Default: `7d`
  - Format: Zeit/ms format (e.g., `7d`, `24h`, `1h`)
  - Usage: How long authentication tokens remain valid

- **`REFRESH_TOKEN_EXPIRY`** (optional)
  - Description: Refresh token expiration time
  - Default: `30d`
  - Format: Zeit/ms format
  - Usage: How long refresh tokens remain valid

### AI Services
- **`OPENAI_API_KEY`** (optional)
  - Description: OpenAI API key for AI features
  - Example: `sk-...`
  - Usage: Powers AI content generation features
  - Note: Required if AI features are enabled

- **`ELEVENLABS_API_KEY`** (optional)
  - Description: ElevenLabs API key for voice synthesis
  - Usage: Generates AI voiceovers
  - Note: Required for voice features

- **`RUNWAY_API_KEY`** (optional)
  - Description: RunwayML API key for video generation
  - Usage: AI video generation features
  - Note: Required for video AI features

### Media Processing
- **`CREATOMATE_API_KEY`** (optional)
  - Description: Creatomate API key for video rendering
  - Usage: Professional video rendering and templates
  - Note: Required for video export features

### Storage Configuration
- **`STORAGE_BUCKET`** (optional)
  - Description: Default storage bucket name
  - Default: `airwave-assets`
  - Usage: Where uploaded files are stored

- **`MAX_FILE_SIZE`** (optional)
  - Description: Maximum file upload size in bytes
  - Default: `52428800` (50MB)
  - Usage: Limits file upload sizes

### Email Configuration
- **`SMTP_HOST`** (optional)
  - Description: SMTP server hostname
  - Default: `smtp.gmail.com`
  - Usage: Sending email notifications

- **`SMTP_PORT`** (optional)
  - Description: SMTP server port
  - Default: `587`
  - Usage: SMTP connection port

- **`SMTP_USER`** (optional)
  - Description: SMTP authentication username
  - Example: `notifications@yourapp.com`
  - Usage: Email account for sending

- **`SMTP_PASS`** (optional)
  - Description: SMTP authentication password
  - Usage: Email account password or app-specific password

## Setup Guide

### Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Set required variables:**
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   
   # Add to your .env file
   JWT_SECRET=your-generated-secret-here
   ```

3. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and keys from the project settings
   - Add them to your `.env` file

4. **Configure optional services:**
   - Only add API keys for services you plan to use
   - Start with minimal configuration and add as needed

### Production Setup

For production deployments:

1. **Use environment-specific files:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Set secure values:**
   - Use strong, unique secrets
   - Rotate keys regularly
   - Use environment variables from your hosting provider

3. **Verify all required variables are set:**
   ```bash
   # Run the setup verification script
   npm run verify-env
   ```

## Troubleshooting

### Common Issues

#### "JWT_SECRET is not defined"
- **Cause:** Missing or incorrectly set JWT_SECRET
- **Solution:** Ensure JWT_SECRET is set and at least 32 characters

#### "Invalid Supabase credentials"
- **Cause:** Incorrect Supabase URL or keys
- **Solution:** 
  1. Verify keys match your Supabase project
  2. Check for extra spaces or quotes
  3. Ensure you're using the correct key type (anon vs service)

#### "Failed to connect to database"
- **Cause:** Supabase configuration issues
- **Solution:**
  1. Check SUPABASE_URL format (should include https://)
  2. Verify your Supabase project is active
  3. Check network/firewall settings

#### "Email sending failed"
- **Cause:** SMTP configuration issues
- **Solution:**
  1. Verify SMTP credentials
  2. For Gmail, use app-specific passwords
  3. Check if port 587 is blocked
  4. Enable "Less secure app access" if using Gmail

### Validation Script

Run this to validate your environment:
```bash
node scripts/validate-env.js
```

This will check:
- All required variables are set
- Variable formats are correct
- Services are reachable
- API keys are valid (where possible)

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different values** for development and production
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use secret management services** in production (AWS Secrets Manager, etc.)
5. **Limit access** to production environment variables
6. **Monitor for exposed secrets** using tools like GitGuardian

### Getting Help

If you encounter issues not covered here:
1. Check the [GitHub Issues](https://github.com/airwave/issues)
2. Review the setup logs in detail
3. Contact support with your error messages (excluding sensitive data)

Remember to never share your actual environment variable values when seeking help!