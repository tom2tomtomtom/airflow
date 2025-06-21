/**
 * Input Validation and Sanitization Utilities
 * Provides comprehensive input validation and sanitization for security
 */

import DOMPurify from 'isomorphic-dompurify';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'email' | 'url' | 'uuid' | 'json';
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
  sanitizedData: { [key: string]: any };
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Reject javascript: protocol for security
    if (urlObj.protocol === 'javascript:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file type by extension
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  if (!filename) return false;
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  return allowedTypes.includes(extension);
}

/**
 * Validate file size
 */
export function validateFileSize(sizeInBytes: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

/**
 * Sanitize input (uses HTML sanitization for dangerous content)
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  return sanitizeHtml(input);
}

/**
 * Validate URL (stricter than isValidUrl - only allows http/https)
 */
export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email (alias for isValidEmail for backward compatibility)
 */
export function validateEmail(email: string): boolean {
  return isValidEmail(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one digit, one special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate required field
 */
export function validateRequired(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate JSON string
 */
export function isValidJson(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate single field
 */
export function validateField(value: any, rule: ValidationRule): string | null {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }
  
  // Skip other validations if value is empty and not required
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null;
  }
  
  // Type validation
  if (rule.type) {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return 'Must be a string';
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return 'Must be a number';
        }
        break;
      case 'email':
        if (!isValidEmail(value)) {
          return 'Must be a valid email address';
        }
        break;
      case 'url':
        if (!isValidUrl(value)) {
          return 'Must be a valid URL';
        }
        break;
      case 'uuid':
        if (!isValidUuid(value)) {
          return 'Must be a valid UUID';
        }
        break;
      case 'json':
        if (!isValidJson(value)) {
          return 'Must be valid JSON';
        }
        break;
    }
  }
  
  // Length validation
  const stringValue = String(value);
  if (rule.minLength && stringValue.length < rule.minLength) {
    return `Must be at least ${rule.minLength} characters long`;
  }
  
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `Must be no more than ${rule.maxLength} characters long`;
  }
  
  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return 'Invalid format';
  }
  
  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value);
    if (result !== true) {
      return typeof result === 'string' ? result : 'Invalid value';
    }
  }
  
  return null;
}

/**
 * Validate data against schema
 */
export function validateData(data: any, schema: ValidationSchema): ValidationResult {
  const errors: { [key: string]: string } = {};
  const sanitizedData: { [key: string]: any } = {};
  
  // Validate each field in schema
  Object.keys(schema).forEach(key => {
    const value = data[key];
    const rule = schema[key];

    if (rule) {
      const error = validateField(value, rule);
      if (error) {
        errors[key] = error;
      }
    }
    
    // Sanitize the value
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeString(value);
      } else {
        sanitizedData[key] = value;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // User registration
  userRegistration: {
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 255,
    },
    password: {
      required: true,
      type: 'string' as const,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 100,
    },
  },
  
  // User login
  login: {
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 255,
    },
    password: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 128,
    },
  },

  // User signup
  signup: {
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 255,
    },
    password: {
      required: true,
      type: 'string' as const,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 100,
    },
  },
  
  // Client creation
  clientCreation: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 100,
    },
    industry: {
      required: false,
      type: 'string' as const,
      maxLength: 100,
    },
    description: {
      required: false,
      type: 'string' as const,
      maxLength: 1000,
    },
  },
  
  // Campaign creation
  campaignCreation: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 200,
    },
    description: {
      required: false,
      type: 'string' as const,
      maxLength: 2000,
    },
    budget: {
      required: false,
      type: 'number' as const,
      custom: (value: number) => value >= 0 || 'Budget must be positive',
    },
  },
  
  // AI generation request
  aiGeneration: {
    prompt: {
      required: true,
      type: 'string' as const,
      minLength: 10,
      maxLength: 2000,
    },
    type: {
      required: true,
      type: 'string' as const,
      pattern: /^(text|image|video|voice)$/,
    },
    clientId: {
      required: true,
      type: 'string' as const,
      minLength: 1,
    },
    style: {
      required: false,
      type: 'string' as const,
      maxLength: 100,
    },
  },
};

/**
 * Middleware for request validation
 */
export function withValidation(
  schema: ValidationSchema,
  handler: (req: any, res: any) => Promise<void>
) {
  return async (req: any, res: any) => {
    const validation = validateData(req.body, schema);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors,
      });
    }
    
    // Replace request body with sanitized data
    req.body = validation.sanitizedData;
    
    return handler(req, res);
  };
}

/**
 * Sanitize file upload data
 */
export function sanitizeFileData(file: any): {
  isValid: boolean;
  error?: string;
  sanitizedFile?: any;
} {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File too large (max 10MB)' };
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mp3',
    'audio/wav',
    'application/pdf',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // Sanitize filename
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
  
  return {
    isValid: true,
    sanitizedFile: {
      ...file,
      name: sanitizedName,
    },
  };
}
