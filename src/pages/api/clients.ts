import { NextApiRequest, NextApiResponse } from 'next';

// Mock client data
const mockClients = [
  {
    id: 'client1',
    name: 'Acme Corporation',
    industry: 'Technology',
    logo: '/mock-images/client-logos/acme.png',
    primaryColor: '#3a86ff',
    secondaryColor: '#8338ec',
    dateCreated: '2023-04-01',
    lastModified: '2023-05-15',
    description: 'Leading technology company specializing in innovative solutions',
    website: 'https://example.com/acme',
    socialMedia: {
      instagram: 'acmecorp',
      facebook: 'acmecorporation',
      twitter: 'acmetech',
      linkedin: 'acme-corporation',
    },
    contacts: [
      {
        id: 'contact1',
        name: 'John Smith',
        role: 'Marketing Director',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
      },
      {
        id: 'contact2',
        name: 'Sarah Johnson',
        role: 'Brand Manager',
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 987-6543',
      },
    ],
    brandGuidelines: {
      voiceTone: 'Professional, innovative, approachable',
      targetAudience: 'Business professionals, tech enthusiasts',
      keyMessages: [
        'Innovative solutions for modern challenges',
        'Streamlining business operations through technology',
        'Trusted by industry leaders worldwide',
      ],
    },
  },
  {
    id: 'client2',
    name: 'Eco Friendly Products',
    industry: 'Retail',
    logo: '/mock-images/client-logos/eco.png',
    primaryColor: '#06d6a0',
    secondaryColor: '#ffbe0b',
    dateCreated: '2023-03-15',
    lastModified: '2023-05-10',
    description: 'Sustainable retail company offering eco-friendly consumer products',
    website: 'https://example.com/ecofriendly',
    socialMedia: {
      instagram: 'ecofriendlyproducts',
      facebook: 'ecofriendlyproducts',
      twitter: 'ecofriendly',
      linkedin: 'eco-friendly-products',
    },
    contacts: [
      {
        id: 'contact3',
        name: 'Emily Green',
        role: 'Sustainability Director',
        email: 'emily.green@example.com',
        phone: '+1 (555) 234-5678',
      },
    ],
    brandGuidelines: {
      voiceTone: 'Passionate, educational, authentic',
      targetAudience: 'Environmentally conscious consumers, young adults',
      keyMessages: [
        'Sustainable living made simple',
        'Products that protect our planet',
        'Small changes, big impact',
      ],
    },
  },
  {
    id: 'client3',
    name: 'Wellness Hub',
    industry: 'Health & Wellness',
    logo: '/mock-images/client-logos/wellness.png',
    primaryColor: '#ef476f',
    secondaryColor: '#ffd166',
    dateCreated: '2023-02-20',
    lastModified: '2023-05-05',
    description: 'Holistic wellness center offering fitness, nutrition, and mental health services',
    website: 'https://example.com/wellnesshub',
    socialMedia: {
      instagram: 'wellnesshub',
      facebook: 'thewellnesshub',
      twitter: 'wellnesshub',
      linkedin: 'wellness-hub',
    },
    contacts: [
      {
        id: 'contact4',
        name: 'Michael Chen',
        role: 'Marketing Manager',
        email: 'michael.chen@example.com',
        phone: '+1 (555) 345-6789',
      },
      {
        id: 'contact5',
        name: 'Jessica Patel',
        role: 'Social Media Coordinator',
        email: 'jessica.patel@example.com',
        phone: '+1 (555) 456-7890',
      },
    ],
    brandGuidelines: {
      voiceTone: 'Supportive, motivational, knowledgeable',
      targetAudience: 'Health-conscious individuals, fitness enthusiasts',
      keyMessages: [
        'Holistic approach to wellness',
        'Expert guidance for your wellness journey',
        'Mind, body, and spirit in harmony',
      ],
    },
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set a delay to simulate network latency (optional)
  setTimeout(() => {
    if (req.method === 'GET') {
      // Return all clients
      res.status(200).json({ clients: mockClients, activeClient: mockClients[0] });
    } else {
      // Handle any other HTTP method
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }, 500); // 500ms delay
}
