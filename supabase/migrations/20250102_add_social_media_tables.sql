-- Add social media connections and posts tables

-- Social media connections table
CREATE TABLE IF NOT EXISTS social_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube')),
    platform_user_id TEXT NOT NULL,
    platform_username TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    scope TEXT,
    profile_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, platform, platform_user_id)
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    connection_id UUID REFERENCES social_connections(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    platform_post_id TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'deleted')),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    error_message TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_connections_user_platform ON social_connections(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON social_connections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_social_posts_user_client ON social_posts(user_id, client_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform_status ON social_posts(platform, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at) WHERE status = 'scheduled';

-- Row Level Security
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_connections
CREATE POLICY "Users can view their own social connections" ON social_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social connections" ON social_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social connections" ON social_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social connections" ON social_connections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_posts
CREATE POLICY "Users can view their own social posts" ON social_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_social_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_social_connections_updated_at
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_social_connections_updated_at();

CREATE TRIGGER trigger_update_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_social_posts_updated_at();