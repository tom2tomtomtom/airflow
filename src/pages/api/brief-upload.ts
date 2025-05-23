import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
    }
    const file = files.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Only allow PDF, DOCX, TXT
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }
    // Upload to Supabase Storage
    const fileBuffer = await file.toBuffer();
    const filePath = `briefs/${Date.now()}_${file.originalFilename}`;
    const { data, error } = await supabase.storage.from(env.STORAGE_BUCKET).upload(filePath, fileBuffer, { contentType: file.mimetype });
    if (error) {
      return res.status(500).json({ success: false, message: 'Storage upload error', error: error.message });
    }
    // Create brief record
    const { data: brief, error: dbError } = await supabase.from('briefs').insert({ file_url: data.path, status: 'uploaded' }).select().single();
    if (dbError) {
      return res.status(500).json({ success: false, message: 'Failed to record brief', error: dbError.message });
    }
    return res.status(200).json({ success: true, brief });
  });
}
