import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import { z } from 'zod';
import axios from 'axios';

const StrategyGenerateSchema = z.object({
  brief_id: z.string().uuid(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const parseResult = StrategyGenerateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.errors });
  }
  const { brief_id } = parseResult.data;
  // Get extracted data from brief
  const { data: brief, error } = await supabase.from('briefs').select('extracted_data').eq('id', brief_id).single();
  if (error || !brief?.extracted_data) {
    return res.status(404).json({ success: false, message: 'Brief not found or not parsed yet' });
  }
  try {
    // Generate strategic motivations
    const aiPrompt = `Given the following extracted campaign brief data, generate 7-10 distinct strategic motivations for a creative campaign. For each, provide:\n- A concise motivation statement\n- A relevance score (1-10)\n- A detailed description\n\nBrief Data:\n${JSON.stringify(brief.extracted_data)}`;
    const completion = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert campaign strategist.' },
        { role: 'user', content: aiPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }, {
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const motivations = completion.data.choices[0].message.content;
    // Save to DB
    const { data: strategy, error: dbError } = await supabase.from('strategies').insert({ brief_id, motivations }).select().single();
    if (dbError) {
      return res.status(500).json({ success: false, message: 'Failed to save strategy', error: dbError.message });
    }
    return res.status(200).json({ success: true, strategy });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
