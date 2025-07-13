/**
 * Analytics module for Google Analytics 4 integration
 *
 * This module handles:
 * 1. User consent management for analytics
 * 2. Google Analytics initialization
 * 3. Page view and event tracking
 *
 * Analytics will only be initialized if:
 * - User has given explicit consent (stored in localStorage)
 * - Environment is production OR VITE_ENABLE_ANALYTICS=true
 */

import ReactGA from 'react-ga4';
import { ENABLE_ANALYTICS, GA_MEASUREMENT_ID } from '../constants/config';

// Constants for analytics consent
export const ANALYTICS_CONSENT_KEY = 'site-analytics-consent';

/**
 * Initialize Google Analytics based on environment and user consent
 */
export const initializeAnalytics = (): void => {
  const isProduction = import.meta.env.PROD;
  const hasConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';

  console.log(
    `Analytics initialization check: Production=${isProduction}, ENABLE_ANALYTICS=${ENABLE_ANALYTICS}, Consent=${hasConsent}`
  );

  // Only initialize if in production or analytics explicitly enabled, and user has given consent
  if ((isProduction || ENABLE_ANALYTICS) && hasConsent) {
    // Enable debug mode in development environment
    const debugMode = !isProduction;
    ReactGA.initialize(GA_MEASUREMENT_ID, { testMode: debugMode });
    console.log(
      `Google Analytics initialized with ID: ${GA_MEASUREMENT_ID}, Debug mode: ${debugMode}`
    );
  } else {
    console.log(
      'Google Analytics not initialized. Missing:',
      !hasConsent ? 'User consent' : 'Environment configuration'
    );
  }
};

/**
 * Track page views
 * @param path - The current page path
 */
export const trackPageView = (path: string): void => {
  const hasConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
  console.log(`Tracking page view: ${path}, Consent: ${hasConsent}`);
  if (hasConsent) {
    ReactGA.send({ hitType: 'pageview', page: path });
    console.log(`Page view sent to GA: ${path}`);
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
  console.log(
    `Tracking event: ${category}/${action}, Label: ${label}, Value: ${value}, Consent: ${hasConsent}`
  );
  if (hasConsent) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
    console.log(`Event sent to GA: ${category}/${action}`);
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
