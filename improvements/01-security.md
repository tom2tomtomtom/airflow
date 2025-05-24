# Security Improvements for AIRWAVE

## 1. Fix Authentication Flow

```typescript
// src/pages/api/auth/login.ts
// SECURE VERSION - Don't return JWT in response body

const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

// Set HTTP-only cookies
res.setHeader('Set-Cookie', [
  `access_token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=900`,
  `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
]);

// Return only user data
return res.json({ success: true, user: sanitizeUser(user) });
```

## 2. Add CSRF Protection

```typescript
// src/middleware.ts
import crypto from 'crypto';

function generateCSRFToken(sessionId: string): string {
  return crypto
    .createHash('sha256')
    .update(`${sessionId}:${process.env.CSRF_SECRET}`)
    .digest('hex');
}

// Validate on non-GET requests
if (req.method !== 'GET') {
  const token = req.headers.get('x-csrf-token');
  if (!token || !validateCSRFToken(token, sessionId)) {
    return new Response('Invalid CSRF token', { status: 403 });
  }
}
```

## 3. Redis Rate Limiting

```typescript
// Replace in-memory rate limiting
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function rateLimit(ip: string): Promise<boolean> {
  const key = `rate:${ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  return count <= 10; // 10 requests per minute
}
```
