# Environment Setup Guide

This guide provides comprehensive documentation for all environment variables required by the AIRWAVE_0525_CODEX application.

## Environment Files

The application uses different environment files for different stages:

- `.env` - Local development environment
- `.env.production` - Production environment
- `.env.example` - Example template for local development
- `.env.production.example` - Example template for production

## Required Environment Variables

### Authentication & Security

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXTAUTH_URL` | The base URL where your app is hosted | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js encryption | Yes | `your-secret-key-here` |

### Database Configuration

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key for client-side access | Yes | `your-anon-key` |
| `SUPABASE_SERVICE_KEY` | Supabase service key for server-side operations | Yes | `your-service-key` |

### API Keys

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI functionalities | Yes | `sk-...` |

## Optional Environment Variables

### Feature Flags

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `false` | `true` |
| `NEXT_PUBLIC_DEBUG_MODE` | Enable debug logging | `false` | `true` |

### Performance & Optimization

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout in milliseconds | `30000` | `60000` |
| `NEXT_PUBLIC_MAX_RETRIES` | Maximum number of API retry attempts | `3` | `5` |

## Setup Instructions

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables:
   ```bash
   # Edit .env file with your values
   nano .env
   ```

3. Verify all required variables are set:
   ```bash
   npm run verify-env
   ```

### Production Deployment

1. Copy the production example:
   ```bash
   cp .env.production.example .env.production
   ```

2. Set production values securely:
   - Use your hosting provider's environment variable management
   - Never commit production values to version control
   - Use strong, unique values for secrets

### Docker Setup

When using Docker, pass environment variables through docker-compose:

```yaml
environment:
  - NEXTAUTH_URL=${NEXTAUTH_URL}
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
  # ... other variables
```

## Security Best Practices

1. **Never commit sensitive values** - Use `.gitignore` to exclude environment files
2. **Use strong secrets** - Generate secure random strings for secret keys
3. **Rotate keys regularly** - Update API keys and secrets periodically
4. **Limit access** - Use environment-specific keys with minimal permissions
5. **Validate variables** - Check for required variables on application startup

## Troubleshooting

### Common Issues

1. **Missing Required Variables**
   - Error: `Error: Missing required environment variable: VARIABLE_NAME`
   - Solution: Ensure all required variables are set in your environment file

2. **Invalid Supabase Configuration**
   - Error: `Invalid Supabase URL or key`
   - Solution: Verify your Supabase project URL and keys are correct

3. **Authentication Errors**
   - Error: `NextAuth error: Invalid secret`
   - Solution: Generate a new secret using `openssl rand -base64 32`

### Validation Script

Create a validation script to check your environment:

```javascript
// scripts/verify-env.js
const required = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}

console.log('✓ All required environment variables are set');
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Setup](https://supabase.com/docs/guides/getting-started)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
