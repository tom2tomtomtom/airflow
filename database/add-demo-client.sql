-- Add Demo Client to AIrWAVE Database
-- Run this in your Supabase SQL Editor

-- 1. Insert Demo Client
INSERT INTO clients (
  id,
  name,
  slug,
  industry,
  description,
  website,
  logo_url,
  primary_color,
  secondary_color,
  social_media,
  brand_guidelines,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'TechFlow Solutions',
  'techflow-solutions',
  'Technology',
  'A cutting-edge technology company specializing in AI-powered business solutions and digital transformation services.',
  'https://techflow-solutions.com',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
  '#2563EB',
  '#DC2626',
  '{
    "twitter": "@techflowsolutions",
    "linkedin": "company/techflow-solutions",
    "facebook": "techflowsolutions",
    "instagram": "techflowsolutions"
  }'::jsonb,
  '{
    "voiceTone": "Professional, innovative, and approachable. We speak with confidence about technology while remaining accessible to non-technical audiences.",
    "targetAudience": "Mid-to-large enterprises looking to modernize their operations with AI and digital solutions. CTOs, CEOs, and digital transformation leaders.",
    "keyMessages": [
      "Transforming businesses through intelligent automation",
      "Your trusted partner in digital evolution", 
      "Innovation that drives real results",
      "Bridging the gap between technology and business value"
    ],
    "brandValues": [
      "Innovation",
      "Reliability", 
      "Transparency",
      "Customer Success"
    ],
    "visualStyle": {
      "typography": "Modern, clean sans-serif fonts",
      "imagery": "High-tech, professional, diverse teams",
      "tone": "Confident and forward-thinking"
    }
  }'::jsonb,
  true,
  now(),
  now()
);

-- Get the client ID for subsequent inserts
-- (You'll need to run this query first to get the ID, then use it in the following statements)
SELECT id, name FROM clients WHERE slug = 'techflow-solutions';

-- 2. Insert Client Contacts 
-- Replace 'CLIENT_ID_HERE' with the actual UUID from the query above
INSERT INTO client_contacts (
  client_id,
  name,
  role,
  email,
  phone,
  is_primary,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Primary Contact (Marketing Director)
(
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'Sarah Chen',
  'Chief Marketing Officer',
  'sarah.chen@techflow-solutions.com',
  '+1 (555) 123-4567',
  true,
  true,
  now(),
  now()
),
-- Secondary Contact (CEO)
(
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'Michael Rodriguez',
  'Chief Executive Officer',
  'michael.rodriguez@techflow-solutions.com',
  '+1 (555) 123-4501',
  false,
  true,
  now(),
  now()
),
-- Third Contact (Brand Manager)
(
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'Emma Thompson',
  'Brand Manager',
  'emma.thompson@techflow-solutions.com',
  '+1 (555) 123-4523',
  false,
  true,
  now(),
  now()
);

-- 3. Create a sample campaign for the client
INSERT INTO campaigns (
  id,
  client_id,
  name,
  description,
  objective,
  target_audience,
  budget,
  start_date,
  end_date,
  platforms,
  status,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'Q1 2025 AI Innovation Campaign',
  'Showcase TechFlow Solutions as the leading AI transformation partner for enterprises.',
  'Brand Awareness & Lead Generation',
  'Enterprise CTOs and Digital Transformation Leaders',
  250000.00,
  '2025-01-15',
  '2025-03-31',
  '["LinkedIn", "Google Ads", "Industry Publications", "Webinars"]'::jsonb,
  'planning',
  true,
  now(),
  now()
);

-- 4. Add some sample assets for the client
INSERT INTO assets (
  id,
  client_id,
  name,
  type,
  category,
  description,
  file_url,
  file_size,
  dimensions,
  tags,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Logo Asset
(
  gen_random_uuid(),
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'TechFlow Primary Logo',
  'image',
  'logo',
  'Primary brand logo in high resolution PNG format',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  245760,
  '{"width": 400, "height": 400}'::jsonb,
  '["logo", "brand", "primary", "png"]'::jsonb,
  true,
  now(),
  now()
),
-- Hero Image
(
  gen_random_uuid(),
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'AI Technology Hero Image',
  'image', 
  'hero',
  'Hero image showcasing AI and technology innovation',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop&crop=center',
  892160,
  '{"width": 1200, "height": 600}'::jsonb,
  '["hero", "ai", "technology", "innovation"]'::jsonb,
  true,
  now(),
  now()
),
-- Brand Guidelines Document
(
  gen_random_uuid(),
  (SELECT id FROM clients WHERE slug = 'techflow-solutions'),
  'TechFlow Brand Guidelines 2025',
  'document',
  'guidelines',
  'Complete brand guidelines including logo usage, colors, typography, and voice.',
  'https://example.com/brand-guidelines.pdf',
  2048000,
  '{}'::jsonb,
  '["brand-guidelines", "document", "pdf", "style-guide"]'::jsonb,
  true,
  now(),
  now()
);

-- 5. Create a sample template
INSERT INTO templates (
  id,
  name,
  description,
  category,
  platform,
  dimensions,
  thumbnail_url,
  template_data,
  tags,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'LinkedIn Tech Announcement',
  'Professional template for announcing new technology solutions on LinkedIn',
  'social-media',
  'LinkedIn',
  '{"width": 1200, "height": 628}'::jsonb,
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop&crop=center',
  '{
    "elements": [
      {
        "type": "background",
        "properties": {
          "color": "#f8fafc"
        }
      },
      {
        "type": "text",
        "content": "{{announcement_title}}",
        "properties": {
          "fontSize": 32,
          "fontWeight": "bold",
          "color": "#1e293b"
        }
      },
      {
        "type": "text", 
        "content": "{{company_name}}",
        "properties": {
          "fontSize": 18,
          "color": "#64748b"
        }
      }
    ]
  }'::jsonb,
  '["linkedin", "announcement", "technology", "professional"]'::jsonb,
  true,
  now(),
  now()
);

-- 6. Verify the data was inserted correctly
SELECT 
  c.name as client_name,
  c.slug,
  c.industry,
  (SELECT COUNT(*) FROM client_contacts cc WHERE cc.client_id = c.id) as contact_count,
  (SELECT COUNT(*) FROM campaigns camp WHERE camp.client_id = c.id) as campaign_count,
  (SELECT COUNT(*) FROM assets a WHERE a.client_id = c.id) as asset_count
FROM clients c 
WHERE c.slug = 'techflow-solutions';

-- 7. Show the contact details
SELECT 
  cc.name,
  cc.role,
  cc.email,
  cc.is_primary
FROM client_contacts cc
JOIN clients c ON cc.client_id = c.id
WHERE c.slug = 'techflow-solutions'
ORDER BY cc.is_primary DESC, cc.name;
