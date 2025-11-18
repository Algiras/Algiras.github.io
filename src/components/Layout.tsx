import { Anchor, AppShell, Container, Group, Stack, Text } from '@mantine/core';
import React from 'react';
import { trackRouteChange } from '../utils/analytics';
import { useRouteBasedTitle } from '../utils/documentUtils';
import Breadcrumb from './Breadcrumb';
import CookieConsent from './CookieConsent';
import Navbar from './Navbar';

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
      footer={{ height: { base: 120, sm: 100 } }}
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
        <Container size="lg" h="100%" py={{ base: 'md', sm: 'md' }}>
          <Stack h="100%" justify="center" align="center" gap="xs">
            <Text size="sm" ta="center">
              © {currentYear} Algimantas Krasnauskas | All rights reserved
            </Text>
            <Group justify="center" gap="xs" wrap="wrap">
              <Anchor
                href="https://github.com/Algiras"
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                GitHub
              </Anchor>
              <Text size="sm" c="dimmed" display={{ base: 'none', sm: 'block' }}>
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
              <Text size="sm" c="dimmed" display={{ base: 'none', sm: 'block' }}>
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
              <Text size="sm" c="dimmed" display={{ base: 'none', sm: 'block' }}>
                |
              </Text>
              <Text size="sm" c="dimmed">
                Built with React & Mantine
              </Text>
            </Group>
          </Stack>
        </Container>
      </AppShell.Footer>

      <CookieConsent />
    </AppShell>
  );
};

export default Layout;
