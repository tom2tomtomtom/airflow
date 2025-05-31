-- ====================================================================
-- AIRWAVE SUPABASE COMPLETE SETUP SCRIPT
-- This script sets up all necessary storage buckets and policies
-- ====================================================================

-- Create all required storage buckets
DO $$
BEGIN
    -- Assets bucket for user-uploaded files (images, videos, documents)
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'assets', 
        'assets', 
        true, 
        104857600, -- 100MB limit
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

    -- Templates bucket for Creatomate template files
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'templates', 
        'templates', 
        true, 
        52428800, -- 50MB limit
        ARRAY['application/json', 'image/jpeg', 'image/png', 'video/mp4']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

    -- Renders bucket for generated video/image outputs
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'renders', 
        'renders', 
        true, 
        209715200, -- 200MB limit for large renders
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

    -- Avatars bucket for user profile pictures
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'avatars', 
        'avatars', 
        true, 
        5242880, -- 5MB limit
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

    -- Campaigns bucket for campaign-related files
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'campaigns', 
        'campaigns', 
        false, -- Private by default
        52428800, -- 50MB limit
        ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/json', 'text/csv']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

    RAISE NOTICE 'All storage buckets created successfully!';
END $$;

-- ====================================================================
-- STORAGE POLICIES SETUP
-- ====================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to assets bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their assets" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their templates" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload renders" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view renders" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their renders" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their renders" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their avatars" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload to campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their client campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their campaigns" ON storage.objects;

-- ====================================================================
-- ASSETS BUCKET POLICIES
-- ====================================================================

-- Users can upload assets (organized by client_id/user_id/)
CREATE POLICY "Users can upload to assets bucket" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL AND
    -- Path should be: client_id/user_id/filename
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- Anyone can view assets (they're public)
CREATE POLICY "Users can view assets" ON storage.objects
FOR SELECT USING (bucket_id = 'assets');

-- Users can update their own assets
CREATE POLICY "Users can update their assets" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Users can delete their own assets
CREATE POLICY "Users can delete their assets" ON storage.objects
FOR DELETE USING (
    bucket_id = 'assets' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- ====================================================================
-- TEMPLATES BUCKET POLICIES
-- ====================================================================

-- Users can upload templates
CREATE POLICY "Users can upload templates" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'templates' AND 
    auth.uid() IS NOT NULL
);

-- Anyone can view templates (they're public)
CREATE POLICY "Anyone can view templates" ON storage.objects
FOR SELECT USING (bucket_id = 'templates');

-- Users can update their own templates
CREATE POLICY "Users can update their templates" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'templates' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own templates
CREATE POLICY "Users can delete their templates" ON storage.objects
FOR DELETE USING (
    bucket_id = 'templates' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ====================================================================
-- RENDERS BUCKET POLICIES
-- ====================================================================

-- Users can upload renders
CREATE POLICY "Users can upload renders" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'renders' AND 
    auth.uid() IS NOT NULL
);

-- Anyone can view renders (they're public for sharing)
CREATE POLICY "Anyone can view renders" ON storage.objects
FOR SELECT USING (bucket_id = 'renders');

-- Users can update their own renders
CREATE POLICY "Users can update their renders" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'renders' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own renders
CREATE POLICY "Users can delete their renders" ON storage.objects
FOR DELETE USING (
    bucket_id = 'renders' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ====================================================================
-- AVATARS BUCKET POLICIES
-- ====================================================================

-- Users can upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view avatars (they're public)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Users can update their own avatars
CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ====================================================================
-- CAMPAIGNS BUCKET POLICIES (PRIVATE)
-- ====================================================================

-- Users can upload to campaigns bucket
CREATE POLICY "Users can upload to campaigns bucket" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'campaigns' AND 
    auth.uid() IS NOT NULL AND
    -- Path should be: client_id/campaign_id/filename
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- Users can only view their client campaigns
CREATE POLICY "Users can view their client campaigns" ON storage.objects
FOR SELECT USING (
    bucket_id = 'campaigns' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- Users can update their campaigns
CREATE POLICY "Users can update their campaigns" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'campaigns' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- Users can delete their campaigns
CREATE POLICY "Users can delete their campaigns" ON storage.objects
FOR DELETE USING (
    bucket_id = 'campaigns' AND 
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.clients c 
        WHERE c.created_by = auth.uid()
    )
);

-- ====================================================================
-- CREATE ADDITIONAL TABLES FOR WEBHOOK MANAGEMENT
-- ====================================================================

-- Webhooks table for integrations
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries for tracking
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT
);

-- Platform integrations table
CREATE TABLE IF NOT EXISTS public.platform_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', etc.
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    scope TEXT[],
    account_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table for tracking performance
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'campaign', 'execution', 'asset'
    entity_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2),
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhooks
CREATE POLICY "Users can manage webhooks of their clients" ON public.webhooks
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.clients 
        WHERE clients.id = webhooks.client_id 
        AND clients.created_by = auth.uid()
    )
);

-- RLS Policies for webhook_deliveries
CREATE POLICY "Users can view deliveries of their webhooks" ON public.webhook_deliveries
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.webhooks
        JOIN public.clients ON clients.id = webhooks.client_id
        WHERE webhooks.id = webhook_deliveries.webhook_id 
        AND clients.created_by = auth.uid()
    )
);

-- RLS Policies for platform_integrations
CREATE POLICY "Users can manage integrations of their clients" ON public.platform_integrations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.clients 
        WHERE clients.id = platform_integrations.client_id 
        AND clients.created_by = auth.uid()
    )
);

-- RLS Policies for analytics
CREATE POLICY "Users can view analytics of their entities" ON public.analytics
FOR SELECT USING (
    -- Check if user owns the campaign/execution/asset being tracked
    (entity_type = 'campaign' AND entity_id IN (
        SELECT campaigns.id FROM public.campaigns
        JOIN public.clients ON clients.id = campaigns.client_id
        WHERE clients.created_by = auth.uid()
    )) OR
    (entity_type = 'execution' AND entity_id IN (
        SELECT executions.id FROM public.executions
        JOIN public.matrices ON matrices.id = executions.matrix_id
        JOIN public.campaigns ON campaigns.id = matrices.campaign_id
        JOIN public.clients ON clients.id = campaigns.client_id
        WHERE clients.created_by = auth.uid()
    )) OR
    (entity_type = 'asset' AND entity_id IN (
        SELECT assets.id FROM public.assets
        JOIN public.clients ON clients.id = assets.client_id
        WHERE clients.created_by = auth.uid()
    ))
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_webhooks_client_id ON public.webhooks(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_platform_integrations_client_id ON public.platform_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON public.analytics(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON public.analytics(recorded_at);

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_integrations_updated_at BEFORE UPDATE ON public.platform_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for campaign performance analytics
CREATE OR REPLACE VIEW public.campaign_analytics AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.client_id,
    cl.name as client_name,
    c.status,
    c.budget,
    c.spent,
    COUNT(e.id) as total_executions,
    COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_executions,
    AVG(CASE WHEN a.metric_name = 'engagement_rate' THEN a.metric_value END) as avg_engagement_rate,
    SUM(CASE WHEN a.metric_name = 'impressions' THEN a.metric_value END) as total_impressions,
    SUM(CASE WHEN a.metric_name = 'clicks' THEN a.metric_value END) as total_clicks,
    c.created_at,
    c.updated_at
FROM public.campaigns c
JOIN public.clients cl ON cl.id = c.client_id
LEFT JOIN public.matrices m ON m.campaign_id = c.id
LEFT JOIN public.executions e ON e.matrix_id = m.id
LEFT JOIN public.analytics a ON a.entity_type = 'campaign' AND a.entity_id = c.id
GROUP BY c.id, c.name, c.client_id, cl.name, c.status, c.budget, c.spent, c.created_at, c.updated_at;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 AIrWAVE Supabase setup completed successfully!';
    RAISE NOTICE '📦 Created buckets: assets, templates, renders, avatars, campaigns';
    RAISE NOTICE '🔐 Configured RLS policies for all storage buckets';
    RAISE NOTICE '📊 Added analytics and webhook management tables';
    RAISE NOTICE '🚀 Your AIrWAVE application is ready to use with Supabase!';
END $$;