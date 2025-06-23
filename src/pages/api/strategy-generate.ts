import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
import { withAuth } from '@/middleware/withAuth';
import { z } from 'zod';
import OpenAI from 'openai';

const StrategyGenerateSchema = z.object({
  brief_id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  brief_content: z.string().min(10),
  target_audience: z.string().optional(),
  campaign_objectives: z.string().optional(),
  regenerate: z.boolean().default(false),
  feedback: z.string().optional()});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY});

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = (req as any).user;
  const validationResult = StrategyGenerateSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Invalid input',
      details: validationResult.error.issues
    });
  }

  const { brief_id, client_id, brief_content, target_audience, campaign_objectives, regenerate, feedback } = validationResult.data;

  try {
    // Verify user has access to the client
    const { data: clientAccess } = await supabase
      .from('user_clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('client_id', client_id)
      .single();

    if (!clientAccess) {
      return res.status(403).json({ error: 'Access denied to this client' });
    }

    // Check if motivations already exist and we're not regenerating
    if (brief_id && !regenerate) {
      const { data: existingMotivations } = await supabase
        .from('motivations')
        .select('*')
        .eq('brief_id', brief_id)
        .eq('is_ai_generated', true);

      if (existingMotivations && existingMotivations.length > 0) {
        return res.json({ 
          success: true,
          motivations: existingMotivations,
          message: 'Retrieved existing motivations'
        });
      }
    }

    // Generate motivations using OpenAI
    const systemPrompt = `You are an expert marketing strategist and consumer psychologist. Your task is to analyze campaign briefs and generate 8 strategic motivational concepts that drive consumer behavior.

For each motivation, provide:
1. A compelling title (2-6 words)
2. A detailed description (50-100 words) explaining the psychological mechanism
3. A category (emotional, rational, social, fear, aspiration, convenience, status, safety)
4. Relevance score (0-100) based on brief alignment
5. Target emotions it triggers
6. Specific use cases for implementation

Focus on psychological triggers that convert prospects into customers. Consider the target audience's pain points, desires, and decision-making patterns.`;

    const userPrompt = `Analyze this campaign brief and generate 8 strategic motivations:

BRIEF CONTENT:
${brief_content}

${target_audience ? `TARGET AUDIENCE: ${target_audience}` : ''}
${campaign_objectives ? `OBJECTIVES: ${campaign_objectives}` : ''}
${feedback ? `FEEDBACK FOR IMPROVEMENT: ${feedback}` : ''}

Generate 8 diverse motivational concepts that would drive this audience to take action. Return as JSON array with this structure:
[{
  "title": "string",
  "description": "string", 
  "category": "emotional|rational|social|fear|aspiration|convenience|status|safety",
  "relevance_score": number,
  "target_emotions": ["string"],
  "use_cases": ["string"],
  "psychological_rationale": "string"
}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt  }
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500});

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let motivationsData;
    try {
      motivationsData = JSON.parse(aiResponse);
    } catch (parseError: any) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid response format from AI');
    }

    // Validate and create motivations in database
    const createdMotivations = [];
    
    for (const motivation of motivationsData) {
      const { data: created, error } = await supabase
        .from('motivations')
        .insert({
          brief_id: brief_id || null,
          client_id,
          title: motivation.title,
          description: motivation.description,
          category: motivation.category,
          relevance_score: motivation.relevance_score,
          target_emotions: motivation.target_emotions || [],
          use_cases: motivation.use_cases || [],
          is_ai_generated: true,
          generation_context: {},
  model: 'gpt-4o',
            temperature: 0.7,
            target_audience,
            campaign_objectives,
            feedback: feedback || null,
            psychological_rationale: motivation.psychological_rationale },
  created_by: user.id})
        .select(`
          *,
          clients(name, slug),
          briefs(name, title)
        `)
        .single();

      if (error) {
        console.error('Error creating motivation:', error);
        continue;
      }

      createdMotivations.push(created);
    }

    // Update brief with generation status if brief_id exists
    if (brief_id) {
      await supabase
        .from('briefs')
        .update({ 
          parsing_status: 'motivations_generated',
          motivations_count: createdMotivations.length,
          last_generation_at: new Date().toISOString()
        })
        .eq('id', brief_id);
    }

    return res.json({
      success: true,
      motivations: createdMotivations,
      count: createdMotivations.length,
      message: `Generated ${createdMotivations.length} strategic motivations`
    });

  } catch (error: any) {
    console.error('Strategy generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate strategy',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default withAuth(handler);
