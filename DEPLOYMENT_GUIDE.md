# AIrWAVE Complete Deployment Guide

This guide will walk you through setting up AIrWAVE for production with real data.

## Prerequisites

- Netlify account (with environment variables configured)
- Supabase account and project
- API keys for OpenAI, Creatomate, and optionally ElevenLabs

## Step 1: Database Setup

### 1.1 Run the Complete Setup Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `scripts/complete-supabase-setup.sql`
5. Paste and run the script
6. You should see "AIrWAVE Supabase setup completed successfully!"

### 1.2 Verify Tables Were Created

Run this query to verify all tables exist:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 22 tables.

## Step 2: Storage Bucket Setup

### 2.1 Create the Assets Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Use these settings:
   - Name: `assets`
   - Public: **Yes** (toggle on)
   - File size limit: **100MB**
   - Allowed MIME types: Use custom list (see below)

### 2.2 Configure Allowed MIME Types

Add these MIME types to allow various file uploads:

**Images:**
- image/jpeg
- image/png
- image/gif
- image/webp
- image/svg+xml

**Videos:**
- video/mp4
- video/quicktime
- video/webm

**Audio:**
- audio/mpeg
- audio/wav
- audio/aac

**Documents:**
- text/plain
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

### 2.3 Configure Bucket Policies

After creating the bucket:

1. Click on the `assets` bucket
2. Go to **Policies** tab
3. Add these RLS policies:

**Allow authenticated users to upload:**
- Policy name: `Allow authenticated uploads`
- Allowed operation: INSERT
- Target roles: authenticated
- WITH CHECK expression: `true`

**Allow public to view:**
- Policy name: `Allow public viewing`
- Allowed operation: SELECT
- Target roles: anon, authenticated
- USING expression: `true`

**Allow users to update their uploads:**
- Policy name: `Allow users to update own files`
- Allowed operation: UPDATE
- Target roles: authenticated
- USING expression: `(auth.uid() = owner)`
- WITH CHECK expression: `(auth.uid() = owner)`

**Allow users to delete their uploads:**
- Policy name: `Allow users to delete own files`
- Allowed operation: DELETE
- Target roles: authenticated
- USING expression: `(auth.uid() = owner)`

### 2.4 Configure CORS

1. Still in the bucket settings
2. Find the CORS configuration section
3. Add this configuration:

```json
[
  {
    "origin": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "headers": ["*"],
    "maxAge": 3600
  }
]
```

## Step 3: Create Initial Test User

### 3.1 Create User via SQL

Run this in the SQL Editor:

```sql
-- Create a test user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
    gen_random_uuid(),
    'test@airwave.com',
    crypt('testpassword123', gen_salt('bf')),
    now(),
    '{"first_name": "Test", "last_name": "User"}'::jsonb
);

-- Get the user ID
SELECT id FROM auth.users WHERE email = 'test@airwave.com';
```

### 3.2 Create Test Client and Access

Replace `<USER_ID>` with the ID from above:

```sql
-- Create a test client
INSERT INTO clients (id, name, description, industry)
VALUES (
    gen_random_uuid(),
    'Demo Company',
    'A demo company for testing AIrWAVE',
    'Technology'
);

-- Get the client ID
SELECT id FROM clients WHERE name = 'Demo Company';

-- Grant user access to client (replace both IDs)
INSERT INTO user_clients (user_id, client_id)
VALUES ('<USER_ID>', '<CLIENT_ID>');
```

## Step 4: Configure Creatomate Webhook

1. Log into your Creatomate account
2. Go to **Settings** → **Webhooks**
3. Add a new webhook:
   - URL: `https://your-app.netlify.app/api/render/webhook`
   - Events: Select all render-related events
   - Secret: Generate a secure secret and save it

4. Add the webhook secret to Netlify:
   - Go to Netlify → Site settings → Environment variables
   - Add: `CREATOMATE_WEBHOOK_SECRET=your-secret`

## Step 5: Verify Deployment

### 5.1 Run Verification Script

Clone the repo locally and run:

```bash
# Install dependencies
npm install

# Copy env example
cp .env.example .env.local

# Add your environment variables to .env.local
# Then run verification
node scripts/verify-deployment.js
```

### 5.2 Manual Verification

1. Visit your Netlify URL
2. Try to sign up or log in
3. Create a client
4. Upload an asset
5. Create a brief and generate motivations

## Step 6: Production Checklist

### Security
- [ ] All environment variables are set in Netlify
- [ ] JWT_SECRET is at least 32 characters
- [ ] Supabase RLS policies are enabled
- [ ] Storage bucket has proper policies

### Performance
- [ ] Database indexes are created (done by setup script)
- [ ] CDN is configured for assets (Supabase provides this)
- [ ] Image optimization is working

### Monitoring
- [ ] Set up uptime monitoring for `/api/health`
- [ ] Configure error tracking (Sentry optional)
- [ ] Set up backup schedule in Supabase

## Troubleshooting

### Build Fails on Netlify
- Check build logs for TypeScript errors
- Ensure all environment variables are set
- Try clearing cache and deploying again

### Can't Connect to Supabase
- Verify Supabase project is active
- Check environment variables are correct
- Ensure no spaces in keys
- Test connection with verification script

### Storage Upload Fails
- Check bucket exists and is public
- Verify CORS configuration
- Check file size limits
- Ensure user is authenticated

### AI Features Not Working
- Verify OpenAI API key has credits
- Check API key permissions
- Test with smaller requests first

## Next Steps

1. **Custom Domain**: Configure a custom domain in Netlify
2. **Email Service**: Set up SendGrid or similar for notifications
3. **Analytics**: Add Google Analytics or similar
4. **Backups**: Configure automated Supabase backups
5. **Monitoring**: Set up comprehensive monitoring

## Support

If you encounter issues:
1. Check the build logs in Netlify
2. Review Supabase logs
3. Run the verification script
4. Check browser console for errors

Your AIrWAVE platform should now be fully deployed and ready for production use!
