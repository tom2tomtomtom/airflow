/**
 * API v2 Workflow Route Handler
 *
 * Handles all workflow-related endpoints:
 * - /api/v2/workflow/state - Workflow state management
 * - /api/v2/workflow/assets - Asset selection for workflows
 * - /api/v2/workflow/generate-assets - AI asset generation
 * - /api/v2/workflow/brief - Brief upload and parsing
 * - /api/v2/workflow/motivations - Motivation generation and selection
 * - /api/v2/workflow/copy - Copy generation and selection
 * - /api/v2/workflow/templates - Template selection
 * - /api/v2/workflow/matrix - Campaign matrix building
 * - /api/v2/workflow/render - Final rendering
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import {
  successResponse,
  errorResponse,
  handleApiError,
  methodNotAllowed,
  ApiErrorCode,
} from '@/lib/api-response';
import { withCostTracking } from '../[...route]';

interface RouteContext {
  user: any;
  route: string[];
  method: string;
  body: any;
  query: any;
  startTime: number;
  requestId: string;
}

export async function handleWorkflowRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext,
  subRoute: string[]
): Promise<void> {
  try {
    if (!context.user?.id) {
      return errorResponse(res, ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const [endpoint, ...params] = subRoute;

    switch (endpoint) {
      case 'state':
        return await handleWorkflowState(req, res, context);

      case 'assets':
        return await handleWorkflowAssets(req, res, context);

      case 'generate-assets':
        return await handleGenerateAssets(req, res, context);

      case 'brief':
        return await handleBrief(req, res, context);

      case 'motivations':
        return await handleMotivations(req, res, context);

      case 'copy':
        return await handleCopy(req, res, context);

      case 'templates':
        return await handleTemplates(req, res, context);

      case 'matrix':
        return await handleMatrix(req, res, context);

      case 'render':
        return await handleRender(req, res, context);

      default:
        return errorResponse(
          res,
          ApiErrorCode.NOT_FOUND,
          `Workflow endpoint '${endpoint}' not found`,
          404
        );
    }
  } catch (error) {
    return handleApiError(res, error, 'workflow routes');
  }
}

// Workflow state management
async function handleWorkflowState(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
): Promise<void> {
  switch (context.method) {
    case 'GET':
      return await getWorkflowState(req, res, context);
    case 'POST':
      return await updateWorkflowState(req, res, context);
    case 'DELETE':
      return await deleteWorkflowState(req, res, context);
    default:
      return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  }
}

async function getWorkflowState(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId } = context.query;

  if (!workflowId) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Workflow ID is required', 400);
  }

  const { data: workflow, error } = await supabase
    .from('workflow_sessions')
    .select('*')
    .eq('id', workflowId)
    .eq('user_id', context.user.id)
    .single();

  if (error || !workflow) {
    return errorResponse(res, ApiErrorCode.NOT_FOUND, 'Workflow session not found', 404);
  }

  return successResponse(
    res,
    {
      id: workflow.id,
      userId: workflow.user_id,
      clientId: workflow.client_id,
      currentStep: workflow.current_step || 0,
      briefData: workflow.brief_data,
      motivations: workflow.motivations || [],
      copyVariations: workflow.copy_variations || [],
      selectedAssets: workflow.selected_assets || [],
      selectedTemplate: workflow.selected_template,
      processing: workflow.processing || false,
      lastError: workflow.last_error,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}

async function updateWorkflowState(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
) {
  const { workflowId, ...updates } = context.body;

  if (!workflowId) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Workflow ID is required', 400);
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  // Map frontend fields to database fields
  if (updates.currentStep !== undefined) updateData.current_step = updates.currentStep;
  if (updates.briefData !== undefined) updateData.brief_data = updates.briefData;
  if (updates.motivations !== undefined) updateData.motivations = updates.motivations;
  if (updates.copyVariations !== undefined) updateData.copy_variations = updates.copyVariations;
  if (updates.selectedAssets !== undefined) updateData.selected_assets = updates.selectedAssets;
  if (updates.selectedTemplate !== undefined)
    updateData.selected_template = updates.selectedTemplate;
  if (updates.processing !== undefined) updateData.processing = updates.processing;
  if (updates.lastError !== undefined) updateData.last_error = updates.lastError;
  if (updates.clientId !== undefined) updateData.client_id = updates.clientId;

  const { data: workflow, error } = await supabase
    .from('workflow_sessions')
    .upsert(
      {
        id: workflowId,
        user_id: context.user.id,
        ...updateData,
      },
      {
        onConflict: 'id',
      }
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update workflow: ${error.message}`);
  }

  return successResponse(
    res,
    {
      id: workflow.id,
      userId: workflow.user_id,
      clientId: workflow.client_id,
      currentStep: workflow.current_step || 0,
      briefData: workflow.brief_data,
      motivations: workflow.motivations || [],
      copyVariations: workflow.copy_variations || [],
      selectedAssets: workflow.selected_assets || [],
      selectedTemplate: workflow.selected_template,
      processing: workflow.processing || false,
      lastError: workflow.last_error,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}

async function deleteWorkflowState(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
) {
  const { workflowId } = context.query;

  if (!workflowId) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Workflow ID is required', 400);
  }

  const { error } = await supabase
    .from('workflow_sessions')
    .delete()
    .eq('id', workflowId)
    .eq('user_id', context.user.id);

  if (error) {
    throw new Error(`Failed to delete workflow: ${error.message}`);
  }

  return successResponse(res, { deleted: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

// Workflow assets management
async function handleWorkflowAssets(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
): Promise<void> {
  switch (context.method) {
    case 'GET':
      return await getWorkflowAssets(req, res, context);
    case 'POST':
      return await selectWorkflowAssets(req, res, context);
    case 'DELETE':
      return await removeWorkflowAsset(req, res, context);
    default:
      return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  }
}

async function getWorkflowAssets(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { clientId } = context.query;

  // Get assets for the client or user
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .eq(clientId ? 'client_id' : 'created_by', clientId || context.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch assets: ${error.message}`);
  }

  return successResponse(res, { assets: assets || [] }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function selectWorkflowAssets(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
) {
  // Implementation for selecting assets
  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function removeWorkflowAsset(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
) {
  // Implementation for removing assets
  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

// AI asset generation with cost tracking
async function handleGenerateAssets(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
): Promise<void> {
  if (context.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  // Apply cost tracking middleware
  const costAllowed = await withCostTracking(req, res, context, 'ai_asset_generation', 0.04);
  if (!costAllowed) {
    return; // Response already sent by cost tracking
  }

  // Implementation for AI asset generation
  const { workflowId, prompt, style, count = 1 } = context.body;

  if (!workflowId || !prompt) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and prompt are required',
      400
    );
  }

  // Generate a unique generation ID
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return successResponse(
    res,
    {
      generationId,
      status: 'processing',
      estimatedTime: count * 30, // 30 seconds per image
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}

// Brief processing
async function handleBrief(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  const { workflowId, briefContent, briefUrl, briefType } = context.body;

  if (!workflowId || (!briefContent && !briefUrl)) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and brief content or URL are required',
      400
    );
  }

  // Generate a unique brief ID
  const briefId = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store brief data in workflow session
  const { error } = await supabase
    .from('workflow_sessions')
    .update({
      brief_data: {
        briefId,
        content: briefContent,
        url: briefUrl,
        type: briefType || 'text',
        processedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('user_id', context.user.id);

  if (error) {
    throw new Error(`Failed to save brief: ${error.message}`);
  }

  return successResponse(
    res,
    {
      briefId,
      status: 'processed',
      extractedData: {
        title: 'Extracted Campaign Title',
        objective: 'Campaign objective extracted from brief',
        targetAudience: 'Target audience identified',
      },
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}

async function handleMotivations(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  switch (context.method) {
    case 'POST':
      return await generateMotivations(req, res, context);
    case 'PUT':
      return await selectMotivations(req, res, context);
    default:
      return methodNotAllowed(res, ['POST', 'PUT']);
  }
}

async function generateMotivations(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
) {
  const { workflowId, briefId, count = 5 } = context.body;

  if (!workflowId || !briefId) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and brief ID are required',
      400
    );
  }

  // Generate sample motivations based on brief
  const motivations = Array.from({ length: count }, (_, i) => ({
    id: `motivation_${i + 1}`,
    title: `Motivation ${i + 1}`,
    description: `Generated motivation ${i + 1} based on brief analysis`,
    category: ['emotional', 'rational', 'social'][i % 3],
    strength: Math.floor(Math.random() * 100) + 1,
  }));

  return successResponse(res, { motivations }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function selectMotivations(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId, selectedMotivations } = context.body;

  if (!workflowId || !selectedMotivations) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and selected motivations are required',
      400
    );
  }

  // Update workflow with selected motivations
  const { error } = await supabase
    .from('workflow_sessions')
    .update({
      motivations: selectedMotivations,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('user_id', context.user.id);

  if (error) {
    throw new Error(`Failed to save motivations: ${error.message}`);
  }

  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function handleCopy(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  switch (context.method) {
    case 'POST':
      return await generateCopy(req, res, context);
    case 'PUT':
      return await selectCopy(req, res, context);
    default:
      return methodNotAllowed(res, ['POST', 'PUT']);
  }
}

async function generateCopy(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId, motivationIds, copyType, platform } = context.body;

  if (!workflowId || !motivationIds) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and motivation IDs are required',
      400
    );
  }

  // Generate sample copy variations
  const copyVariations = motivationIds.flatMap((motivationId: string, index: number) =>
    Array.from({ length: 3 }, (_, i) => ({
      id: `copy_${motivationId}_${i + 1}`,
      motivationId,
      headline: `Compelling headline ${index + 1}.${i + 1}`,
      body: `Engaging copy body for ${copyType} on ${platform}. Variation ${i + 1}.`,
      cta: `Action ${i + 1}`,
      platform: platform || 'general',
      type: copyType || 'social_media',
    }))
  );

  return successResponse(res, { copyVariations }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function selectCopy(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId, selectedCopy } = context.body;

  if (!workflowId || !selectedCopy) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and selected copy are required',
      400
    );
  }

  // Update workflow with selected copy
  const { error } = await supabase
    .from('workflow_sessions')
    .update({
      copy_variations: selectedCopy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('user_id', context.user.id);

  if (error) {
    throw new Error(`Failed to save copy: ${error.message}`);
  }

  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function handleTemplates(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  switch (context.method) {
    case 'GET':
      return await getTemplates(req, res, context);
    case 'POST':
      return await selectTemplate(req, res, context);
    default:
      return methodNotAllowed(res, ['GET', 'POST']);
  }
}

async function getTemplates(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { platform, format } = context.query;

  // Generate sample templates
  const templates = [
    {
      id: 'template_1',
      name: 'Professional Business Template',
      platform: platform || 'facebook',
      format: format || 'video',
      thumbnail: 'https://example.com/template1.jpg',
      description: 'Clean, professional template for business content',
    },
    {
      id: 'template_2',
      name: 'Creative Social Template',
      platform: platform || 'facebook',
      format: format || 'video',
      thumbnail: 'https://example.com/template2.jpg',
      description: 'Eye-catching template for social media engagement',
    },
    {
      id: 'template_3',
      name: 'Minimalist Template',
      platform: platform || 'facebook',
      format: format || 'video',
      thumbnail: 'https://example.com/template3.jpg',
      description: 'Simple, elegant template with focus on content',
    },
  ];

  return successResponse(res, { templates }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function selectTemplate(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId, templateId } = context.body;

  if (!workflowId || !templateId) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and template ID are required',
      400
    );
  }

  // Update workflow with selected template
  const { error } = await supabase
    .from('workflow_sessions')
    .update({
      selected_template: templateId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('user_id', context.user.id);

  if (error) {
    throw new Error(`Failed to save template: ${error.message}`);
  }

  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function handleMatrix(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  const { workflowId, selectedAssets, selectedCopy, templateId } = context.body;

  if (!workflowId || !selectedAssets || !selectedCopy || !templateId) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID, selected assets, copy, and template are required',
      400
    );
  }

  // Generate campaign matrix
  const matrix = {
    id: `matrix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workflowId,
    templateId,
    combinations: selectedAssets.flatMap((asset: any) =>
      selectedCopy.map((copy: any) => ({
        id: `combo_${asset.id || asset}_${copy.id || copy}`,
        assetId: asset.id || asset,
        copyId: copy.id || copy,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }))
    ),
    totalCombinations: selectedAssets.length * selectedCopy.length,
    status: 'generated',
    createdAt: new Date().toISOString(),
  };

  return successResponse(res, { matrix }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function handleRender(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  switch (context.method) {
    case 'GET':
      return await getRenderStatus(req, res, context);
    case 'POST':
      return await startRender(req, res, context);
    default:
      return methodNotAllowed(res, ['GET', 'POST']);
  }
}

async function startRender(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId, matrixId, renderOptions } = context.body;

  if (!workflowId || !matrixId) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Workflow ID and matrix ID are required',
      400
    );
  }

  // Generate render ID and start rendering process
  const renderId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return successResponse(
    res,
    {
      renderId,
      status: 'queued',
      estimatedTime: 300, // 5 minutes
      options: renderOptions || { quality: 'high', format: 'mp4' },
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}

async function getRenderStatus(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { renderId } = context.query;

  if (!renderId) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Render ID is required', 400);
  }

  // Mock render status
  const status = ['queued', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)];

  return successResponse(
    res,
    {
      renderId,
      status,
      progress:
        status === 'processing'
          ? Math.floor(Math.random() * 100)
          : status === 'completed'
            ? 100
            : 0,
      outputUrl: status === 'completed' ? `https://example.com/renders/${renderId}.mp4` : null,
      error: status === 'failed' ? 'Rendering failed due to template error' : null,
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}
