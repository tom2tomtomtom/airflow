import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { env, hasOpenAI } from '@/lib/env';
import { supabase } from '@/lib/supabase';

export interface GenerationPrompt {
  prompt: string;
  type: 'text' | 'image' | 'video' | 'voice';
  parameters?: Record<string, any>;
  clientId: string;
}

export interface GenerationResult {
  id: string;
  type: 'text' | 'image' | 'video' | 'voice';
  content: string | string[]; // URL for media, text content for text
  prompt: string;
  dateCreated: string;
  clientId: string;
  userId: string;
}

type ResponseData = {
  success: boolean;
  message?: string;
  result?: GenerationResult;
};

// Initialize OpenAI client
const openai = hasOpenAI ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

// Real AI generation functions
const generateText = async (prompt: string, parameters?: Record<string, any>): Promise<string[]> => {
  if (!openai) {
    // Fallback to mock data if OpenAI not available
    return mockGenerateText(prompt);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a senior creative copywriter and content strategist. Create compelling, varied content that connects with target audiences. Generate 3 distinct variations for each request.'
        },
        {
          role: 'user',
          content: `Create content variations for: "${prompt}". ${parameters?.tone ? `Tone: ${parameters.tone}. ` : ''}${parameters?.style ? `Style: ${parameters.style}. ` : ''}${parameters?.purpose ? `Purpose: ${parameters.purpose}. ` : ''}Provide 3 distinct variations.`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    // Parse the content into variations (split by numbered lists or line breaks)
    const variations = content.split(/\n\d+\.|\n-/).filter(v => v.trim()).slice(0, 3);
    return variations.length > 0 ? variations.map(v => v.trim()) : [content];
  } catch (error) {
    console.error('OpenAI text generation error:', error);
    return mockGenerateText(prompt);
  }
};

// Mock AI generation functions (fallback)
const mockGenerateText = (prompt: string): string[] => {
  const responses = [
    `Here's a compelling copy for your campaign: "${prompt}" is the foundation for our new approach. We're excited to introduce a revolutionary product that will transform how you think about this space.`,
    `Based on your request for "${prompt}", we've crafted this message: Our customers deserve the best experience possible. That's why we've designed our solution with your needs in mind.`,
    `Your prompt "${prompt}" inspired this tagline: "Innovation meets simplicity. Experience the difference today."`,
  ];
  
  return responses.slice(0, 3);
};

const generateImage = async (prompt: string, parameters?: Record<string, any>): Promise<string> => {
  if (!openai) {
    return mockGenerateImage(prompt);
  }

  try {
    const enhancedPrompt = parameters?.enhance ? 
      await enhanceImagePrompt(prompt, parameters) : prompt;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: (parameters?.size as '1024x1024' | '1792x1024' | '1024x1792') || '1024x1024',
      quality: (parameters?.quality as 'standard' | 'hd') || 'standard',
      style: (parameters?.style as 'vivid' | 'natural') || 'vivid',
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) throw new Error('No image URL returned');

    return imageUrl;
  } catch (error) {
    console.error('DALL-E image generation error:', error);
    return mockGenerateImage(prompt);
  }
};

const enhanceImagePrompt = async (prompt: string, parameters?: Record<string, any>): Promise<string> => {
  if (!openai) return prompt;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert DALL-E prompt engineer. Enhance prompts to be more specific, visually descriptive, and likely to produce high-quality images. Keep the core concept but add technical and artistic details.'
        },
        {
          role: 'user',
          content: `Enhance this image prompt for DALL-E 3: "${prompt}". ${parameters?.purpose ? `Purpose: ${parameters.purpose}. ` : ''}${parameters?.style ? `Artistic style: ${parameters.style}. ` : ''}Make it more specific and visually descriptive while keeping the original intent.`
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content?.trim() || prompt;
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return prompt;
  }
};

const mockGenerateImage = (prompt: string): string => {
  const width = 800;
  const height = 600;
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(prompt)}`;
};

const mockGenerateVideo = (_prompt: string): string => {
  // In a real app, this would call a video generation API
  return 'https://example.com/generated-videos/sample-video.mp4';
};

const mockGenerateVoice = (_prompt: string): string => {
  // In a real app, this would call a voice generation API
  return 'https://example.com/generated-audio/sample-audio.mp3';
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Extract user ID from authorization header
    const userId = req.headers.authorization?.split(' ')[1] || 'user_123';
    
    // Extract generation prompt from request body
    const { prompt, type, parameters: _parameters, clientId }: GenerationPrompt = req.body;
    
    // Basic validation
    if (!prompt || !type || !clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt, type, and client ID are required' 
      });
    }
    
    // Validate generation type
    if (!['text', 'image', 'video', 'voice'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be one of: text, image, video, voice' 
      });
    }
    
    // Generate content based on type
    let content: string | string[];
    switch (type) {
      case 'text':
        content = await generateText(prompt, _parameters);
        break;
      case 'image':
        content = await generateImage(prompt, _parameters);
        break;
      case 'video':
        content = mockGenerateVideo(prompt);
        break;
      case 'voice':
        content = mockGenerateVoice(prompt);
        break;
      default:
        content = [];
    }
    
    // Create generation result
    const result: GenerationResult = {
      id: 'gen_' + Math.random().toString(36).substring(2, 9),
      type: type as 'text' | 'image' | 'video' | 'voice',
      content,
      prompt,
      dateCreated: new Date().toISOString(),
      clientId,
      userId,
    };
    
    // Return the result
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
