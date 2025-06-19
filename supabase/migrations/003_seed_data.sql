-- Seed data for AIrWAVE development and testing
-- This creates sample data to help get started

-- Create a demo client
INSERT INTO clients (id, name, description, industry) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo Company', 'A demo client for testing AIrWAVE features', 'Technology')
ON CONFLICT (id) DO NOTHING;

-- Create demo templates
INSERT INTO templates (id, name, description, platform, aspect_ratio, width, height, structure) VALUES
  ('22222222-2222-2222-2222-222222222222', 
   'Facebook Feed Post', 
   'Standard Facebook feed post template', 
   'facebook', 
   '1:1', 
   1080, 
   1080, 
   '{"elements": [{"type": "background", "color": "#ffffff"}, {"type": "text", "content": "{{headline}}", "position": {"x": 50, "y": 30}}, {"type": "image", "source": "{{image}}", "position": {"x": 50, "y": 50}}, {"type": "text", "content": "{{cta}}", "position": {"x": 50, "y": 80}}]}'::jsonb),
  
  ('33333333-3333-3333-3333-333333333333', 
   'Instagram Story', 
   'Vertical Instagram story template', 
   'instagram', 
   '9:16', 
   1080, 
   1920, 
   '{"elements": [{"type": "background", "gradient": ["#f093fb", "#f5576c"]}, {"type": "text", "content": "{{headline}}", "position": {"x": 50, "y": 20}}, {"type": "image", "source": "{{image}}", "position": {"x": 50, "y": 50}}, {"type": "text", "content": "{{cta}}", "position": {"x": 50, "y": 85}}]}'::jsonb),
  
  ('44444444-4444-4444-4444-444444444444', 
   'YouTube Thumbnail', 
   'Standard YouTube thumbnail template', 
   'youtube', 
   '16:9', 
   1920, 
   1080, 
   '{"elements": [{"type": "background", "image": "{{background}}"}, {"type": "text", "content": "{{title}}", "position": {"x": 30, "y": 50}, "style": {"fontSize": 72, "fontWeight": "bold", "color": "#ffffff", "shadow": true}}]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('assets', 'assets', false),
  ('briefs', 'briefs', false),
  ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket (public read, authenticated write)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for assets bucket (client-based access)
CREATE POLICY "Users can view client assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_clients 
      WHERE user_clients.user_id = auth.uid() 
      AND user_clients.client_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can upload client assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_clients 
      WHERE user_clients.user_id = auth.uid() 
      AND user_clients.client_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can update client assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_clients 
      WHERE user_clients.user_id = auth.uid() 
      AND user_clients.client_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can delete client assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_clients 
      WHERE user_clients.user_id = auth.uid() 
      AND user_clients.client_id::text = (storage.foldername(name))[1]
    )
  );

-- Function to add a user to a client
CREATE OR REPLACE FUNCTION add_user_to_client(
  p_user_email TEXT,
  p_client_id UUID,
  p_added_by UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email;
  END IF;
  
  -- Check if the user doing the adding has access to this client
  IF NOT has_client_access(p_added_by, p_client_id) AND NOT is_admin(p_added_by) THEN
    RAISE EXCEPTION 'Insufficient permissions to add users to this client';
  END IF;
  
  -- Add the user to the client
  INSERT INTO user_clients (user_id, client_id)
  VALUES (v_user_id, p_client_id)
  ON CONFLICT (user_id, client_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new client and assign the creator to it
CREATE OR REPLACE FUNCTION create_client_with_access(
  p_name TEXT,
  p_description TEXT,
  p_industry TEXT,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Create the client
  INSERT INTO clients (name, description, industry)
  VALUES (p_name, p_description, p_industry)
  RETURNING id INTO v_client_id;
  
  -- Assign the creator to the client
  INSERT INTO user_clients (user_id, client_id)
  VALUES (p_created_by, v_client_id);
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create some helpful views
CREATE OR REPLACE VIEW user_accessible_clients AS
SELECT 
  c.*,
  uc.user_id,
  p.first_name || ' ' || p.last_name as user_name
FROM clients c
JOIN user_clients uc ON c.id = uc.client_id
JOIN profiles p ON uc.user_id = p.id;

-- Grant access to the views
GRANT SELECT ON user_accessible_clients TO authenticated;

-- Create indexes for better performance on storage queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_owner ON storage.objects(owner);

COMMENT ON SCHEMA public IS 'AIrWAVE application schema';