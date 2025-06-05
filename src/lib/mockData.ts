// Mock data for generate page - moved for performance
export interface Motivation {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  selected: boolean;
}

export interface CopyVariation {
  id: string;
  text: string;
  motivationId: string;
  favorite: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  dateCreated: string;
  favorite: boolean;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail: string;
  prompt: string;
  duration: string;
  resolution: string;
  dateCreated: string;
  status: 'completed' | 'processing' | 'failed';
  favorite: boolean;
}

export interface GeneratedVoice {
  id: string;
  url: string;
  text: string;
  voice: string;
  language: string;
  duration: string;
  dateCreated: string;
  favorite: boolean;
}

export const mockMotivations: Motivation[] = [
  {
    id: 'm1',
    title: 'Sustainable Weight Loss Journey',
    description: 'Focus on the long-term benefits of sustainable weight loss practices, emphasizing lifestyle changes over quick fixes. Appeal to customers seeking lasting results.',
    relevanceScore: 4.5,
    selected: true,
  },
  {
    id: 'm2',
    title: 'Science-Backed Solutions',
    description: 'Highlight the scientific research and evidence supporting our weight loss programs. Appeal to analytical customers who value proven methods.',
    relevanceScore: 4.8,
    selected: true,
  },
  {
    id: 'm3',
    title: 'Community Support',
    description: 'Emphasize the community aspect of weight loss, including group support, shared experiences, and the journey with like-minded individuals.',
    relevanceScore: 3.9,
    selected: false,
  },
  {
    id: 'm4',
    title: 'Personal Transformation',
    description: 'Focus on the holistic transformation beyond weight loss, including improved confidence, energy levels, and overall quality of life.',
    relevanceScore: 4.2,
    selected: true,
  },
  {
    id: 'm5',
    title: 'Expert Guidance',
    description: 'Highlight the professional support from nutritionists, fitness experts, and health coaches that guide customers through their weight loss journey.',
    relevanceScore: 4.0,
    selected: true,
  },
];

export const mockCopyVariations: CopyVariation[] = [
  {
    id: 'c1',
    text: 'Transform your life with our science-backed weight loss program, designed for sustainable results that last.',
    motivationId: 'm1',
    favorite: true,
  },
  {
    id: 'c2',
    text: 'Join thousands who have achieved their weight loss goals through our expert-guided program. Start your transformation today.',
    motivationId: 'm2',
    favorite: false,
  },
  {
    id: 'c3',
    text: 'Experience the power of community support on your weight loss journey. You\'re never alone with our program.',
    motivationId: 'm3',
    favorite: false,
  },
];

export const mockGeneratedImages: GeneratedImage[] = [
  {
    id: 'img1',
    url: 'https://via.placeholder.com/400x400/7C3AED/FFFFFF?text=Generated+Image+1',
    prompt: 'A vibrant healthy lifestyle transformation scene',
    style: 'photorealistic',
    aspectRatio: '1:1',
    dateCreated: '2023-05-17T10:30:00Z',
    favorite: true,
  },
  {
    id: 'img2',
    url: 'https://via.placeholder.com/400x400/EC4899/FFFFFF?text=Generated+Image+2',
    prompt: 'Diverse group of people exercising together',
    style: 'artistic',
    aspectRatio: '16:9',
    dateCreated: '2023-05-17T11:15:00Z',
    favorite: false,
  },
];

export const mockGeneratedVideos: GeneratedVideo[] = [
  {
    id: 'video1',
    url: '/mock-videos/transformation-story.mp4',
    thumbnail: 'https://via.placeholder.com/400x225/7C3AED/FFFFFF?text=Video+Thumbnail+1',
    prompt: 'Customer transformation success story',
    duration: '00:30',
    resolution: '1080p',
    dateCreated: '2023-05-17T12:00:00Z',
    status: 'completed',
    favorite: true,
  },
  {
    id: 'video2',
    url: '/mock-videos/community-workout.mp4',
    thumbnail: 'https://via.placeholder.com/400x225/EC4899/FFFFFF?text=Video+Thumbnail+2',
    prompt: 'Community workout session highlights',
    duration: '01:00',
    resolution: '1080p',
    dateCreated: '2023-05-17T13:30:00Z',
    status: 'processing',
    favorite: false,
  },
];

export const mockGeneratedVoices: GeneratedVoice[] = [
  {
    id: 'voice1',
    url: '/mock-voices/motivational-message.mp3',
    text: 'Take the first step towards your healthiest, happiest self. Our personalized weight loss program is designed just for you.',
    voice: 'Sarah',
    language: 'English (US)',
    duration: '00:15',
    dateCreated: '2023-05-17T14:20:00Z',
    favorite: true,
  },
  {
    id: 'voice2',
    url: '/mock-voices/expert-advice.mp3',
    text: 'Our team of certified nutritionists and fitness experts will guide you through every step of your personalized weight loss program.',
    voice: 'James',
    language: 'English (UK)',
    duration: '00:12',
    dateCreated: '2023-05-17T14:35:00Z',
    favorite: false,
  },
];