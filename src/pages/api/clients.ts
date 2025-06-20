import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { withAPIRateLimit } from '@/lib/rate-limiter';
import { successResponse, errorResponse, handleApiError, methodNotAllowed, validateRequiredFields, createPaginationMeta, ApiErrorCode } from '@/lib/api-response';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Initialize Supabase client
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
// GET handler - List clients with filtering and pagination
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  try {
    const {
      search,
      industry,
      limit = 50,
      offset = 0,
      sort_by = 'name',
      sort_order = 'asc',
      include_stats = false,
    } = req.query;

    // Build query
    let query = supabase
      .from('clients')
      .select(`
        *
        ${include_stats === 'true' ? `,
          campaigns(count),
          assets(count),
          matrices(count)
        ` : ''}
      `);

    // Apply search filter
    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    // Apply industry filter
    if (industry && typeof industry === 'string') {
      query = query.eq('industry', industry);
    }

    // Apply sorting
    const validSortFields = ['name', 'industry', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'name';
    const ascending = sort_order === 'asc';
    query = query.order(sortField, { ascending });

    // Apply pagination
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    // Execute query
    const { data: clients, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    // Create pagination metadata
    const paginationMeta = createPaginationMeta(
      Math.floor(offsetNum / limitNum) + 1,
      limitNum,
      count || 0
    );

    return successResponse(res, clients, 200, {
      pagination: paginationMeta,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(res, error, 'handleGet');
  }
}
// POST handler - Create new client
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  try {
    const {
      name,
      industry,
      description,
      website,
      logo,
      primaryColor,
      secondaryColor,
      socialMedia,
      brand_guidelines,
      contacts
    } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['name', 'industry']);
    if (missingFields.length > 0) {
      return errorResponse(
        res,
        ApiErrorCode.VALIDATION_ERROR,
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingClient) {
      return errorResponse(
        res,
        ApiErrorCode.VALIDATION_ERROR,
        'A client with this name already exists',
        400
      );
    }
    // Prepare client data
    const clientData = {
      name,
      slug,
      industry,
      description: description || null,
      website: website || null,
      logo_url: logo || null,
      primary_color: primaryColor || '#1976d2',
      secondary_color: secondaryColor || '#dc004e',
      social_media: socialMedia || {},
      brand_guidelines: brand_guidelines || {
        voiceTone: '',
        targetAudience: '',
        keyMessages: []
      },
      is_active: true,
    };

    // Create client in Supabase
    const { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    // Create contacts if provided
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
      const contactsData = contacts.map((contact: any) => ({
        client_id: client.id,
        name: contact.name,
        email: contact.email,
        role: contact.role || null,
        phone: contact.phone || null,
      }));

      const { error: contactsError } = await supabase
        .from('client_contacts')
        .insert(contactsData);

      if (contactsError) {
        // Log error but don't fail the request
        console.error('Failed to create contacts:', contactsError);
      }
    }

    return successResponse(res, client, 201);
  } catch (error) {
    return handleApiError(res, error, 'handlePost');
  }
}

// Main handler
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = (req as any).user;

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user);
      case 'POST':
        return await handlePost(req, res, user);
      default:
        return methodNotAllowed(res, ['GET', 'POST']);
    }
  } catch (error) {
    return handleApiError(res, error, 'clients handler');
  }
}

// Apply authentication and rate limiting
export default withAuth(withAPIRateLimit(handler));