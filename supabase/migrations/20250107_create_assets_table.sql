-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text', 'voice')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb,
    size_bytes BIGINT,
    mime_type TEXT,
    duration_seconds INTEGER,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_client_id ON public.assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON public.assets USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view assets from their clients" ON public.assets
    FOR SELECT
    USING (
        client_id IN (
            SELECT client_id 
            FROM public.user_clients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert assets to their clients" ON public.assets
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT client_id 
            FROM public.user_clients 
            WHERE user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update assets from their clients" ON public.assets
    FOR UPDATE
    USING (
        client_id IN (
            SELECT client_id 
            FROM public.user_clients 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        client_id IN (
            SELECT client_id 
            FROM public.user_clients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete assets from their clients" ON public.assets
    FOR DELETE
    USING (
        client_id IN (
            SELECT client_id 
            FROM public.user_clients 
            WHERE user_id = auth.uid()
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON public.assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;