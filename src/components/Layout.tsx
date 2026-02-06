import { Anchor, AppShell, Box, Container, Group, Text } from '@mantine/core';
import React from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = React.useState(0);

  useRouteBasedTitle();

  React.useEffect(() => {
    const currentPath = window.location.pathname + window.location.hash;
    trackRouteChange(currentPath);
  }, []);

  React.useEffect(() => {
    let rafId: number;

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    const handleScroll = () => {
      rafId = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: { base: 60, sm: 50 } }}
      padding="md"
      styles={{
        header: {
          backgroundColor: 'transparent',
          borderBottom: 'none',
        },
        footer: {
          backgroundColor: 'transparent',
          borderTop: '1px solid var(--mantine-color-default-border)',
        },
      }}
    >
      {/* Scroll Progress Indicator */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 2,
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6)',
          boxShadow: '0 0 10px rgba(56, 190, 201, 0.6)',
          zIndex: 10000,
          transition: 'width 0.1s ease-out',
          pointerEvents: 'none',
        }}
      />

      <AppShell.Header className="glass-navbar">
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <Breadcrumb />
        <Box key={location.pathname} className="page-enter">
          {children}
        </Box>
      </AppShell.Main>

      <AppShell.Footer>
        <Container size="lg" h="100%">
          <Group h="100%" justify="center" gap="sm">
            <Text size="xs" c="dimmed">
              © {currentYear} Algimantas Krasnauskas
            </Text>
            <Text size="xs" c="dimmed">·</Text>
            <Anchor
              href="https://github.com/Algiras"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
            >
              GitHub
            </Anchor>
            <Text size="xs" c="dimmed">·</Text>
            <Anchor
              href="https://www.linkedin.com/in/asimplek"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
            >
              LinkedIn
            </Anchor>
          </Group>
        </Container>
      </AppShell.Footer>

      <CookieConsent />
    </AppShell>
  );
};

export default Layout;
