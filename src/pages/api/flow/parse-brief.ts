import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Configure to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

interface BriefData {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  platforms: string[];
  budget: string;
  timeline: string;
  brandGuidelines?: string;
  requirements?: string[];
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const user = (req as any).user;
  
  try {
    // Parse the uploaded file
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('Processing brief file:', uploadedFile.originalFilename);

    // Read the file content
    const fileContent = fs.readFileSync(uploadedFile.filepath, 'utf8');
    
    // Extract basic information from filename and content
    const fileName = uploadedFile.originalFilename || 'Untitled Brief';
    const briefTitle = fileName.replace(/\.[^/.]+$/, '');

    // Parse content using AI/NLP (for now, we'll extract basic patterns)
    const parsedBrief = await parseDocumentContent(fileContent, briefTitle);

    // Clean up uploaded file
    fs.unlinkSync(uploadedFile.filepath);

    console.log('Brief parsed successfully:', parsedBrief.title);

    return res.status(200).json({
      success: true,
      data: parsedBrief,
      message: 'Brief parsed successfully'
    });

  } catch (error) {
    console.error('Error parsing brief:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to parse brief'
    });
  }
}

async function parseDocumentContent(content: string, title: string): Promise<BriefData> {
  // Basic content analysis patterns
  const contentLower = content.toLowerCase();
  
  // Extract objective
  let objective = '';
  const objectivePatterns = [
    /objective[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /goal[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /purpose[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of objectivePatterns) {
    const match = content.match(pattern);
    if (match) {
      objective = match[1].trim();
      break;
    }
  }

  // Extract target audience
  let targetAudience = '';
  const audiencePatterns = [
    /target audience[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /audience[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /demographic[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of audiencePatterns) {
    const match = content.match(pattern);
    if (match) {
      targetAudience = match[1].trim();
      break;
    }
  }

  // Extract key messages
  const keyMessages: string[] = [];
  const messagePatterns = [
    /key messages?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /messages?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of messagePatterns) {
    const match = content.match(pattern);
    if (match) {
      const messages = match[1].split(/[,\n\-\•]/).map(m => m.trim()).filter(m => m.length > 0);
      keyMessages.push(...messages.slice(0, 5)); // Limit to 5 messages
      break;
    }
  }

  // Extract platforms
  const platforms: string[] = [];
  const platformKeywords = ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok', 'snapchat'];
  
  platformKeywords.forEach(platform => {
    if (contentLower.includes(platform)) {
      platforms.push(platform.charAt(0).toUpperCase() + platform.slice(1));
    }
  });

  // Extract budget
  let budget = '';
  const budgetPattern = /budget[:\s]+[\$]?([0-9,]+)/i;
  const budgetMatch = content.match(budgetPattern);
  if (budgetMatch) {
    budget = `$${budgetMatch[1]}`;
  }

  // Extract timeline
  let timeline = '';
  const timelinePatterns = [
    /timeline[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /duration[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /(\d+)\s*(weeks?|months?|days?)/i
  ];
  
  for (const pattern of timelinePatterns) {
    const match = content.match(pattern);
    if (match) {
      timeline = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }

  // Extract brand guidelines
  let brandGuidelines = '';
  const guidelinesPattern = /brand guidelines?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i;
  const guidelinesMatch = content.match(guidelinesPattern);
  if (guidelinesMatch) {
    brandGuidelines = guidelinesMatch[1].trim();
  }

  // Extract requirements
  const requirements: string[] = [];
  const requirementPatterns = [
    /requirements?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
    /deliverables?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of requirementPatterns) {
    const match = content.match(pattern);
    if (match) {
      const reqs = match[1].split(/[,\n\-\•]/).map(r => r.trim()).filter(r => r.length > 0);
      requirements.push(...reqs.slice(0, 10)); // Limit to 10 requirements
      break;
    }
  }

  return {
    title,
    objective: objective || 'Strategic content creation to drive engagement and brand awareness',
    targetAudience: targetAudience || 'Target audience as defined in brief',
    keyMessages: keyMessages.length > 0 ? keyMessages : ['Key message from brief analysis'],
    platforms: platforms.length > 0 ? platforms : ['Instagram', 'LinkedIn', 'Facebook'],
    budget: budget || 'Budget as specified',
    timeline: timeline || 'Timeline as specified',
    brandGuidelines,
    requirements
  };
}

export default withAuth(handler);