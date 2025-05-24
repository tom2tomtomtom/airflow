# Database Integration Guide

## Replace Mock Data with Supabase

### Current Problem
```typescript
// ❌ BAD: Using in-memory arrays
const mockAssets: Asset[] = [...];
```

### Solution
```typescript
// ✅ GOOD: Use Supabase
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', req.user.id);
    
  if (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  return res.json({ success: true, assets: data });
}
```

### Database Schema
```sql
-- Create assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'text', 'voice')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[],
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);
```
