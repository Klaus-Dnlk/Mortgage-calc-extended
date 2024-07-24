import {
  sanitizeHTML,
  sanitizeInput,
  sanitizeEmail,
  sanitizeURL,
  generateCSRFToken,
  validateCSRFToken,
  inputValidation,
  rateLimiting
} from './security';

describe('Security Utils', () => {
  describe('sanitizeHTML', () => {
    it('should sanitize dangerous HTML', () => {
      const dangerousHTML = '<script>alert("xss")</script><p>Safe content</p>';
      const result = sanitizeHTML(dangerousHTML);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>Safe content</p>');
    });

    it('should allow safe HTML tags', () => {
      const safeHTML = '<b>Bold</b> <i>Italic</i> <a href="https://example.com">Link</a>';
      const result = sanitizeHTML(safeHTML);
      
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).toContain('<a href="https://example.com">Link</a>');
    });

    it('should remove event handlers', () => {
      const htmlWithEvents = '<img src="x" onerror="alert(1)">';
      const result = sanitizeHTML(htmlWithEvents);
      
      expect(result).not.toContain('onerror');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const dangerousInput = '<script>alert("xss")</script>';
      const result = sanitizeInput(dangerousInput);
      
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('onclick=');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid email', () => {
      const email = '  TEST@EXAMPLE.COM  ';
      const result = sanitizeEmail(email);
      
      expect(result).toBe('test@example.com');
    });

    it('should return empty string for invalid email', () => {
      const invalidEmails = ['', 'invalid', 'test@', '@example.com'];
      
      invalidEmails.forEach(email => {
        expect(sanitizeEmail(email)).toBe('');
      });
    });

    it('should sanitize dangerous email', () => {
      const dangerousEmail = '<script>alert("xss")</script>@example.com';
      const result = sanitizeEmail(dangerousEmail);
      
      expect(result).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('should add https to URLs without protocol', () => {
      const url = 'example.com';
      const result = sanitizeURL(url);
      
      expect(result).toBe('https://example.com');
    });

    it('should keep valid URLs unchanged', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        '/relative/path',
        '#anchor'
      ];
      
      validUrls.forEach(url => {
        expect(sanitizeURL(url)).toBe(url);
      });
    });

    it('should sanitize dangerous URLs', () => {
      const dangerousUrl = 'javascript:alert("xss")';
      const result = sanitizeURL(dangerousUrl);
      
      expect(result).not.toContain('javascript:');
    });
  });

  describe('CSRF Token', () => {
    it('should generate valid CSRF token', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });

    it('should validate CSRF token correctly', () => {
      const token = generateCSRFToken();
      
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different-token')).toBe(false);
      expect(validateCSRFToken(null, token)).toBe(false);
      expect(validateCSRFToken(token, null)).toBe(false);
    });
  });

  describe('inputValidation', () => {
    describe('validateBankName', () => {
      it('should validate correct bank names', () => {
        expect(inputValidation.validateBankName('Test Bank')).toBe(true);
        expect(inputValidation.validateBankName('A')).toBe(false); // Too short
        expect(inputValidation.validateBankName('')).toBe(false);
        expect(inputValidation.validateBankName(null)).toBe(false);
      });

      it('should reject dangerous bank names', () => {
        expect(inputValidation.validateBankName('<script>alert("xss")</script>')).toBe(false);
      });
    });

    describe('validateNumber', () => {
      it('should validate numbers within range', () => {
        expect(inputValidation.validateNumber('10', 0, 100)).toBe(true);
        expect(inputValidation.validateNumber('0', 0, 100)).toBe(true);
        expect(inputValidation.validateNumber('100', 0, 100)).toBe(true);
        expect(inputValidation.validateNumber('-1', 0, 100)).toBe(false);
        expect(inputValidation.validateNumber('101', 0, 100)).toBe(false);
        expect(inputValidation.validateNumber('abc', 0, 100)).toBe(false);
      });
    });

    describe('validatePercentage', () => {
      it('should validate percentages', () => {
        expect(inputValidation.validatePercentage('50')).toBe(true);
        expect(inputValidation.validatePercentage('0')).toBe(true);
        expect(inputValidation.validatePercentage('100')).toBe(true);
        expect(inputValidation.validatePercentage('-1')).toBe(false);
        expect(inputValidation.validatePercentage('101')).toBe(false);
      });
    });

    describe('validateCurrency', () => {
      it('should validate currency amounts', () => {
        expect(inputValidation.validateCurrency('1000')).toBe(true);
        expect(inputValidation.validateCurrency('0')).toBe(true);
        expect(inputValidation.validateCurrency('-100')).toBe(false);
      });
    });

    describe('validateLoanTerm', () => {
      it('should validate loan terms', () => {
        expect(inputValidation.validateLoanTerm('30')).toBe(true);
        expect(inputValidation.validateLoanTerm('1')).toBe(true);
        expect(inputValidation.validateLoanTerm('50')).toBe(true);
        expect(inputValidation.validateLoanTerm('0')).toBe(false);
        expect(inputValidation.validateLoanTerm('51')).toBe(false);
      });
    });
  });

  describe('rateLimiting', () => {
    beforeEach(() => {
      // Clear rate limiting data
      rateLimiting.requests.clear();
    });

    it('should allow requests within limit', () => {
      const key = 'test-user';
      
      // Make 5 requests (under limit of 10)
      for (let i = 0; i < 5; i++) {
        expect(rateLimiting.isAllowed(key, 10, 60000)).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      const key = 'test-user';
      
      // Make 11 requests (over limit of 10)
      for (let i = 0; i < 10; i++) {
        expect(rateLimiting.isAllowed(key, 10, 60000)).toBe(true);
      }
      
      // 11th request should be blocked
      expect(rateLimiting.isAllowed(key, 10, 60000)).toBe(false);
    });

    it('should reset after time window', () => {
      const key = 'test-user';
      
      // Mock time to simulate time passing
      const originalDateNow = Date.now;
      let mockTime = 1000;
      Date.now = jest.fn(() => mockTime);
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiting.isAllowed(key, 10, 60000);
        mockTime += 1000;
      }
      
      // Fast forward time beyond window
      mockTime += 70000; // 70 seconds later
      
      // Should allow requests again
      expect(rateLimiting.isAllowed(key, 10, 60000)).toBe(true);
      
      // Restore original Date.now
      Date.now = originalDateNow;
    });
  });
}); 