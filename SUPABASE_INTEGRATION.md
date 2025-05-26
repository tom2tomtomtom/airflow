# AIrWAVE Supabase Integration Guide

## 🚀 Overview

This guide walks you through transitioning AIrWAVE from demo/mock data to real Supabase data. We've already set up the infrastructure - you just need to configure your environment and run the migrations.

## ✅ What's Already Implemented

### Database Layer
- **Complete Schema**: All tables with proper relationships
- **RLS Policies**: Row-level security for data isolation
- **Indexes**: Performance optimizations
- **Audit Logging**: Track changes to critical data

### API Integration
- **Clients API** (`/api/clients`): Full CRUD operations with Supabase
- **Assets API** (`/api/assets`): Complete asset management with Supabase
- **Authentication**: JWT-based auth with Supabase integration
- **Demo Mode**: Seamless fallback to mock data when `NEXT_PUBLIC_DEMO_MODE=true`

### Utilities
- **Setup Script**: `setup-supabase.sh` for easy environment configuration
- **Test Script**: `npm run test:supabase` to verify your connection
- **Type Safety**: Full TypeScript types for database operations

## 📋 Setup Instructions

### 1. Run the Setup Script

```bash
# Make the script executable
chmod +x setup-supabase.sh

# Run the setup wizard
./setup-supabase.sh
```

This will:
- Create your `.env.local` file
- Prompt for Supabase credentials
- Generate a secure JWT secret
- Configure optional services

### 2. Apply Database Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Run these migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_production_optimization.sql`

### 3. Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket called `assets`
3. Configure bucket settings:
   - Public: Yes (for direct asset access)
   - File size limit: 100MB
   - Allowed MIME types: Configure as needed

### 4. Test Your Connection

```bash
npm run test:supabase
```

This will verify:
- Basic Supabase connection
- Database access
- Storage bucket configuration
- Service role client (if configured)

## 🔑 Environment Variables

```env
# Required for real data
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-32-character-secret

# Optional services
OPENAI_API_KEY=sk-your-key
CREATOMATE_API_KEY=your-key
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profiles with roles and permissions
- **clients**: Client organizations
- **user_clients**: Many-to-many relationship for client access
- **assets**: Media assets (images, videos, text, audio)
- **campaigns**: Marketing campaigns
- **templates**: Design templates
- **matrices**: Campaign asset combinations
- **executions**: Rendered outputs

### Key Features
- **Multi-tenancy**: Data isolation by client
- **Audit trails**: Automatic created_at/updated_at timestamps
- **Soft deletes**: Archive data instead of permanent deletion
- **Cascading deletes**: Maintain referential integrity

## 🔧 API Usage Examples

### Clients API

```typescript
// GET all clients for authenticated user
GET /api/clients
Authorization: Bearer YOUR_JWT_TOKEN

// POST create new client
POST /api/clients
Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "New Client",
  "description": "Client description",
  "primaryColor": "#3a86ff",
  "secondaryColor": "#8338ec"
}

// PUT update client
PUT /api/clients?id=CLIENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "Updated Name"
}

// DELETE client (admin only)
DELETE /api/clients?id=CLIENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

### Assets API

```typescript
// GET assets (optionally filtered by client)
GET /api/assets?clientId=CLIENT_ID
Authorization: Bearer YOUR_JWT_TOKEN

// POST create asset
POST /api/assets
Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "Product Image",
  "type": "image",
  "url": "https://example.com/image.jpg",
  "clientId": "CLIENT_ID",
  "tags": ["product", "hero"]
}

// PUT update asset
PUT /api/assets?id=ASSET_ID
Authorization: Bearer YOUR_JWT_TOKEN
{
  "tags": ["updated", "tags"]
}

// DELETE asset
DELETE /api/assets?id=ASSET_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚦 Next Steps

### Phase 1: Core APIs (Current)
- ✅ Clients API
- ✅ Assets API
- 🔄 Campaigns API
- 🔄 Templates API
- 🔄 Briefs API

### Phase 2: File Storage
- Configure Supabase Storage for asset uploads
- Implement file upload endpoints
- Add thumbnail generation
- Set up CDN for asset delivery

### Phase 3: Real-time Features
- WebSocket connections for live updates
- Render progress notifications
- Collaborative editing
- Real-time status updates

### Phase 4: AI Integration
- Connect OpenAI for strategy generation
- Implement Creatomate for video rendering
- Add ElevenLabs for voice generation

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication required" errors**
   - Ensure `NEXT_PUBLIC_DEMO_MODE=false`
   - Check JWT token is being sent in Authorization header
   - Verify Supabase credentials are correct

2. **"No clients found"**
   - Run migrations to create tables
   - Check RLS policies are applied
   - Ensure user_clients records exist

3. **Storage errors**
   - Create the `assets` bucket in Supabase
   - Check bucket permissions
   - Verify CORS settings

### Debug Mode

Set these environment variables for detailed logging:
```env
NODE_ENV=development
DEBUG=supabase:*
```

## 📊 Performance Considerations

- **Connection Pooling**: Supabase client handles this automatically
- **Query Optimization**: Use indexes defined in migrations
- **Batch Operations**: Use Supabase's batch insert/update when possible
- **Caching**: Consider implementing Redis for frequently accessed data

## 🔒 Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use RLS policies** for all tables
3. **Validate user permissions** on every API call
4. **Sanitize inputs** before database operations
5. **Use prepared statements** (Supabase does this automatically)

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [AIrWAVE Database Schema](./supabase/migrations/001_initial_schema.sql)
- [TypeScript Types](./src/lib/supabase.ts)

## 🤝 Contributing

When adding new API endpoints:
1. Always check demo mode first
2. Validate authentication
3. Check user permissions
4. Use TypeScript types from `@/lib/supabase`
5. Handle errors gracefully
6. Update this documentation

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or open an issue.
