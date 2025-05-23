# AIrWAVE API Documentation

## Overview

The AIrWAVE API provides endpoints for managing digital marketing assets, AI-powered content generation, and campaign execution workflows.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints (except auth endpoints and health checks) require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <token>
```

or via secure HTTP-only cookie: `auth_token`

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt-token-here"
}
```

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

#### POST /api/auth/refresh
Refresh an expired JWT token.

#### GET /api/auth/me
Get current authenticated user details.

### Health & Status

#### GET /api/health
Comprehensive health check with service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-05-23T10:00:00Z",
  "version": "0.1.0",
  "environment": "production",
  "services": {
    "database": {
      "status": "connected",
      "latency": 15
    },
    "storage": {
      "status": "available"
    }
  },
  "uptime": 3600
}
```

#### GET /api/status
Simple availability check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-05-23T10:00:00Z"
}
```

### Clients

#### GET /api/clients
List all clients accessible to the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "client-123",
      "name": "Acme Corp",
      "industry": "Technology",
      "description": "Leading tech company",
      "logo_url": "https://..."
    }
  ]
}
```

#### POST /api/clients
Create a new client (admin only).

**Request:**
```json
{
  "name": "New Client",
  "industry": "Retail",
  "description": "Client description"
}
```

### Assets

#### GET /api/assets
List assets with optional filtering.

**Query Parameters:**
- `client_id`: Filter by client
- `type`: Filter by asset type (image, video, audio, copy)
- `tags`: Comma-separated list of tags
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### POST /api/assets/upload
Upload a new asset.

**Request:** Multipart form data
- `file`: The asset file
- `name`: Asset name
- `client_id`: Associated client ID
- `tags`: JSON array of tags
- `metadata`: JSON object with additional metadata

#### GET /api/assets/:id
Get specific asset details.

#### DELETE /api/assets/:id
Delete an asset.

### Templates

#### GET /api/templates
List available templates.

**Query Parameters:**
- `platform`: Filter by platform (facebook, instagram, youtube, etc.)
- `aspect_ratio`: Filter by aspect ratio (16:9, 9:16, 1:1, etc.)

#### POST /api/templates
Create a new template.

**Request:**
```json
{
  "name": "Template Name",
  "platform": "instagram",
  "aspect_ratio": "1:1",
  "width": 1080,
  "height": 1080,
  "structure": {
    "layers": [...]
  }
}
```

### AI Generation

#### POST /api/ai/generate-copy
Generate marketing copy using AI.

**Request:**
```json
{
  "prompt": "Create a catchy headline for...",
  "type": "headline",
  "tone": "professional",
  "length": "short",
  "client_id": "client-123"
}
```

#### POST /api/ai/generate-image
Generate images using AI.

**Request:**
```json
{
  "prompt": "A modern office space with...",
  "style": "photorealistic",
  "dimensions": {
    "width": 1024,
    "height": 1024
  }
}
```

#### POST /api/ai/generate-voiceover
Generate voiceover audio.

**Request:**
```json
{
  "text": "Welcome to our product showcase...",
  "voice": "rachel",
  "speed": 1.0,
  "pitch": 1.0
}
```

### Execution & Workflow

#### POST /api/executions
Create a new execution from a matrix configuration.

**Request:**
```json
{
  "name": "Summer Campaign Execution",
  "matrix_id": "matrix-123",
  "variations": [...],
  "output_format": "mp4"
}
```

#### GET /api/executions/:id
Get execution status and details.

#### POST /api/executions/:id/approve
Approve an execution for deployment.

## Error Responses

All endpoints use consistent error formatting:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- Authentication endpoints: 20 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Upload endpoints: 10 requests per minute per user

## Pagination

Endpoints that return lists support pagination:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Webhooks

Configure webhooks to receive real-time updates:

### Events
- `execution.completed`: When an execution finishes processing
- `execution.approved`: When an execution is approved
- `asset.uploaded`: When a new asset is uploaded

### Webhook Payload
```json
{
  "event": "execution.completed",
  "timestamp": "2025-05-23T10:00:00Z",
  "data": {
    "execution_id": "exec-123",
    "status": "completed",
    "output_url": "https://..."
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { AIrWaveClient } from '@airwave/sdk';

const client = new AIrWaveClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.airwave.com'
});

// Generate copy
const copy = await client.ai.generateCopy({
  prompt: 'Create a headline...',
  type: 'headline'
});

// Upload asset
const asset = await client.assets.upload({
  file: fileBuffer,
  name: 'Product Image',
  tags: ['product', 'hero']
});
```

### cURL Examples

```bash
# Login
curl -X POST https://api.airwave.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get assets
curl https://api.airwave.com/assets \
  -H "Authorization: Bearer <token>"

# Generate copy
curl -X POST https://api.airwave.com/ai/generate-copy \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a tagline...","type":"tagline"}'
```

## Support

For API support, please contact:
- Email: api-support@airwave.com
- Documentation: https://docs.airwave.com
- Status Page: https://status.airwave.com
