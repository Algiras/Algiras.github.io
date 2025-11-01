import { Anchor, AppShell, Box, Container, Group, Stack, Text } from '@mantine/core';
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
          <Stack h="100%" justify="center" align="center" gap={{ base: 'xs', sm: 'xs' }}>
            <Text size={{ base: 'xs', sm: 'sm' }} ta="center">
              © {currentYear} Algimantas Krasnauskas | All rights reserved
            </Text>
            <Group justify="center" gap={{ base: 'xs', sm: 'xs' }} wrap="wrap">
              <Anchor
                href="https://github.com/Algiras"
                target="_blank"
                rel="noopener noreferrer"
                size={{ base: 'xs', sm: 'sm' }}
              >
                GitHub
              </Anchor>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed" display={{ base: 'none', sm: 'block' }}>
                |
              </Text>
              <Anchor
                href="https://www.linkedin.com/in/asimplek"
                target="_blank"
                rel="noopener noreferrer"
                size={{ base: 'xs', sm: 'sm' }}
              >
                LinkedIn
              </Anchor>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed" display={{ base: 'none', sm: 'block' }}>
                |
              </Text>
              <Anchor
                href="https://algiras.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                size={{ base: 'xs', sm: 'sm' }}
              >
                algiras.github.io
              </Anchor>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed" display={{ base: 'none', sm: 'block' }}>
                |
              </Text>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed">
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
