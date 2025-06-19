import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import OpenAI from 'openai';

interface BriefData {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  platforms: string[];
  budget: string;
  timeline: string;
  product?: string;
  service?: string;
  valueProposition?: string;
  brandGuidelines?: string;
  requirements?: string[];
  industry?: string;
  competitors?: string[];
}

interface Motivation {
  id: string;
  title: string;
  description: string;
  score: number;
  reasoning: string;
  targetEmotions: string[];
  platforms: string[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Mock user for development if not present
  let user = (req as any).user;
  if (!user && process.env.NODE_ENV === 'development') {
    user = {
      id: '354d56b0-440b-403e-b207-7038fb8b00d7',
      email: 'tomh@redbaez.com',
      role: 'admin',
      permissions: ['*'],
      clientIds: ['mock-client-id'],
      tenantId: 'mock-tenant'
    };
  }
  const { briefData }: { briefData: BriefData } = req.body;
  
  if (!briefData) {
    return res.status(400).json({ success: false, message: 'Brief data is required' });
  }

  try {
        // Generate motivations based on brief analysis
    const motivations = await generateMotivationsFromBrief(briefData);

        return res.status(200).json({
      success: true,
      data: motivations,
      message: 'Motivations generated successfully'
    });

  } catch (error) {
    console.error('Error generating motivations:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate motivations'
    });
  }
}

async function generateMotivationsFromBrief(briefData: BriefData): Promise<Motivation[]> {
  // Try AI-powered generation first, but with quick fallback
  if (process.env.OPENAI_API_KEY && process.env.NODE_ENV !== 'production') {
    try {
      const aiMotivations = await generateMotivationsWithAI(briefData);
      if (aiMotivations && aiMotivations.length > 0) {
        return aiMotivations;
      }
    } catch (error) {
      console.warn('OpenAI motivation generation failed, falling back to templates:', error);
    }
  }

  // Use template-based generation for production reliability
  return generateMotivationsWithTemplates(briefData);
}

async function generateMotivationsWithAI(briefData: BriefData): Promise<Motivation[]> {
  const prompt = `You are an expert marketing strategist and consumer psychologist. Analyze the following creative brief and generate 12 strategic consumer motivations that would drive engagement and action for this campaign.

CREATIVE BRIEF:
Title: ${briefData.title}
Objective: ${briefData.objective}
Target Audience: ${briefData.targetAudience}
Key Messages: ${briefData.keyMessages.join(', ')}
Platforms: ${briefData.platforms.join(', ')}
Product/Service: ${briefData.product || 'Not specified'}
Value Proposition: ${briefData.valueProposition || 'Not specified'}
Industry: ${briefData.industry || 'Not specified'}
Brand Guidelines: ${briefData.brandGuidelines || 'Not specified'}

Generate 12 consumer motivations as a JSON array. Each motivation should include:
- id: unique identifier (motivation_1, motivation_2, etc.)
- title: Clear, compelling motivation title (2-4 words)
- description: Detailed explanation of how this motivation drives consumer behavior (2-3 sentences)
- score: Relevance score 1-100 based on brief analysis
- reasoning: Why this motivation is effective for this specific campaign (1-2 sentences)
- targetEmotions: Array of 2-3 primary emotions this motivation targets
- platforms: Array of platforms where this motivation would be most effective

Focus on:
1. Deep consumer psychology insights
2. Emotional triggers specific to the target audience
3. Motivations that align with the campaign objectives
4. Platform-appropriate motivation strategies
5. Industry-specific consumer drivers
6. Cultural and behavioral trends

Ensure motivations are diverse, covering emotional, rational, social, and aspirational drivers. Make them specific to this brief, not generic templates.

Respond ONLY with the JSON array, no additional text.`;

  const response = await Promise.race([
    openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use faster model for motivations
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500, // Reduce tokens for faster response
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI request timeout')), 8000) // 8 second timeout for Netlify
    )
  ]);

  const responseText = (response as any).choices[0]?.message?.content?.trim();
  if (!responseText) {
    throw new Error('No response from OpenAI');
  }

    try {
    // Clean up markdown formatting that OpenAI sometimes adds
    let cleanedResponse = responseText;
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```/g, '');
    }
    
    const motivations = JSON.parse(cleanedResponse);
    
    if (!Array.isArray(motivations)) {
      throw new Error('Response is not an array');
    }

    // Validate and format motivations
    return motivations.map((motivation, index) => ({
      id: motivation.id || `motivation_${index + 1}`,
      title: motivation.title || `Motivation ${index + 1}`,
      description: motivation.description || 'AI-generated motivation description',
      score: Math.min(100, Math.max(1, motivation.score || 75)),
      reasoning: motivation.reasoning || 'AI-generated reasoning',
      targetEmotions: Array.isArray(motivation.targetEmotions) ? motivation.targetEmotions : ['engagement'],
      platforms: Array.isArray(motivation.platforms) ? motivation.platforms : briefData.platforms
    })).slice(0, 12); // Ensure max 12 motivations

  } catch (parseError) {
    console.error('Failed to parse OpenAI motivations response:', parseError);
    throw new Error('Invalid JSON response from OpenAI');
  }
}

async function generateMotivationsWithTemplates(briefData: BriefData): Promise<Motivation[]> {
  // Analyze brief content to generate relevant motivations  
  const { objective, targetAudience, keyMessages, platforms } = briefData;
  
  // Base motivation templates with scoring logic
  const motivationTemplates = [
    {
      title: 'Emotional Connection',
      description: 'Build deep emotional bonds through authentic storytelling and relatable experiences',
      reasoning: 'Emotional connections drive 70% more engagement than rational appeals',
      targetEmotions: ['trust', 'belonging', 'excitement'],
      baseScore: 85
    },
    {
      title: 'Social Proof Validation',
      description: 'Leverage testimonials, reviews, and community endorsements for credibility',
      reasoning: 'Social proof increases conversion rates by up to 15%',
      targetEmotions: ['confidence', 'trust', 'security'],
      baseScore: 82
    },
    {
      title: 'Innovation Leadership',
      description: 'Position as industry pioneer with cutting-edge solutions and forward-thinking',
      reasoning: 'Innovation messaging appeals to early adopters and tech-savvy audiences',
      targetEmotions: ['excitement', 'curiosity', 'pride'],
      baseScore: 78
    },
    {
      title: 'Community Building',
      description: 'Foster sense of belonging and shared values within target community',
      reasoning: 'Community-driven content generates 6x more engagement',
      targetEmotions: ['belonging', 'pride', 'connection'],
      baseScore: 80
    },
    {
      title: 'Problem Solution Focus',
      description: 'Address specific pain points with clear, actionable solutions',
      reasoning: 'Problem-solution messaging has 40% higher click-through rates',
      targetEmotions: ['relief', 'hope', 'confidence'],
      baseScore: 88
    },
    {
      title: 'Aspirational Lifestyle',
      description: 'Present idealized future state that audience aspires to achieve',
      reasoning: 'Aspirational content drives 25% more shares and saves',
      targetEmotions: ['desire', 'motivation', 'optimism'],
      baseScore: 75
    },
    {
      title: 'Urgency and Scarcity',
      description: 'Create time-sensitive opportunities and limited availability messaging',
      reasoning: 'Urgency tactics increase immediate action by 30%',
      targetEmotions: ['urgency', 'excitement', 'fear of missing out'],
      baseScore: 72
    },
    {
      title: 'Authority and Expertise',
      description: 'Establish thought leadership through expert insights and industry knowledge',
      reasoning: 'Authority positioning increases trust and premium pricing acceptance',
      targetEmotions: ['respect', 'confidence', 'trust'],
      baseScore: 79
    },
    {
      title: 'Personal Transformation',
      description: 'Focus on individual growth and positive life changes',
      reasoning: 'Transformation stories resonate with 85% of personal development audiences',
      targetEmotions: ['hope', 'determination', 'pride'],
      baseScore: 81
    },
    {
      title: 'Value and ROI Emphasis',
      description: 'Highlight concrete benefits, savings, and return on investment',
      reasoning: 'ROI-focused messaging appeals to decision-makers and budget holders',
      targetEmotions: ['satisfaction', 'security', 'confidence'],
      baseScore: 86
    },
    {
      title: 'Behind-the-Scenes Authenticity',
      description: 'Show genuine process, people, and company culture for transparency',
      reasoning: 'Authentic content builds 3x stronger brand loyalty',
      targetEmotions: ['trust', 'connection', 'appreciation'],
      baseScore: 77
    },
    {
      title: 'Trend and Zeitgeist Alignment',
      description: 'Align messaging with current cultural movements and trending topics',
      reasoning: 'Trend-aligned content receives 50% more organic reach',
      targetEmotions: ['relevance', 'excitement', 'inclusion'],
      baseScore: 73
    }
  ];

  // Score and select top 10 motivations based on brief analysis
  const scoredMotivations = motivationTemplates.map((template, index) => {
    let score = template.baseScore;
    
    // Adjust score based on brief content relevance
    
    // Check objective alignment
    if (objective.toLowerCase().includes('engagement')) {
      if (template.title.includes('Emotional') || template.title.includes('Community')) {
        score += 8;
      }
    }
    
    if (objective.toLowerCase().includes('awareness')) {
      if (template.title.includes('Social Proof') || template.title.includes('Authority')) {
        score += 6;
      }
    }

    if (objective.toLowerCase().includes('conversion') || objective.toLowerCase().includes('sales')) {
      if (template.title.includes('Problem Solution') || template.title.includes('Value')) {
        score += 10;
      }
    }

    // Check target audience alignment
    if (targetAudience.toLowerCase().includes('young') || targetAudience.toLowerCase().includes('millennial')) {
      if (template.title.includes('Innovation') || template.title.includes('Trend')) {
        score += 5;
      }
    }

    if (targetAudience.toLowerCase().includes('professional') || targetAudience.toLowerCase().includes('business')) {
      if (template.title.includes('Authority') || template.title.includes('Value')) {
        score += 7;
      }
    }

    // Check key messages alignment
    keyMessages.forEach(message => {
      if (message.toLowerCase().includes('quality') && template.title.includes('Authority')) {
        score += 4;
      }
      if (message.toLowerCase().includes('innovation') && template.title.includes('Innovation')) {
        score += 6;
      }
      if (message.toLowerCase().includes('community') && template.title.includes('Community')) {
        score += 5;
      }
    });

    // Platform-specific adjustments
    if (platforms.includes('Instagram') || platforms.includes('TikTok')) {
      if (template.title.includes('Aspirational') || template.title.includes('Behind-the-Scenes')) {
        score += 3;
      }
    }

    if (platforms.includes('LinkedIn')) {
      if (template.title.includes('Authority') || template.title.includes('Value')) {
        score += 4;
      }
    }

    // Add some randomization to prevent identical results
    score += Math.random() * 5 - 2.5;
    
    return {
      id: `motivation_${index + 1}`,
      title: template.title,
      description: template.description,
      score: Math.round(Math.max(0, Math.min(100, score))),
      reasoning: template.reasoning,
      targetEmotions: template.targetEmotions,
      platforms: platforms
    };
  });

  // Sort by score and return top 10
  return scoredMotivations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// For development: bypass auth for flow APIs to avoid hanging issues
export default process.env.NODE_ENV === 'development' ? handler : withAuth(handler);