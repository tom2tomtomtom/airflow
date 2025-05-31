import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import type { Client } from '@/types/models';

// Mock clients data for testing
const mockClients: Client[] = [
  {
    id: 'client_1',
    name: 'Demo Agency',
    industry: 'Marketing',
    logo: '',
    primaryColor: '#2196F3',
    secondaryColor: '#FF9800',
    description: 'A demo agency for testing purposes',
    website: 'https://demo-agency.com',
    socialMedia: {
      facebook: 'https://facebook.com/demo-agency',
      twitter: 'https://twitter.com/demo-agency',
      instagram: 'https://instagram.com/demo-agency',
    },
    contacts: [
      {
        id: 'contact_1',
        name: 'John Doe',
        email: 'john@demo-agency.com',
        role: 'Account Manager',
        phone: '+1-555-0123',
        isActive: true,
      },
    ],
    brandGuidelines: {
      voiceTone: 'Professional and friendly',
      targetAudience: 'Small to medium businesses',
      keyMessages: ['Innovation', 'Quality', 'Customer-first'],
    },
    tenantId: 'tenant-1',
    isActive: true,
    dateCreated: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
  {
    id: 'client_2',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    logo: '',
    primaryColor: '#4CAF50',
    secondaryColor: '#FFC107',
    description: 'A technology solutions company',
    website: 'https://techcorp.com',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp',
    },
    contacts: [
      {
        id: 'contact_2',
        name: 'Jane Smith',
        email: 'jane@techcorp.com',
        role: 'Marketing Director',
        phone: '+1-555-0456',
        isActive: true,
      },
    ],
    brandGuidelines: {
      voiceTone: 'Technical but approachable',
      targetAudience: 'Enterprise clients',
      keyMessages: ['Innovation', 'Reliability', 'Scale'],
    },
    tenantId: 'tenant-1',
    isActive: true,
    dateCreated: '2023-02-01T00:00:00Z',
    lastModified: '2024-02-01T00:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
  {
    id: 'client_3',
    name: 'Retail Plus',
    industry: 'Retail',
    logo: '',
    primaryColor: '#E91E63',
    secondaryColor: '#00BCD4',
    description: 'A retail chain focused on customer experience',
    website: 'https://retailplus.com',
    socialMedia: {
      facebook: 'https://facebook.com/retailplus',
      instagram: 'https://instagram.com/retailplus',
    },
    contacts: [
      {
        id: 'contact_3',
        name: 'Mike Johnson',
        email: 'mike@retailplus.com',
        role: 'Brand Manager',
        phone: '+1-555-0789',
        isActive: true,
      },
    ],
    brandGuidelines: {
      voiceTone: 'Energetic and customer-focused',
      targetAudience: 'Everyday consumers',
      keyMessages: ['Value', 'Quality', 'Experience'],
    },
    tenantId: 'tenant-1',
    isActive: true,
    dateCreated: '2023-03-01T00:00:00Z',
    lastModified: '2024-03-01T00:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = (req as any).user;
  try {
    if (req.method === 'GET') {
      // Return all clients
      return res.status(200).json({
        success: true,
        clients: mockClients,
        total: mockClients.length,
      });
    }

    if (req.method === 'POST') {
      // Create a new client
      const clientData = req.body;
      const newClient: Client = {
        id: 'client_' + Math.random().toString(36).substring(2, 9),
        name: clientData.name || 'New Client',
        industry: clientData.industry || 'Other',
        logo: clientData.logo || '',
        primaryColor: clientData.primaryColor || '#2196F3',
        secondaryColor: clientData.secondaryColor || '#FF9800',
        description: clientData.description || '',
        website: clientData.website || '',
        socialMedia: clientData.socialMedia || {},
        contacts: clientData.contacts || [],
        brandGuidelines: clientData.brandGuidelines || {
          voiceTone: '',
          targetAudience: '',
          keyMessages: [],
        },
        tenantId: 'tenant-1',
        isActive: true,
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'user-1',
        version: 1,
        metadata: {},
      };

      // Add to mock data (in a real app, this would persist to database)
      mockClients.push(newClient);

      return res.status(201).json({
        success: true,
        client: newClient,
        message: 'Client created successfully',
      });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(withSecurityHeaders(handler));