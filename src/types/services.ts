/**
 * Service Type Declarations
 * 
 * Provides proper TypeScript type patterns for service modules
 * to resolve type conflicts and establish consistency.
 * 
 * This addresses Task 2.5 of TypeScript Error Resolution.
 */

import { LogContext } from '@/lib/logger/structured';

// ===== SERVICE ERROR PATTERNS =====

/**
 * Extended LogContext for service operations
 * Allows any service-specific data while maintaining core structure
 */
export interface ServiceLogContext extends LogContext {
  [key: string]: any;
}

/**
 * Standard service error interface
 */
export interface ServiceError {
  message: string;
  code?: string | number;
  details?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

/**
 * Extended ErrorContext for services
 */
export interface ServiceErrorContext {
  route: string;
  metadata?: Record<string, any>;
  error?: ServiceError;
  [key: string]: any;
}

// ===== ASSET MANAGER TYPES =====

/**
 * Asset Manager specific types
 */
export interface AssetManagerLogContext extends ServiceLogContext {
  assetId?: string;
  bucket?: string;
  path?: string;
  operation?: 'upload' | 'delete' | 'analyze' | 'optimize';
}

// ===== COPY GENERATOR TYPES =====

/**
 * Copy length constraints mapping
 */
export interface CopyLengthConstraints {
  headline: { short: number; medium: number; long: number };
  subheadline: { short: number; medium: number; long: number };
  body: { short: number; medium: number; long: number };
  cta: { short: number; medium: number; long: number };
  tagline: { short: number; medium: number; long: number };
  social: { short: number; medium: number; long: number };
  [key: string]: any; // Allow additional copy types
}

/**
 * Copy generation options
 */
export interface CopyGenerationOptions {
  type: keyof CopyLengthConstraints;
  length: 'short' | 'medium' | 'long';
  context?: Record<string, any>;
  constraints?: Partial<CopyLengthConstraints>;
}

// ===== MOTIVATION GENERATOR TYPES =====

/**
 * Motivation generation options
 */
export interface MotivationGenerationOptions {
  briefId: string;
  targetAudience?: string;
  goals?: string[];
  context?: Record<string, any>;
  [key: string]: any;
}

/**
 * Motivation validation result
 */
export interface MotivationValidationResult {
  valid: boolean;
  issues: string[];
  suggestions: string[];
}

// ===== REVIEW SYSTEM TYPES =====

/**
 * Review system context
 */
export interface ReviewSystemContext extends ServiceLogContext {
  reviewId?: string;
  itemType?: string;
  itemId?: string;
  reviewerId?: string;
  action?: 'create' | 'update' | 'approve' | 'reject';
}

// ===== UTILITY TYPE HELPERS =====

/**
 * Helper to convert any error-like object to ServiceLogContext
 */
export function toServiceLogContext(error: any, additionalContext?: Record<string, any>): ServiceLogContext {
  const baseContext: ServiceLogContext = {
    error: error?.message || String(error),
    ...additionalContext
  };

  // If error has properties, spread them in
  if (error && typeof error === 'object') {
    Object.keys(error).forEach(key => {
      if (typeof error[key] !== 'function') {
        baseContext[key] = error[key];
      }
    });
  }

  return baseContext;
}

/**
 * Helper to ensure ErrorContext compatibility
 */
export function toErrorContext(context: Record<string, any>): ServiceErrorContext {
  return {
    route: context.route || 'unknown',
    metadata: context.metadata,
    error: context.error,
    ...context
  };
}

// ===== TYPE GUARDS =====

/**
 * Type guard for ServiceError
 */
export function isServiceError(error: any): error is ServiceError {
  return error && typeof error === 'object' && typeof error.message === 'string';
}

/**
 * Type guard for proper LogContext
 */
export function isValidLogContext(context: any): context is ServiceLogContext {
  return context && typeof context === 'object';
}