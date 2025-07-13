import { Button, Group, Paper, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { setAnalyticsConsent } from '../utils/analytics';

// Key for tracking if the consent banner has been shown across the entire site
const COOKIE_CONSENT_SHOWN_KEY = 'site_cookie_consent_shown';

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsentBannerBeenShown = localStorage.getItem(
      COOKIE_CONSENT_SHOWN_KEY
    );
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
    <Paper
      shadow="lg"
      p="md"
      radius="md"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <Group justify="space-between" align="flex-start" gap="md">
        <Text size="sm" style={{ flex: 1 }}>
          This website uses cookies to enhance your experience across all tools
          and projects. By continuing to use this site, you agree to our use of
          cookies.
        </Text>
        <Button
          variant="filled"
          size="sm"
          onClick={handleAccept}
          style={{ flexShrink: 0 }}
        >
          Accept
        </Button>
      </Group>
    </Paper>
  );
};

export default CookieConsent;
