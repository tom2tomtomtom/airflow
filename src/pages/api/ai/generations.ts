import type { NextApiRequest, NextApiResponse } from 'next';
import { GenerationResult } from './generate';

type ResponseData = {
  success: boolean;
  message?: string;
  generations?: GenerationResult[];
  generation?: GenerationResult;
};

// Mock database for generations
let mockGenerations: GenerationResult[] = [
  {
    id: 'gen_1',
    type: 'text',
    content: [
      'Introducing our summer collection: vibrant colors, breathable fabrics, and styles that transition seamlessly from beach to dinner.',
      'Summer is calling. Answer with our new collection featuring sun-kissed hues and ocean-inspired designs.',
      'Embrace the warmth with our summer essentials - designed for comfort, styled for impact.'
    ],
    prompt: 'Generate marketing copy for summer clothing collection',
    dateCreated: '2023-05-05T10:30:00Z',
    clientId: 'client_1',
    userId: 'user_123',
  },
  {
    id: 'gen_2',
    type: 'image',
    content: 'https://via.placeholder.com/800x600?text=Product+Lifestyle+Image',
    prompt: 'Create a lifestyle image of product being used at the beach',
    dateCreated: '2023-05-04T14:15:00Z',
    clientId: 'client_1',
    userId: 'user_123',
  },
  {
    id: 'gen_3',
    type: 'text',
    content: [
      'Our commitment to sustainability goes beyond materials. We\'re reimagining our entire supply chain to minimize environmental impact.',
      'Sustainability isn\'t just a feature of our products--it\'s the foundation of our business model and vision for the future.'
    ],
    prompt: 'Generate sustainability statement for company website',
    dateCreated: '2023-05-03T09:45:00Z',
    clientId: 'client_2',
    userId: 'user_123',
  },
  {
    id: 'gen_4',
    type: 'voice',
    content: 'https://example.com/generated-audio/brand-voiceover.mp3',
    prompt: 'Create a professional voiceover for brand introduction',
    dateCreated: '2023-05-02T16:20:00Z',
    clientId: 'client_2',
    userId: 'user_123',
  },
  {
    id: 'gen_5',
    type: 'video',
    content: 'https://example.com/generated-videos/product-showcase.mp4',
    prompt: 'Generate a 15-second product showcase video',
    dateCreated: '2023-05-01T11:10:00Z',
    clientId: 'client_1',
    userId: 'user_123',
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Extract user ID from authorization header
    const userId = req.headers.authorization?.split(' ')[1] || 'user_123';
    
    // Extract client ID from query params if provided
    const { clientId } = req.query;
    
    // Filter generations by user ID
    let userGenerations = mockGenerations.filter(gen => gen.userId === userId);
    
    // Further filter by client ID if provided
    if (clientId && !Array.isArray(clientId)) {
      userGenerations = userGenerations.filter(gen => gen.clientId === clientId);
    }
    
    // Sort by date (newest first)
    userGenerations.sort((a, b) => 
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );
    
    // Return the generations
    return res.status(200).json({
      success: true,
      generations: userGenerations,
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
