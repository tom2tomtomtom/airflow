import type { NextApiRequest, NextApiResponse } from 'next';

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'voice';
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  dateCreated: string;
  clientId: string;
  userId: string;
  favorite?: boolean;
}

type ResponseData = {
  success: boolean;
  message?: string;
  assets?: Asset[];
  asset?: Asset;
};

// Mock database for assets
let mockAssets: Asset[] = [
  {
    id: 'asset_1',
    name: 'Product Image 1',
    type: 'image',
    url: 'https://via.placeholder.com/800x600',
    thumbnailUrl: 'https://via.placeholder.com/200x150',
    description: 'Main product image for the summer collection',
    tags: ['product', 'summer', 'featured'],
    dateCreated: '2023-05-01',
    clientId: 'client_1',
    userId: 'user_123',
    favorite: true,
  },
  {
    id: 'asset_2',
    name: 'Product Video',
    type: 'video',
    url: 'https://example.com/videos/product-demo.mp4',
    thumbnailUrl: 'https://via.placeholder.com/200x150',
    description: 'Product demonstration video',
    tags: ['product', 'demo', 'video'],
    dateCreated: '2023-04-28',
    clientId: 'client_1',
    userId: 'user_123',
    favorite: false,
  },
  {
    id: 'asset_3',
    name: 'Marketing Copy',
    type: 'text',
    url: 'https://example.com/text/marketing-copy.txt',
    description: 'Marketing copy for summer campaign',
    tags: ['copy', 'marketing', 'summer'],
    dateCreated: '2023-04-25',
    clientId: 'client_1',
    userId: 'user_123',
    favorite: false,
  },
  {
    id: 'asset_4',
    name: 'Brand Voiceover',
    type: 'voice',
    url: 'https://example.com/audio/brand-voiceover.mp3',
    description: 'Official brand voiceover for commercials',
    tags: ['voice', 'brand', 'commercial'],
    dateCreated: '2023-04-20',
    clientId: 'client_1',
    userId: 'user_123',
    favorite: true,
  },
  {
    id: 'asset_5',
    name: 'Logo Image',
    type: 'image',
    url: 'https://via.placeholder.com/500x500',
    thumbnailUrl: 'https://via.placeholder.com/100x100',
    description: 'Company logo in high resolution',
    tags: ['logo', 'brand', 'identity'],
    dateCreated: '2023-04-15',
    clientId: 'client_2',
    userId: 'user_123',
    favorite: true,
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Extract user ID from authorization header or query
  // In a real app, you would validate the token
  const userId = req.headers.authorization?.split(' ')[1] || 'user_123';
  
  // Extract client ID from query params if provided
  const { clientId } = req.query;

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getAssets(req, res, userId, clientId as string | undefined);
    case 'POST':
      return createAsset(req, res, userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// GET - Retrieve assets for a user, optionally filtered by client
function getAssets(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string,
  clientId?: string
) {
  try {
    // Filter assets by user ID
    let userAssets = mockAssets.filter(asset => asset.userId === userId);
    
    // Further filter by client ID if provided
    if (clientId) {
      userAssets = userAssets.filter(asset => asset.clientId === clientId);
    }
    
    return res.status(200).json({
      success: true,
      assets: userAssets,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// POST - Create a new asset
function createAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
  try {
    const { name, type, url, thumbnailUrl, description, tags, clientId } = req.body;

    // Basic validation
    if (!name || !type || !url || !clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, type, URL, and client ID are required' 
      });
    }

    // Validate asset type
    if (!['image', 'video', 'text', 'voice'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be one of: image, video, text, voice' 
      });
    }

    // Create new asset
    const newAsset: Asset = {
      id: 'asset_' + Math.random().toString(36).substring(2, 9),
      name,
      type: type as 'image' | 'video' | 'text' | 'voice',
      url,
      thumbnailUrl,
      description,
      tags: tags || [],
      dateCreated: new Date().toISOString().split('T')[0],
      clientId,
      userId,
      favorite: false,
    };

    // Add to mock database
    mockAssets.push(newAsset);

    return res.status(201).json({
      success: true,
      asset: newAsset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
