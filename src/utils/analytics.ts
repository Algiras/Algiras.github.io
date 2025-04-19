import ReactGA from 'react-ga4';
import { GA_MEASUREMENT_ID, ENABLE_ANALYTICS } from '../constants/config';

// Constants for analytics consent
export const ANALYTICS_CONSENT_KEY = 'tax-calc-analytics-consent';

/**
 * Initialize Google Analytics based on environment and user consent
 */
export const initializeAnalytics = (): void => {
  const isProduction = import.meta.env.PROD;
  const hasConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
  
  // Only initialize if in production or analytics explicitly enabled, and user has given consent
  if ((isProduction || ENABLE_ANALYTICS) && hasConsent) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('Google Analytics initialized');
  }
};

/**
 * Track page views
 * @param path - The current page path
 */
export const trackPageView = (path: string): void => {
  const hasConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
  if (hasConsent) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

/**
 * Track custom events
 * @param category - Event category
 * @param action - Event action
 * @param label - Optional event label
 * @param value - Optional event value
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  const hasConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
  if (hasConsent) {
    ReactGA.event({
      category,
      action,
      label,
      value
    });
  }
};

/**
 * Set user consent for analytics
 * @param consent - Whether the user has given consent
 */
export const setAnalyticsConsent = (consent: boolean): void => {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, consent ? 'true' : 'false');
  
  if (consent) {
    initializeAnalytics();
  }
};

/**
 * Check if user has given consent for analytics
 * @returns boolean indicating if user has given consent
 */
export const hasAnalyticsConsent = (): boolean => {
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
};
