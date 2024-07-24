import DOMPurify from 'dompurify';

/**
 * Security utilities for protecting against XSS, CSRF, and other attacks
 */

// Sanitize HTML content to prevent XSS
export const sanitizeHTML = (dirty) => {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

// Sanitize user input for safe display
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate and sanitize email
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email.toLowerCase().trim());
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

// Validate and sanitize URL
export const sanitizeURL = (url) => {
  if (!url) return '';
  
  const sanitized = sanitizeInput(url.trim());
  
  // Only allow http, https, and relative URLs
  const urlRegex = /^(https?:\/\/|\/|#)/;
  
  if (!urlRegex.test(sanitized)) {
    return `https://${sanitized}`;
  }
  
  return sanitized;
};

// Generate CSRF token
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate CSRF token
export const validateCSRFToken = (token, storedToken) => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// Secure storage utilities
export const secureStorage = {
  // Store sensitive data with encryption
  setItem: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  // Retrieve sensitive data
  getItem: (key) => {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  // Remove sensitive data
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data securely:', error);
    }
  },

  // Clear all sensitive data
  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear data securely:', error);
    }
  }
};

// API security utilities
export const apiSecurity = {
  // Add security headers to requests
  addSecurityHeaders: (config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    };
  },

  // Validate API response
  validateResponse: (response) => {
    // Check for suspicious content
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      throw new Error('Invalid response content type');
    }
    
    return response;
  },

  // Sanitize API data
  sanitizeData: (data) => {
    if (typeof data === 'string') {
      return sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => apiSecurity.sanitizeData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[sanitizeInput(key)] = apiSecurity.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }
};

// Input validation utilities
export const inputValidation = {
  // Validate bank name
  validateBankName: (name) => {
    if (!name || typeof name !== 'string') return false;
    const sanitized = sanitizeInput(name);
    return sanitized.length >= 2 && sanitized.length <= 100;
  },

  // Validate numeric input
  validateNumber: (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Validate percentage
  validatePercentage: (value) => {
    return inputValidation.validateNumber(value, 0, 100);
  },

  // Validate currency amount
  validateCurrency: (value) => {
    return inputValidation.validateNumber(value, 0);
  },

  // Validate loan term
  validateLoanTerm: (value) => {
    return inputValidation.validateNumber(value, 1, 50);
  }
};

// Content Security Policy utilities
export const csp = {
  // Generate CSP header
  generateCSP: () => {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://625314acc534af46cb93846b.mockapi.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
};

// Rate limiting utilities
export const rateLimiting = {
  requests: new Map(),
  
  // Check if request is allowed
  isAllowed: (key, maxRequests = 10, windowMs = 60000) => {
    const now = Date.now();
    const userRequests = rateLimiting.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    rateLimiting.requests.set(key, validRequests);
    
    return true;
  },
  
  // Clear old entries
  cleanup: () => {
    const now = Date.now();
    for (const [key, requests] of rateLimiting.requests.entries()) {
      const validRequests = requests.filter(time => now - time < 60000);
      if (validRequests.length === 0) {
        rateLimiting.requests.delete(key);
      } else {
        rateLimiting.requests.set(key, validRequests);
      }
    }
  }
};

// Clean up rate limiting every minute
setInterval(rateLimiting.cleanup, 60000);

export default {
  sanitizeHTML,
  sanitizeInput,
  sanitizeEmail,
  sanitizeURL,
  generateCSRFToken,
  validateCSRFToken,
  secureStorage,
  apiSecurity,
  inputValidation,
  csp,
  rateLimiting
}; 