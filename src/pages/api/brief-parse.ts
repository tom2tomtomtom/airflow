import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import { z } from 'zod';
import axios from 'axios';

const BriefParseSchema = z.object({
  brief_id: z.string().uuid(),
});

async function extractTextFromFile(fileUrl: string): Promise<string> {
  // TODO: Use a real text extraction service or library for PDF/DOCX/TXT
  // For now, just fetch the file (if TXT) as a placeholder
  if (fileUrl.endsWith('.txt')) {
    const res = await axios.get(fileUrl);
    return res.data;
  }
  // For PDF/DOCX, integrate with a 3rd party API or use server-side parsing
  throw new Error('Text extraction for PDF/DOCX not implemented');
}

async function aiParseBrief(text: string) {
  // Call OpenAI/Claude or similar to extract structured info
  const prompt = `Extract the following from the campaign brief:\n- Campaign objectives\n- Target audience\n- Brand guidelines\n- Key messaging\n- Platforms\nReturn a JSON object with confidence scores for each field.`;
  const completion = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert campaign strategist.' },
      { role: 'user', content: `${prompt}\n\nBrief:\n${text}` },
    ],
    temperature: 0.2,
    max_tokens: 800,
  }, {
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return completion.data.choices[0].message.content;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const parseResult = BriefParseSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.errors });
  }
  const { brief_id } = parseResult.data;
  const { data: brief, error } = await supabase.from('briefs').select('*').eq('id', brief_id).single();
  if (error || !brief) {
    return res.status(404).json({ success: false, message: 'Brief not found' });
  }
  try {
    const text = await extractTextFromFile(brief.file_url);
    const parsed = await aiParseBrief(text);
    // Save parsed data to DB
    const { data: updatedBrief, error: updateError } = await supabase.from('briefs').update({ extracted_data: parsed, status: 'parsed' }).eq('id', brief_id).select().single();
    if (updateError) {
      return res.status(500).json({ success: false, message: 'Failed to update brief', error: updateError.message });
    }
    return res.status(200).json({ success: true, brief: updatedBrief });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
