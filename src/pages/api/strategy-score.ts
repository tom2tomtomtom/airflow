import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { env } from '@/lib/env';
import axios from 'axios';

const StrategyScoreSchema = z.object({
  motivations: z.array(z.object({
    statement: z.string(),
    description: z.string(),
  })),
  brief_context: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const parseResult = StrategyScoreSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.errors });
  }
  const { motivations, brief_context } = parseResult.data;
  try {
    // Use AI to score motivations for relevance
    const aiPrompt = `Given the following campaign context, score each motivation for relevance (1-10) and provide a brief justification.\n\nContext:\n${brief_context}\n\nMotivations:\n${motivations.map((m, i) => `${i + 1}. ${m.statement}: ${m.description}`).join('\n')}`;
    const completion = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert campaign strategist.' },
        { role: 'user', content: aiPrompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }, {
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const scored = completion.data.choices[0].message.content;
    return res.status(200).json({ success: true, scored });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
