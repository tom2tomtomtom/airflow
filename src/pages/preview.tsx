import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  // TikTok icon doesn't exist in MUI, using a custom one
  // TikTok as TikTokIcon,
  AspectRatio as AspectRatioIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Define types
interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'color' | 'link';
  required: boolean;
  description: string;
}

interface Template {
  id: string;
  name: string;
  platform: string;
  aspectRatio: string;
  description: string;
  thumbnail: string;
  dateCreated: string;
  lastModified: string;
  category: string;
  industry: string;
  contentType: string;
  dimensions: string;
  recommendedUsage: string;
  usageCount: number;
  performance?: {
    views: number;
    engagement: number;
    conversion: number;
    score: number;
  };
  dynamicFields: DynamicField[];
  isCreatomate: boolean;
  creatomateId: string;
}

// Mock data for templates
const mockTemplates: Template[] = [
  {
    id: 't1',
    name: 'Instagram Story',
    platform: 'Instagram',
    aspectRatio: '9:16',
    description: 'Vertical template optimized for Instagram Stories with dynamic text and image placement',
    thumbnail: '/instagram-story.jpg',
    dateCreated: '2023-04-15',
    lastModified: '2023-05-01',
    category: 'Social Media',
    industry: 'Health & Fitness',
    contentType: 'Story',
    dimensions: '1080x1920',
    recommendedUsage: 'Brand awareness, product showcases, behind-the-scenes content',
    usageCount: 245,
    performance: {
      views: 12500,
      engagement: 8.7,
      conversion: 3.2,
      score: 85
    },
    dynamicFields: [
      {
        id: 'df1',
        name: 'Headline',
        type: 'text',
        required: true,
        description: 'Main headline text (max 40 characters)'
      },
      {
        id: 'df2',
        name: 'Background Image',
        type: 'image',
        required: true,
        description: 'Full screen background image (1080x1920)'
      },
      {
        id: 'df3',
        name: 'Call to Action',
        type: 'text',
        required: false,
        description: 'Optional call to action text'
      }
    ],
    isCreatomate: true,
    creatomateId: 'crt-123456'
  },
  {
    id: 't2',
    name: 'Facebook Post',
    platform: 'Facebook',
    aspectRatio: '1:1',
    description: 'Square template for Facebook feed posts with text overlay and product image',
    thumbnail: '/facebook-post.jpg',
    dateCreated: '2023-04-10',
    lastModified: '2023-04-28',
    category: 'Social Media',
    industry: 'E-commerce',
    contentType: 'Post',
    dimensions: '1080x1080',
    recommendedUsage: 'Product promotions, announcements, engagement posts',
    usageCount: 189,
    performance: {
      views: 8700,
      engagement: 5.2,
      conversion: 2.1,
      score: 72
    },
    dynamicFields: [
      {
        id: 'df1',
        name: 'Product Image',
        type: 'image',
        required: true,
        description: 'Main product image (1:1 ratio recommended)'
      },
      {
        id: 'df2',
        name: 'Headline',
        type: 'text',
        required: true,
        description: 'Main headline text (max 60 characters)'
      },
      {
        id: 'df3',
        name: 'Description',
        type: 'text',
        required: true,
        description: 'Product description (max 120 characters)'
      },
      {
        id: 'df4',
        name: 'Price',
        type: 'text',
        required: false,
        description: 'Product price'
      },
      {
        id: 'df5',
        name: 'Background Color',
        type: 'color',
        required: false,
        description: 'Background color for the post'
      }
    ],
    isCreatomate: true,
    creatomateId: 'crt-234567'
  }
];

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <InstagramIcon sx={{ color: '#E1306C' }} />,
  Facebook: <FacebookIcon sx={{ color: '#1877F2' }} />,
  Twitter: <TwitterIcon sx={{ color: '#1DA1F2' }} />,
  YouTube: <YouTubeIcon sx={{ color: '#FF0000' }} />,
  LinkedIn: <LinkedInIcon sx={{ color: '#0A66C2' }} />,
  Pinterest: <PinterestIcon sx={{ color: '#E60023' }} />,
  TikTok: <AspectRatioIcon sx={{ color: '#000000' }} />, // Using AspectRatioIcon as placeholder
};

const PreviewPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateId && typeof templateId === 'string') {
      // In a real app, you would fetch the template from an API
      const foundTemplate = mockTemplates.find(t => t.id === templateId);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      }
      setLoading(false);
    }
  }, [templateId]);

  // Get aspect ratio dimensions for preview
  const getAspectRatioDimensions = (aspectRatio: string) => {
    const parts = aspectRatio.split(':').map(Number);
    const width = parts[0] ?? 1;
    const height = parts[1] ?? 1;
    const maxWidth = 400;
    const maxHeight = 600;

    if (width / height > 1) {
      // Landscape
      return {
        width: maxWidth,
        height: Math.round(maxWidth * (height / width))
      };
    } else {
      // Portrait or square
      return {
        width: Math.round(maxHeight * (width / height)),
        height: maxHeight
      };
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          p: 3
        }}
      >
        <Typography variant="h5" gutterBottom>
          Template Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          The template you are looking for does not exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/templates')}
          sx={{ mt: 2 }}
        >
          Back to Templates
        </Button>
      </Box>
    );
  }

  const dimensions = getAspectRatioDimensions(template.aspectRatio);

  return (
    <>
      <Head>
        <title>Preview: {template.name} | AIrWAVE</title>
      </Head>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => window.close()}
          >
            Close Preview
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push(`/matrix?templateId=${template.id}`)}
          >
            Use This Template
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              {template.name}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                icon={platformIcons[template.platform] as React.ReactElement}
                label={template.platform}
              />
              <Chip
                icon={<AspectRatioIcon />}
                label={template.aspectRatio}
              />
              <Chip
                label={template.dimensions}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body1" paragraph>
              {template.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Template Details
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1" gutterBottom>
                {template.category}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Industry
              </Typography>
              <Typography variant="body1" gutterBottom>
                {template.industry}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Content Type
              </Typography>
              <Typography variant="body1" gutterBottom>
                {template.contentType}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Recommended Usage
              </Typography>
              <Typography variant="body1" gutterBottom>
                {template.recommendedUsage}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Dynamic Fields
            </Typography>

            {template.dynamicFields.map(field => (
              <Card key={field.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {field.name}
                    </Typography>
                    {field.required && (
                      <Chip
                        label="Required"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Type: {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {field.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={3}
                sx={{
                  width: dimensions.width,
                  height: dimensions.height,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'grey.100',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {platformIcons[template.platform] || <AspectRatioIcon sx={{ fontSize: 48, color: 'grey.400' }} />}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Template Preview
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.dimensions} • {template.aspectRatio}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(`/matrix?templateId=${template.id}`)}
              >
                Use This Template
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default PreviewPage;
