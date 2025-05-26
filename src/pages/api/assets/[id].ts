import type { NextApiRequest, NextApiResponse } from 'next';
import { Asset } from './index';

type ResponseData = {
  success: boolean;
  message?: string;
  asset?: Asset;
};

// Mock database for assets (same as in index.ts)
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
  // Extract asset ID from the URL
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, message: 'Invalid asset ID' });
  }

  // Extract user ID from authorization header
  // In a real app, you would validate the token
  const userId = req.headers.authorization?.split(' ')[1] || 'user_123';

  // Find the asset
  const assetIndex = mockAssets.findIndex(a => a.id === id && a.userId === userId);
  
  if (assetIndex === -1) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getAsset(req, res, assetIndex);
    case 'PUT':
      return updateAsset(req, res, assetIndex);
    case 'DELETE':
      return deleteAsset(req, res, assetIndex);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// GET - Retrieve a specific asset
function getAsset(
  _req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  assetIndex: number
) {
  try {
    const asset = mockAssets[assetIndex];
    
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    
    return res.status(200).json({
      success: true,
      asset: asset,
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// PUT - Update an asset
function updateAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  assetIndex: number
) {
  try {
    const existingAsset = mockAssets[assetIndex];
    
    if (!existingAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    
    const { name, url, thumbnailUrl, description, tags, favorite } = req.body;

    // Update asset data
    const updatedAsset = {
      ...existingAsset,
      name: name || existingAsset.name,
      url: url || existingAsset.url,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existingAsset.thumbnailUrl,
      description: description !== undefined ? description : existingAsset.description,
      tags: tags || existingAsset.tags,
      favorite: favorite !== undefined ? favorite : existingAsset.favorite,
    };

    // Update in mock database
    mockAssets[assetIndex] = updatedAsset;

    return res.status(200).json({
      success: true,
      asset: updatedAsset,
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// DELETE - Remove an asset
function deleteAsset(
  _req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  assetIndex: number
) {
  try {
    // Check if asset exists
    const deletedAsset = mockAssets[assetIndex];
    
    if (!deletedAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    
    // Remove from mock database
    mockAssets = mockAssets.filter((_, index) => index !== assetIndex);

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      asset: deletedAsset,
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
