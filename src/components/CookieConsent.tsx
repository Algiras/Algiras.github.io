import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import { setAnalyticsConsent, hasAnalyticsConsent } from '../utils/analytics';

const COOKIE_CONSENT_KEY = 'calculator_cookie_consent';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [showConsent, setShowConsent] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  
  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      setShowConsent(true);
    } else {
      // If they've already consented, check if analytics was enabled
      setAnalyticsEnabled(hasAnalyticsConsent());
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setAnalyticsConsent(analyticsEnabled);
    setShowConsent(false);
  };

  const handleAnalyticsToggle = () => {
    setAnalyticsEnabled(!analyticsEnabled);
  };
  
  if (!showConsent) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          {t('calculator.cookieConsent.message')}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="analytics-consent"
              checked={analyticsEnabled}
              onChange={handleAnalyticsToggle}
              className="h-4 w-4"
            />
            <label htmlFor="analytics-consent" className="text-sm">
              {t('calculator.cookieConsent.analytics', 'Enable analytics')}
            </label>
          </div>
          <Button 
            variant="primary" 
            onClick={handleAccept}
            className="w-full"
          >
            {t('calculator.cookieConsent.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;