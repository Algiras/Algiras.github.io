import React from 'react';
import { AppShell, Container, Text, Group, Anchor, Box } from '@mantine/core';
import Navbar from './Navbar';
import CookieConsent from './CookieConsent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();

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
