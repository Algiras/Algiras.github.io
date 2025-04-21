import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import { setAnalyticsConsent } from '../utils/analytics';

// Key for tracking if the consent banner has been shown across the entire site
const COOKIE_CONSENT_SHOWN_KEY = 'site_cookie_consent_shown';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already given consent
    const hasConsentBannerBeenShown = localStorage.getItem(COOKIE_CONSENT_SHOWN_KEY);
    if (!hasConsentBannerBeenShown) {
      setShowConsent(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_SHOWN_KEY, 'true');
    // Always enable analytics when user accepts
    setAnalyticsConsent(true);
    setShowConsent(false);
  };
  
  if (!showConsent) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          {t('cookieConsent.message', 'This website uses cookies to enhance your experience across all tools and projects. By continuing to use this site, you agree to our use of cookies.')}
        </div>
        <Button 
          variant="primary" 
          onClick={handleAccept}
          className="whitespace-nowrap"
        >
          {t('cookieConsent.accept', 'Accept')}
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;