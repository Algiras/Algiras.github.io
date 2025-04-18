import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';

const COOKIE_CONSENT_KEY = 'calculator_cookie_consent';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      setShowConsent(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowConsent(false);
  };
  
  if (!showConsent) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          {t('calculator.cookieConsent.message')}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            onClick={handleAccept}
          >
            {t('calculator.cookieConsent.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;