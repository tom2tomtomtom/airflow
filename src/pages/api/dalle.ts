import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import OpenAI from 'openai';
import { z } from 'zod';
import axios from 'axios';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Request schema
const GenerateImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  client_id: z.string().uuid(),
  // DALL-E 3 specific options
  model: z.enum(['dall-e-3', 'dall-e-2']).default('dall-e-3'),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  style: z.enum(['vivid', 'natural']).default('vivid'),
  n: z.number().min(1).max(1).default(1), // DALL-E 3 only supports n=1
  // Metadata
  purpose: z.enum(['hero', 'background', 'product', 'social', 'banner', 'icon']).optional(),
  tags: z.array(z.string()).optional(),
  // Optional enhancement
  enhance_prompt: z.boolean().default(true), // Use AI to enhance the prompt
  brand_guidelines: z.any().optional(), // Include brand guidelines in prompt
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  // Get user info from headers
  const userId = req.headers['x-user-id'] as string;

  try {
    // Validate request
    const validationResult = GenerateImageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.errors,
      });
    }

    const { 
      prompt, 
      client_id,
      model,
      size,
      quality,
      style,
      n,
      purpose,
      tags = [],
      enhance_prompt,
      brand_guidelines
    } = validationResult.data;

    // Enhance prompt if requested
    let finalPrompt = prompt;
    
    if (enhance_prompt) {
      const enhancementResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert at crafting DALL-E 3 prompts. \nEnhance the user's prompt to get better results by adding:\n- Specific visual style details\n- Lighting and composition\n- Color palette\n- Medium (photo, illustration, 3D render, etc.)\n${brand_guidelines ? `- Ensure it aligns with these brand guidelines: ${JSON.stringify(brand_guidelines)}` : ''}\nKeep the core concept but make it more visually specific.`
          },
          {
            role: 'user',
            content: `Enhance this image prompt for ${purpose || 'general'} use: ${prompt}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      // Add proper null checking for TypeScript
      if (enhancementResponse.choices && 
          enhancementResponse.choices.length > 0 && 
          enhancementResponse.choices[0].message && 
          enhancementResponse.choices[0].message.content) {
        finalPrompt = enhancementResponse.choices[0].message.content;
      }
    }

    // Add safety prefix for brand safety
    const safetyPrefix = "Professional, brand-safe, high-quality";
    finalPrompt = `${safetyPrefix} ${finalPrompt}`;

    console.log('Generating image with prompt:', finalPrompt);

    // Generate image with DALL-E
    const imageResponse = await openai.images.generate({
      model,
      prompt: finalPrompt,
      n,
      size,
      quality,
      style,
      response_format: 'url',
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error('No image generated');
    }

    const generatedImage = imageResponse.data[0];
    
    // Download the image to upload to Supabase
    const imageUrl = generatedImage.url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    // Download image
    const imageData = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    
    const buffer = Buffer.from(imageData.data);
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `dalle-${purpose || 'image'}-${timestamp}.png`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(`${client_id}/ai-generated/${filename}`, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save generated image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(`${client_id}/ai-generated/${filename}`);

    // Create asset record
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        name: `AI Generated: ${prompt.substring(0, 50)}...`,
        type: 'image',
        url: urlData.publicUrl,
        thumbnail_url: urlData.publicUrl,
        mime_type: 'image/png',
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1]),
        client_id,
        tags: [...tags, 'ai-generated', 'dalle-3', purpose].filter(Boolean),
        metadata: {
          ai_model: model,
          original_prompt: prompt,
          enhanced_prompt: finalPrompt,
          generation_settings: {
            size,
            quality,
            style,
          },
          revised_prompt: generatedImage.revised_prompt, // DALL-E 3 may revise prompts
          purpose,
          generated_at: new Date().toISOString(),
        },
        created_by: userId,
      })
      .select()
      .single();

    if (assetError) {
      console.error('Asset creation error:', assetError);
      throw new Error('Failed to create asset record');
    }

    return res.status(200).json({
      success: true,
      message: 'Image generated successfully',
      asset,
      generation_details: {
        original_prompt: prompt,
        enhanced_prompt: enhance_prompt ? finalPrompt : undefined,
        revised_prompt: generatedImage.revised_prompt,
        model,
        settings: { size, quality, style },
      },
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prompt or parameters',
          error: error.message,
        });
      }
      if (error.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
