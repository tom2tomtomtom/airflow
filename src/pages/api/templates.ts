import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { z } from 'zod';

// Strict types from Supabase
export type TemplateRow = Database['public']['Tables']['templates']['Row'];
export type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
export type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

// Zod schema for runtime validation (POST/PUT/PATCH)
const TemplateInsertSchema = z.object({
  name: z.string(),
  aspect_ratio: z.string(),
  platform: z.string(),
  height: z.number(),
  width: z.number(),
  structure: z.record(z.any()),
  description: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  client_id: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

const TemplateUpdateSchema = TemplateInsertSchema.partial().extend({
  id: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      // Get all templates
      const { data, error } = await supabase.from('templates').select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data as TemplateRow[]);
    }
    case 'POST': {
      // Validate and create a new template
      const parseResult = TemplateInsertSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors });
      }
      const body: TemplateInsert = parseResult.data;
      const { data, error } = await supabase.from('templates').insert([body]).select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data?.[0] as TemplateRow);
    }
    case 'PUT':
    case 'PATCH': {
      // Validate and update an existing template (expects id in body)
      const parseResult = TemplateUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors });
      }
      const { id, ...updates } = parseResult.data;
      if (!id) return res.status(400).json({ error: 'Missing template id' });
      const { data, error } = await supabase.from('templates').update(updates as TemplateUpdate).eq('id', id).select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data?.[0] as TemplateRow);
    }
    case 'DELETE': {
      // Delete a template (expects id in body)
      const { id } = req.body as { id?: string };
      if (!id) return res.status(400).json({ error: 'Missing template id' });
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
