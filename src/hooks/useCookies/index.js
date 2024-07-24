import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// Custom hook for cookies management
export const useCookies = () => {
  const [cookiesAccepted, setCookiesAccepted] = useState(null);

  // Check cookies status on mount
  useEffect(() => {
    const status = Cookies.get('cookies-accepted');
    setCookiesAccepted(status || null);
  }, []);

  // Accept all cookies
  const acceptAll = () => {
    Cookies.set('cookies-accepted', 'all', { expires: 365 });
    Cookies.set('analytics-cookies', 'true', { expires: 365 });
    Cookies.set('marketing-cookies', 'true', { expires: 365 });
    setCookiesAccepted('all');
  };

  // Accept only necessary cookies
  const acceptNecessary = () => {
    Cookies.set('cookies-accepted', 'necessary', { expires: 365 });
    Cookies.set('analytics-cookies', 'false', { expires: 365 });
    Cookies.set('marketing-cookies', 'false', { expires: 365 });
    setCookiesAccepted('necessary');
  };

  // Reject all cookies
  const rejectAll = () => {
    Cookies.set('cookies-accepted', 'none', { expires: 365 });
    Cookies.set('analytics-cookies', 'false', { expires: 365 });
    Cookies.set('marketing-cookies', 'false', { expires: 365 });
    setCookiesAccepted('none');
  };

  // Check if specific cookie type is accepted
  const isCookieAccepted = (type) => {
    const value = Cookies.get(`${type}-cookies`);
    return value === 'true';
  };

  // Get all cookies preferences
  const getCookiesPreferences = () => {
    return {
      accepted: cookiesAccepted,
      analytics: isCookieAccepted('analytics'),
      marketing: isCookieAccepted('marketing')
    };
  };

  return {
    cookiesAccepted,
    acceptAll,
    acceptNecessary,
    rejectAll,
    isCookieAccepted,
    getCookiesPreferences
  };
}; 