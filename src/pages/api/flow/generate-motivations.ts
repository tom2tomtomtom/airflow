import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';

interface BriefData {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  platforms: string[];
  budget: string;
  timeline: string;
  brandGuidelines?: string;
  requirements?: string[];
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const user = (req as any).user;
  const { briefData }: { briefData: BriefData } = req.body;
  
  if (!briefData) {
    return res.status(400).json({ success: false, message: 'Brief data is required' });
  }

  try {
    console.log('Generating motivations for brief:', briefData.title);

    // Generate motivations based on brief analysis
    const motivations = await generateMotivationsFromBrief(briefData);

    console.log(`Generated ${motivations.length} motivations`);

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

export default withAuth(handler);