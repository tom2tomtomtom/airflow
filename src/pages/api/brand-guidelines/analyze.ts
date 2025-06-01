import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import OpenAI from 'openai';
import { env, hasOpenAI } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface BrandGuidelines {
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  toneOfVoice: {
    personality: string[];
    communication_style: string;
    dos: string[];
    donts: string[];
  };
  typography: {
    primary_font: string;
    secondary_font: string;
    font_weights: string[];
  };
  logoGuidelines?: {
    usage_rules: string[];
    spacing: string;
    variations: string[];
  };
  imagery?: {
    style: string;
    guidelines: string[];
  };
}

interface AnalysisResponse {
  success: boolean;
  guidelines?: BrandGuidelines;
  clientId?: string;
  error?: string;
}

// Initialize OpenAI client
const openai = hasOpenAI ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

async function extractTextFromFile(file: formidable.File): Promise<string> {
  const buffer = await fs.readFile(file.filepath);
  
  if (file.mimetype === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (file.mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }
}

async function analyzeBrandGuidelines(text: string): Promise<BrandGuidelines> {
  if (!openai) {
    // Fallback analysis for when OpenAI is not available
    return mockAnalyzeBrandGuidelines(text);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a brand analysis expert. Analyze the provided brand guidelines document and extract key information in a structured JSON format. Extract:
          
          1. Colors (hex codes if mentioned, or color names)
          2. Tone of voice and communication style
          3. Typography/fonts
          4. Logo usage guidelines
          5. Imagery style guidelines
          
          Return ONLY a valid JSON object with this structure:
          {
            "colors": {
              "primary": ["#color1", "#color2"],
              "secondary": ["#color3"],
              "accent": ["#color4"]
            },
            "toneOfVoice": {
              "personality": ["trait1", "trait2"],
              "communication_style": "description",
              "dos": ["guideline1", "guideline2"],
              "donts": ["avoid1", "avoid2"]
            },
            "typography": {
              "primary_font": "font name",
              "secondary_font": "font name",
              "font_weights": ["weight1", "weight2"]
            },
            "logoGuidelines": {
              "usage_rules": ["rule1", "rule2"],
              "spacing": "spacing info",
              "variations": ["variation1", "variation2"]
            },
            "imagery": {
              "style": "style description",
              "guidelines": ["guideline1", "guideline2"]
            }
          }`
        },
        {
          role: 'user',
          content: `Analyze this brand guidelines document and extract the key brand elements:\n\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Fallback to mock analysis
      return mockAnalyzeBrandGuidelines(text);
    }
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return mockAnalyzeBrandGuidelines(text);
  }
}

function mockAnalyzeBrandGuidelines(text: string): BrandGuidelines {
  // Simple text analysis for fallback
  const lowerText = text.toLowerCase();
  
  // Extract colors using basic pattern matching
  const colorPatterns = [
    /#[0-9a-f]{6}/gi,
    /#[0-9a-f]{3}/gi,
    /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi
  ];
  
  const foundColors: string[] = [];
  colorPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foundColors.push(...matches);
    }
  });

  // Extract fonts
  const fontKeywords = ['font', 'typeface', 'typography'];
  const fonts: string[] = [];
  fontKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}[:\\s]+([^\\n\\.]+)`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        const fontName = match.replace(new RegExp(keyword, 'gi'), '').replace(/[:\s]+/, '').trim();
        if (fontName) fonts.push(fontName);
      });
    }
  });

  // Analyze tone
  const toneKeywords = {
    professional: ['professional', 'formal', 'business', 'corporate'],
    friendly: ['friendly', 'approachable', 'warm', 'welcoming'],
    modern: ['modern', 'contemporary', 'cutting-edge', 'innovative'],
    trustworthy: ['trustworthy', 'reliable', 'credible', 'authentic']
  };

  const toneTraits: string[] = [];
  Object.entries(toneKeywords).forEach(([trait, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      toneTraits.push(trait);
    }
  });

  return {
    colors: {
      primary: foundColors.slice(0, 2),
      secondary: foundColors.slice(2, 4),
      accent: foundColors.slice(4, 6)
    },
    toneOfVoice: {
      personality: toneTraits.length > 0 ? toneTraits : ['professional', 'trustworthy'],
      communication_style: toneTraits.length > 0 ? toneTraits.join(', ') : 'Professional and trustworthy',
      dos: ['Be clear and concise', 'Maintain brand voice'],
      donts: ['Use jargon unnecessarily', 'Be overly casual']
    },
    typography: {
      primary_font: fonts[0] || 'Not specified',
      secondary_font: fonts[1] || 'Not specified',
      font_weights: ['Regular', 'Bold']
    },
    logoGuidelines: {
      usage_rules: ['Maintain clear space', 'Use approved colors only'],
      spacing: 'Minimum clear space equal to logo height',
      variations: ['Primary', 'Secondary', 'Monochrome']
    },
    imagery: {
      style: 'Professional and on-brand',
      guidelines: ['High quality images', 'Consistent style']
    }
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get client ID from headers or query
    const clientId = req.headers['x-client-id'] as string || req.query.clientId as string;
    
    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      maxFiles: 1,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Extract text from document
    const documentText = await extractTextFromFile(file);
    
    if (!documentText || documentText.trim().length < 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document appears to be empty or too short for analysis' 
      });
    }

    // Analyze the document with AI
    const guidelines = await analyzeBrandGuidelines(documentText);

    // Save guidelines to client profile
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        brand_guidelines: guidelines,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Error saving brand guidelines:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save brand guidelines to client profile' 
      });
    }

    // Clean up temporary file
    try {
      await fs.unlink(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    return res.status(200).json({
      success: true,
      guidelines,
      clientId
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Brand guidelines analysis error:', error);
    return res.status(500).json({
      success: false,
      error: message || 'Failed to analyze brand guidelines'
    });
  }
}