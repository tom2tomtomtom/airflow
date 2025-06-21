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
import { successResponse, errorResponse, handleApiError, methodNotAllowed, ApiErrorCode } from '@/lib/api-response';
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
        return errorResponse(res, ApiErrorCode.NOT_FOUND, `Workflow endpoint '${endpoint}' not found`, 404);
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

  return successResponse(res, {
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
    updatedAt: workflow.updated_at
  }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function updateWorkflowState(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { workflowId, ...updates } = context.body;

  if (!workflowId) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Workflow ID is required', 400);
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  // Map frontend fields to database fields
  if (updates.currentStep !== undefined) updateData.current_step = updates.currentStep;
  if (updates.briefData !== undefined) updateData.brief_data = updates.briefData;
  if (updates.motivations !== undefined) updateData.motivations = updates.motivations;
  if (updates.copyVariations !== undefined) updateData.copy_variations = updates.copyVariations;
  if (updates.selectedAssets !== undefined) updateData.selected_assets = updates.selectedAssets;
  if (updates.selectedTemplate !== undefined) updateData.selected_template = updates.selectedTemplate;
  if (updates.processing !== undefined) updateData.processing = updates.processing;
  if (updates.lastError !== undefined) updateData.last_error = updates.lastError;
  if (updates.clientId !== undefined) updateData.client_id = updates.clientId;

  const { data: workflow, error } = await supabase
    .from('workflow_sessions')
    .upsert({
      id: workflowId,
      user_id: context.user.id,
      ...updateData
    }, {
      onConflict: 'id'
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update workflow: ${error.message}`);
  }

  return successResponse(res, {
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
    updatedAt: workflow.updated_at
  }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function deleteWorkflowState(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
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
    timestamp: new Date().toISOString()
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
  // Implementation similar to existing workflow assets API
  return successResponse(res, [], 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function selectWorkflowAssets(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  // Implementation for selecting assets
  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function removeWorkflowAsset(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  // Implementation for removing assets
  return successResponse(res, { success: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
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
  return successResponse(res, { generatedAssets: [] }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

// Placeholder implementations for other endpoints
async function handleBrief(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  return successResponse(res, { success: true }, 200, { requestId: context.requestId, timestamp: new Date().toISOString() });
}

async function handleMotivations(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  return successResponse(res, { success: true }, 200, { requestId: context.requestId, timestamp: new Date().toISOString() });
}

async function handleCopy(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  return successResponse(res, { success: true }, 200, { requestId: context.requestId, timestamp: new Date().toISOString() });
}

async function handleTemplates(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  return successResponse(res, { success: true }, 200, { requestId: context.requestId, timestamp: new Date().toISOString() });
}

async function handleMatrix(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  return successResponse(res, { success: true }, 200, { requestId: context.requestId, timestamp: new Date().toISOString() });
}

async function handleRender(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  return successResponse(res, { success: true }, 200, { requestId: context.requestId, timestamp: new Date().toISOString() });
}
