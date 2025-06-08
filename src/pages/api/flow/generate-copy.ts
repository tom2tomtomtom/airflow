import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';

interface Motivation {
  id: string;
  title: string;
  description: string;
  score: number;
  reasoning: string;
  targetEmotions: string[];
  platforms: string[];
}

interface BriefData {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  platforms: string[];
  budget: string;
  timeline: string;
  brandGuidelines?: string;
}

interface CopyVariation {
  id: string;
  text: string;
  platform: string;
  motivation: string;
  wordCount: number;
  tone: string;
  cta: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const user = (req as any).user;
  const { motivations, briefData }: { motivations: Motivation[], briefData: BriefData } = req.body;
  
  if (!motivations || !Array.isArray(motivations) || motivations.length === 0) {
    return res.status(400).json({ success: false, message: 'Selected motivations are required' });
  }

  if (motivations.length < 6) {
    return res.status(400).json({ success: false, message: 'Minimum 6 motivations required' });
  }

  if (!briefData) {
    return res.status(400).json({ success: false, message: 'Brief data is required' });
  }

  try {
    console.log(`Generating copy variations for ${motivations.length} motivations`);

    // Generate 5 copy variations per motivation (max 10 words each)
    const copyVariations = await generateCopyFromMotivations(motivations, briefData);

    console.log(`Generated ${copyVariations.length} copy variations`);

    return res.status(200).json({
      success: true,
      data: copyVariations,
      message: 'Copy variations generated successfully'
    });

  } catch (error) {
    console.error('Error generating copy:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate copy'
    });
  }
}

async function generateCopyFromMotivations(motivations: Motivation[], briefData: BriefData): Promise<CopyVariation[]> {
  const copyVariations: CopyVariation[] = [];
  
  // Copy templates for different tones and styles
  const copyTemplates = {
    emotional: [
      'Transform your {goal} with {solution}',
      'Discover the {benefit} you deserve',
      'Experience {transformation} like never before',
      'Join thousands who found {success}',
      'Unlock your potential with {offering}'
    ],
    social_proof: [
      'Trusted by {number} satisfied customers',
      '{Testimonial} - Customer Success Story',
      'See why experts choose {brand}',
      'Join the {community} movement',
      '{Rating} stars from verified users'
    ],
    innovation: [
      'Revolutionary {solution} changes everything',
      'Next-generation {technology} is here',
      'Pioneering the future of {industry}',
      'Advanced {feature} delivers results',
      'Innovation meets {user_need} perfectly'
    ],
    community: [
      'Join our thriving {community} today',
      'Connect with like-minded {audience}',
      'Be part of something bigger',
      'Together we achieve more',
      'Your {community} awaits you'
    ],
    problem_solution: [
      'Solve {problem} in minutes',
      'End {pain_point} forever',
      'Finally, a solution that works',
      'Say goodbye to {frustration}',
      'The answer to {challenge}'
    ],
    aspirational: [
      'Live the {lifestyle} you deserve',
      'Achieve your {dream} today',
      'Step into your best self',
      'Make {aspiration} your reality',
      'Become the {ideal_self} you envision'
    ],
    urgency: [
      'Limited time: {offer} expires soon',
      'Act now before it\'s gone',
      'Last chance for {benefit}',
      'Only {number} spots remaining',
      'Hurry, {opportunity} ends today'
    ],
    authority: [
      'Expert-approved {solution} delivers results',
      'Industry leaders trust {brand}',
      'Proven {method} with {result}',
      'Professional-grade {quality} guaranteed',
      'Award-winning {service} since {year}'
    ],
    transformation: [
      'Transform {current_state} into {desired_state}',
      'From {before} to {after}',
      'Your {transformation} journey starts here',
      'Become the {new_you} today',
      'Change your {life_aspect} forever'
    ],
    value: [
      'Save {amount} with {solution}',
      'Get {benefit} for less',
      'Maximum value, minimum cost',
      'ROI guaranteed or money back',
      'Best {category} value available'
    ]
  };

  // Platform-specific adaptations
  const platformAdaptations = {
    Instagram: {
      maxWords: 8,
      style: 'visual',
      emojis: true,
      hashtags: true
    },
    Facebook: {
      maxWords: 10,
      style: 'conversational',
      emojis: false,
      hashtags: false
    },
    LinkedIn: {
      maxWords: 10,
      style: 'professional',
      emojis: false,
      hashtags: false
    },
    Twitter: {
      maxWords: 6,
      style: 'concise',
      emojis: true,
      hashtags: true
    },
    TikTok: {
      maxWords: 7,
      style: 'trendy',
      emojis: true,
      hashtags: true
    }
  };

  // Generate copy for each motivation
  motivations.forEach((motivation, motivationIndex) => {
    const motivationType = getMotivationType(motivation.title);
    const templates = copyTemplates[motivationType] || copyTemplates.emotional;
    
    // Generate 5 variations per motivation
    for (let i = 0; i < 5; i++) {
      briefData.platforms.forEach(platform => {
        const platformConfig = platformAdaptations[platform] || platformAdaptations.Facebook;
        const template = templates[i % templates.length];
        
        // Generate copy text based on template and brief data
        const copyText = generateCopyText(template, briefData, motivation, platformConfig);
        
        // Ensure word count is within limit (max 10 words)
        const words = copyText.split(' ');
        const finalText = words.slice(0, Math.min(words.length, 10)).join(' ');
        
        copyVariations.push({
          id: `copy_${motivationIndex}_${i}_${platform.toLowerCase()}`,
          text: finalText,
          platform: platform,
          motivation: motivation.title,
          wordCount: finalText.split(' ').length,
          tone: getToneFromMotivation(motivation.title),
          cta: generateCTA(motivation, platform)
        });
      });
    }
  });

  // Return shuffled variations to provide variety
  return shuffleArray(copyVariations);
}

function getMotivationType(motivationTitle: string): string {
  const typeMap = {
    'Emotional Connection': 'emotional',
    'Social Proof': 'social_proof',
    'Innovation': 'innovation',
    'Community Building': 'community',
    'Problem Solution': 'problem_solution',
    'Aspirational Lifestyle': 'aspirational',
    'Urgency and Scarcity': 'urgency',
    'Authority and Expertise': 'authority',
    'Personal Transformation': 'transformation',
    'Value and ROI': 'value'
  };
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (motivationTitle.includes(key.split(' ')[0])) {
      return value;
    }
  }
  
  return 'emotional';
}

function generateCopyText(template: string, briefData: BriefData, motivation: Motivation, platformConfig: any): string {
  let text = template;
  
  // Replace placeholders with brief data
  const replacements = {
    '{goal}': extractGoal(briefData.objective),
    '{solution}': extractSolution(briefData.keyMessages),
    '{benefit}': extractBenefit(briefData.objective),
    '{transformation}': extractTransformation(briefData.objective),
    '{success}': 'success',
    '{offering}': extractOffering(briefData.title),
    '{brand}': extractBrand(briefData.title),
    '{community}': extractCommunity(briefData.targetAudience),
    '{audience}': briefData.targetAudience.split(' ').slice(0, 2).join(' '),
    '{problem}': extractProblem(briefData.objective),
    '{pain_point}': extractPainPoint(briefData.objective),
    '{challenge}': 'challenges',
    '{lifestyle}': extractLifestyle(briefData.targetAudience),
    '{dream}': extractDream(briefData.objective),
    '{aspiration}': extractAspiration(briefData.objective),
    '{number}': getRandomNumber(),
    '{offer}': extractOffer(briefData.objective),
    '{opportunity}': 'opportunity',
    '{method}': 'approach',
    '{result}': extractResult(briefData.objective),
    '{quality}': 'quality',
    '{service}': extractService(briefData.title),
    '{year}': '2020',
    '{current_state}': extractCurrentState(briefData.objective),
    '{desired_state}': extractDesiredState(briefData.objective),
    '{before}': 'ordinary',
    '{after}': 'extraordinary',
    '{new_you}': 'best version',
    '{life_aspect}': 'approach',
    '{amount}': '$' + getRandomNumber(),
    '{category}': extractCategory(briefData.title)
  };
  
  // Apply replacements
  Object.entries(replacements).forEach(([placeholder, value]) => {
    text = text.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  // Add platform-specific elements
  if (platformConfig.emojis && Math.random() > 0.5) {
    text = addRelevantEmoji(text, motivation);
  }
  
  return text;
}

function getToneFromMotivation(motivationTitle: string): string {
  if (motivationTitle.includes('Emotional')) return 'warm';
  if (motivationTitle.includes('Social Proof')) return 'confident';
  if (motivationTitle.includes('Innovation')) return 'exciting';
  if (motivationTitle.includes('Community')) return 'inclusive';
  if (motivationTitle.includes('Problem')) return 'helpful';
  if (motivationTitle.includes('Aspirational')) return 'inspiring';
  if (motivationTitle.includes('Urgency')) return 'urgent';
  if (motivationTitle.includes('Authority')) return 'professional';
  if (motivationTitle.includes('Transformation')) return 'motivational';
  if (motivationTitle.includes('Value')) return 'practical';
  return 'friendly';
}

function generateCTA(motivation: Motivation, platform: string): string {
  const ctas = {
    emotional: ['Join us', 'Start now', 'Connect today'],
    social_proof: ['See why', 'Join thousands', 'Learn more'],
    innovation: ['Try now', 'Discover', 'Experience'],
    community: ['Join us', 'Be part', 'Connect'],
    problem_solution: ['Get started', 'Solve now', 'Try free'],
    aspirational: ['Start journey', 'Begin today', 'Transform now'],
    urgency: ['Act now', 'Hurry', 'Limited time'],
    authority: ['Learn more', 'Get expert', 'Discover'],
    transformation: ['Start today', 'Transform', 'Begin change'],
    value: ['Save now', 'Get deal', 'Compare']
  };
  
  const motivationType = getMotivationType(motivation.title);
  const typeCTAs = ctas[motivationType] || ctas.emotional;
  
  return typeCTAs[Math.floor(Math.random() * typeCTAs.length)];
}

// Helper functions for extracting content from brief data
function extractGoal(objective: string): string {
  if (objective.includes('awareness')) return 'awareness goals';
  if (objective.includes('engagement')) return 'engagement';
  if (objective.includes('sales')) return 'sales targets';
  return 'business goals';
}

function extractSolution(keyMessages: string[]): string {
  return keyMessages[0]?.split(' ').slice(0, 2).join(' ') || 'our solution';
}

function extractBenefit(objective: string): string {
  if (objective.includes('increase')) return 'growth';
  if (objective.includes('drive')) return 'results';
  if (objective.includes('build')) return 'success';
  return 'benefits';
}

function extractTransformation(objective: string): string {
  return 'transformation';
}

function extractOffering(title: string): string {
  return title.split(' ').slice(0, 2).join(' ') || 'solution';
}

function extractBrand(title: string): string {
  return title.split(' ')[0] || 'us';
}

function extractCommunity(audience: string): string {
  return audience.split(' ').slice(0, 2).join(' ') || 'community';
}

function extractProblem(objective: string): string {
  return 'your challenges';
}

function extractPainPoint(objective: string): string {
  return 'frustrations';
}

function extractLifestyle(audience: string): string {
  return 'lifestyle';
}

function extractDream(objective: string): string {
  return 'dreams';
}

function extractAspiration(objective: string): string {
  return 'aspirations';
}

function getRandomNumber(): string {
  const numbers = ['1000', '5000', '10000', '50000'];
  return numbers[Math.floor(Math.random() * numbers.length)];
}

function extractOffer(objective: string): string {
  return 'special offer';
}

function extractService(title: string): string {
  return title.split(' ').slice(-1)[0] || 'service';
}

function extractCurrentState(objective: string): string {
  return 'current situation';
}

function extractDesiredState(objective: string): string {
  return 'ideal outcome';
}

function extractCategory(title: string): string {
  return title.split(' ').slice(-1)[0] || 'solution';
}

function extractResult(objective: string): string {
  return 'proven results';
}

function addRelevantEmoji(text: string, motivation: Motivation): string {
  const emojiMap = {
    'Emotional': '❤️',
    'Social': '👥',
    'Innovation': '🚀',
    'Community': '🤝',
    'Problem': '✅',
    'Aspirational': '⭐',
    'Urgency': '⏰',
    'Authority': '🏆',
    'Transformation': '✨',
    'Value': '💰'
  };
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (motivation.title.includes(key)) {
      return `${emoji} ${text}`;
    }
  }
  
  return text;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default withAuth(handler);