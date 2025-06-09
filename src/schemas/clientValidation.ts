import { z } from 'zod';

const safeTextSchema = z.string()
  .transform(str => str.trim())
  .refine(str => !/<script[^>]*>.*?<\/script>/gi.test(str), 'Script tags not allowed');

const industrySchema = z.enum([
  'technology', 'healthcare', 'finance', 'retail', 'education', 
  'manufacturing', 'real-estate', 'hospitality', 'automotive', 
  'food-beverage', 'fashion', 'sports', 'entertainment', 
  'non-profit', 'government', 'consulting', 'marketing', 'other'
]);

export const createClientSchema = z.object({
  name: safeTextSchema.min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  industry: industrySchema,
  description: safeTextSchema.max(1000, 'Description too long').optional(),
  website: z.string().url('Invalid URL format').optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional()
});

export function validateClientInput(input: unknown) {
  const result = createClientSchema.safeParse(input);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    
    return { success: false, errors, data: null };
  }
  
  return { success: true, errors: [], data: result.data };
}
