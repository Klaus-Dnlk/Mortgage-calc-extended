import React from 'react';
import { sanitizeHTML } from '../../utils/security';

/**
 * SafeHTML Component
 * 
 * Safely renders HTML content with XSS protection
 * Only allows specific HTML tags and attributes
 */
const SafeHTML = ({ 
  content, 
  allowedTags = ['b', 'i', 'em', 'strong', 'a', 'br'],
  allowedAttributes = ['href', 'target'],
  className,
  ...props 
}) => {
  if (!content) return null;

  const sanitizedContent = sanitizeHTML(content);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
};

export default SafeHTML; 