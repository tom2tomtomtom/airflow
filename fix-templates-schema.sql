-- Fix templates table schema
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS performance_score DECIMAL(3,2) DEFAULT 0.00;

-- Create campaigns table if missing
CREATE TABLE IF NOT EXISTS public.campaigns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                client_id UUID REFERENCES public.clients(id),
                description TEXT,
                status campaign_status DEFAULT 'draft',
                start_date DATE,
                end_date DATE,
                budget DECIMAL(12,2),
                goals JSONB DEFAULT '[]',
                target_audience JSONB DEFAULT '{}',
                created_by UUID REFERENCES public.profiles(id),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

-- Enable RLS for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for campaigns
CREATE POLICY "Users can view campaigns they have access to" ON public.campaigns
                FOR SELECT USING (true);

-- Update templates with sample data
INSERT INTO public.templates (name, platform, aspect_ratio, dimensions, description, category, content_type, is_public, usage_count)
            VALUES 
                ('Instagram Square Post', 'instagram', '1:1', '1080x1080', 'Standard Instagram square post template', 'social', 'post', true, 5),
                ('Instagram Story', 'instagram', '9:16', '1080x1920', 'Instagram story template', 'social', 'story', true, 3),
                ('Facebook Post', 'facebook', '16:9', '1200x630', 'Facebook post template', 'social', 'post', true, 2)
            ON CONFLICT (id) DO NOTHING;