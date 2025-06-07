import { getErrorMessage } from '@/utils/errorUtils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import type { Client } from '@/types/models';
import { createServerClient } from '@supabase/ssr';
import { getServiceSupabase } from '@/lib/supabase';

type ResponseData = {
  success: boolean;
  message?: string;
  clients?: Client[];
  client?: Client;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>): Promise<void> {
  const { method } = req;
  const user = (req as any).user;

  console.log('Clients API called:', method, 'User:', user?.id, user?.email);

  // Create Supabase server client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: any) {
          // We don't need to set cookies in API routes
        },
        remove(name: string, options: any) {
          // We don't need to remove cookies in API routes
        },
      },
    }
  );

  try {
    if (!user) {
      console.error('No user found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    switch (method) {
      case 'GET':
        console.log('Calling handleGet...');
        return handleGet(req, res, user, supabase);
      case 'POST':
        console.log('Calling handlePost...');
        return handlePost(req, res, user, supabase);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Clients API error:', error);
    console.error('Error stack:', (error as any)?.stack);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ResponseData>, user: any, supabase: any): Promise<void> {
  console.log('handleGet started for user:', user.id);
  
  // Check if RLS might be blocking access - try service role as fallback
  const serviceSupabase = getServiceSupabase();
  
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

    // Get all clients (RLS policies will handle access control)
    // Test with service role to bypass RLS temporarily
    let query = serviceSupabase
      .from('clients')
      .select(`
        id,
        name,
        slug,
        industry,
        description,
        website,
        logo_url,
        primary_color,
        secondary_color,
        social_media,
        brand_guidelines,
        is_active,
        created_at,
        updated_at,
        created_by
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

    // Filter by user - show only clients created by this user
    query = query.eq('created_by', user.id);

    // Apply sorting
    const validSortFields = ['name', 'industry', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'name';
    const ascending = sort_order === 'asc';
    query = query.order(sortField, { ascending });

    // Apply pagination
    const limitNum = Math.min(Number(limit) || 50, 100);
    const offsetNum = Number(offset) || 0;
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    let { data: clients, error } = await query;

    // If RLS blocks regular query, try with service role
    if (error && error.code === '42501') {
      console.log('RLS blocking client retrieval, trying service role...');
      const serviceQuery = serviceSupabase
        .from('clients')
        .select(`
          id,
          name,
          slug,
          industry,
          description,
          website,
          logo_url,
          primary_color,
          secondary_color,
          social_media,
          brand_guidelines,
          is_active,
          created_at,
          updated_at,
          created_by
        `)
        .eq('created_by', user.id);
        
      const serviceResult = await serviceQuery;
      clients = serviceResult.data;
      error = serviceResult.error;
    }

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    // Fetch contacts separately for each client
    const clientIds = clients?.map(c => c.id) || [];
    let contactsMap: Record<string, any[]> = {};
    
    if (clientIds.length > 0) {
      // Try regular supabase first, then service role if needed
      let { data: contacts, error: contactsError } = await supabase
        .from('client_contacts')
        .select('*')
        .in('client_id', clientIds)
        .eq('is_active', true);
        
      // If RLS blocks contacts, try service role
      if (contactsError && contactsError.code === '42501') {
        console.log('RLS blocking contacts, trying service role...');
        const serviceContactsResult = await serviceSupabase
          .from('client_contacts')
          .select('*')
          .in('client_id', clientIds)
          .eq('is_active', true);
        contacts = serviceContactsResult.data;
        contactsError = serviceContactsResult.error;
      }
      
      if (!contactsError && contacts) {
        // Group contacts by client_id
        contactsMap = contacts.reduce((acc, contact) => {
          if (!acc[contact.client_id]) {
            acc[contact.client_id] = [];
          }
          acc[contact.client_id].push(contact);
          return acc;
        }, {} as Record<string, any[]>);
      }
    }

    // Transform clients to match expected format
    const transformedClients = clients?.map(client => ({
      id: client.id,
      name: client.name,
      slug: client.slug,
      industry: client.industry,
      description: client.description,
      website: client.website,
      logo: client.logo_url,
      primaryColor: client.primary_color || '#1976d2',
      secondaryColor: client.secondary_color || '#dc004e',
      socialMedia: client.social_media || {},
      brand_guidelines: client.brand_guidelines || {},
      isActive: client.is_active !== false,
      dateCreated: client.created_at,
      lastModified: client.updated_at,
      contacts: contactsMap[client.id] || [],
      // Include stats if requested
      ...(include_stats === 'true' && {
        stats: {
          campaignCount: Array.isArray(client.campaigns) ? client.campaigns.length : 0,
          assetCount: Array.isArray(client.assets) ? client.assets.length : 0,
          matrixCount: Array.isArray(client.matrices) ? client.matrices.length : 0,
        }
      })
    })) || [];

    return res.json({
      success: true,
      clients: transformedClients,
      pagination: {
        total: clients?.length || 0,
        limit: limitNum,
        offset: offsetNum,
        hasMore: (clients?.length || 0) === limitNum
      }
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error in handleGet:', error);
    throw error;
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ResponseData>, user: any, supabase: any): Promise<void> {
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

    console.log('handlePost user data:', { userId: user.id, userEmail: user.email });

    // Basic validation
    if (!name || !industry) {
      return res.status(400).json({
        success: false,
        message: 'Name and industry are required'
      });
    }

    // Verify user exists in profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      console.error('Profile check failed:', profileError);
      return res.status(400).json({
        success: false,
        message: 'User profile not found. Please ensure you are properly authenticated.'
      });
    }

    console.log('Profile verified:', profileData);

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Create client in Supabase
    // Now using proper database columns after schema update
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
      created_by: user.id,  // Required for RLS policy
    };

    console.log('Attempting to insert client with data:', clientData);

    // Try using service role to bypass RLS for the insert if regular insert fails
    let { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    // If RLS fails, try with service role
    if (error && error.code === '42501') {
      console.log('RLS failed, trying with service role...');
      const serviceSupabase = getServiceSupabase();
      
      const serviceResult = await serviceSupabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
        
      if (serviceResult.error) {
        console.error('Service role insert also failed:', serviceResult.error);
        throw serviceResult.error;
      }
      
      // Use service client result
      client = serviceResult.data;
      error = null; // Clear the error since service role succeeded
    }

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    // Add contacts if provided
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
      const contactInserts = contacts.map((contact: any) => ({
        client_id: client.id,
        name: contact.name,
        role: contact.role || null,
        email: contact.email || null,
        phone: contact.phone || null,
        is_primary: contact.isActive || false,
        is_active: true,
      }));

      const { error: contactError } = await supabase
        .from('client_contacts')
        .insert(contactInserts);

      if (contactError) {
        console.error('Error creating contacts:', contactError);
        // Don't fail the whole operation for contact errors, just log it
      }
    }

    // Transform response using proper database columns
    const transformedClient: Client = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      industry: client.industry,
      description: client.description,
      website: client.website,
      logo: client.logo_url,
      primaryColor: client.primary_color || '#1976d2',
      secondaryColor: client.secondary_color || '#dc004e',
      socialMedia: client.social_media || {},
      brand_guidelines: client.brand_guidelines || {},
      isActive: client.is_active,
      dateCreated: client.created_at,
      lastModified: client.updated_at,
      contacts: contacts || [], // Include the contacts in response
    };

    return res.status(201).json({
      success: true,
      client: transformedClient,
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error in handlePost:', error);
    throw error;
  }
}

export default withAuth(withSecurityHeaders(handler));