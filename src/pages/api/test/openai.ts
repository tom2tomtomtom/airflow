import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface TestResponse {
  success: boolean;
  message?: string;
  error?: string;
  model?: string;
  timestamp?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
): Promise<void> {
  // Only allow GET requests for testing
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed - use GET' 
    });
  }

  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Testing OpenAI connection...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use more cost-effective model for testing
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant testing the AIrWAVE integration." 
        },
        { 
          role: "user", 
          content: "Say 'OpenAI integration is working perfectly! Ready for AIrWAVE content generation.'" 
        }
      ],
      max_tokens: 100,
      temperature: 0.1,
    });

    const message = completion.choices[0]?.message?.content;
    
    if (!message) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI test successful:', message);

    return res.status(200).json({ 
      success: true, 
      message: message.trim(),
      model: completion.model,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('OpenAI test failed:', error);
    
    // Handle specific OpenAI errors
    let errorMessage = 'Unknown error';
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key';
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'OpenAI rate limit exceeded';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
  maxDuration: 30,
};