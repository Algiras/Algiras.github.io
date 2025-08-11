import { Anchor, AppShell, Box, Container, Group, Text } from '@mantine/core';
import React from 'react';
import CookieConsent from './CookieConsent';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import { useRouteBasedTitle } from '../utils/documentUtils';
import { trackRouteChange } from '../utils/analytics';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();
  
  // Automatically set page titles based on current route
  useRouteBasedTitle();
  
  // Track route changes for analytics
  React.useEffect(() => {
    const currentPath = window.location.pathname + window.location.hash;
    trackRouteChange(currentPath);
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 100 }}
      padding="md"
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <Breadcrumb />
        {children}
      </AppShell.Main>

      <AppShell.Footer>
        <Container size="lg" h="100%">
          <Group h="100%" justify="center" align="center">
            <Box>
              <Text size="sm" ta="center" mb="xs">
                © {currentYear} Algimantas Krasnauskas | All rights reserved
              </Text>
              <Group justify="center" gap="xs">
                <Anchor
                  href="https://github.com/Algiras"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                >
                  GitHub
                </Anchor>
                <Text size="sm" c="dimmed">
                  |
                </Text>
                <Anchor
                  href="https://www.linkedin.com/in/asimplek"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                >
                  LinkedIn
                </Anchor>
                <Text size="sm" c="dimmed">
                  |
                </Text>
                <Anchor
                  href="https://algiras.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                >
                  algiras.github.io
                </Anchor>
                <Text size="sm" c="dimmed">
                  |
                </Text>
                <Text size="sm" c="dimmed">
                  Built with React & Mantine
                </Text>
              </Group>
            </Box>
          </Group>
        </Container>
      </AppShell.Footer>

      <CookieConsent />
    </AppShell>
  );
};

export default Layout;
