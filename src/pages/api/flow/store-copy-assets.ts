import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { supabase } from '@/lib/supabase/client';

interface CopyVariation {
  id: string;
  text: string;
  platform: string;
  motivation: string;
  wordCount: number;
  tone: string;
  cta: string;
}

interface StoreCopyRequest {
  selectedCopy: CopyVariation[];
  briefTitle: string;
  clientId: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const user = (req as any).user;
  const { selectedCopy, briefTitle, clientId }: StoreCopyRequest = req.body;
  
  if (!selectedCopy || !Array.isArray(selectedCopy) || selectedCopy.length === 0) {
    return res.status(400).json({ success: false, message: 'Selected copy variations are required' });
  }

  if (!clientId) {
    return res.status(400).json({ success: false, message: 'Client ID is required' });
  }

  try {
    console.log(`Storing ${selectedCopy.length} copy variations as assets`);

    // Store each copy variation as a text asset
    const storedAssets = [];
    
    for (const copy of selectedCopy) {
      const assetData = {
        name: `Copy: ${copy.text.substring(0, 30)}${copy.text.length > 30 ? '...' : ''}`,
        type: 'text',
        url: '', // Text assets don't need URLs
        description: `Generated copy for ${copy.platform} - ${copy.motivation} motivation`,
        tags: [
          'copy',
          'generated',
          copy.platform.toLowerCase(),
          copy.motivation.toLowerCase().replace(/\s+/g, '_'),
          copy.tone,
          briefTitle.toLowerCase().replace(/\s+/g, '_')
        ],
        client_id: clientId,
        created_by: user.id,
        metadata: {
          copyData: {
            text: copy.text,
            platform: copy.platform,
            motivation: copy.motivation,
            wordCount: copy.wordCount,
            tone: copy.tone,
            cta: copy.cta,
            generatedFrom: 'flow_workflow',
            briefTitle: briefTitle
          },
          type: 'generated_copy',
          workflow_step: 'copy_generation'
        }
      };

      const { data: asset, error } = await supabase
        .from('assets')
        .insert(assetData)
        .select()
        .single();

      if (error) {
        console.error('Error storing copy asset:', error);
        throw new Error(`Failed to store copy: ${copy.text.substring(0, 20)}...`);
      }

      storedAssets.push({
        assetId: asset.id,
        copyId: copy.id,
        text: copy.text,
        platform: copy.platform
      });
    }

    console.log(`Successfully stored ${storedAssets.length} copy assets`);

    return res.status(200).json({
      success: true,
      data: {
        storedAssets,
        count: storedAssets.length
      },
      message: `${storedAssets.length} copy variations stored in assets library`
    });

  } catch (error) {
    console.error('Error storing copy assets:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to store copy assets'
    });
  }
}

export default withAuth(handler);