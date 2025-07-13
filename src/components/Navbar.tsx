import {
    ActionIcon, Button, Container,
    Drawer, Group, Stack,
    Title, useMantineColorScheme
} from '@mantine/core';
import { Calculator, FileText, Home, Menu, Moon, Sun } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Custom hook to detect mobile screen size
const useIsMobile = (breakpoint: number = 768) => {
  // Start with a more accurate initial state
  const [isMobile, setIsMobile] = useState(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Check on mount (in case initial state was wrong)
    checkIsMobile();

    // Add event listener with passive option for better performance
    window.addEventListener('resize', checkIsMobile, { passive: true });

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};

const Navbar: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const location = useLocation();
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const isMobile = useIsMobile(768);

  const navigationItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
    },
    {
      label: 'Finance',
      path: '/finance',
      icon: Calculator,
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: FileText,
    },
  ];

  const handleMobileNavClick = () => {
    setMobileMenuOpened(false);
  };

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    if (mobileMenuOpened) {
      setMobileMenuOpened(false);
    }
  }, [location.pathname]);

  return (
    <Container size="lg" h="100%">
      <Group h="100%" justify="space-between">
        <Title order={3}>
          Algimantas K.
        </Title>

        {isMobile ? (
          // Mobile Navigation
          <Group gap="sm">
            <ActionIcon
              onClick={toggleColorScheme}
              variant="subtle"
              size="lg"
              aria-label="Toggle color scheme"
              style={{ touchAction: 'manipulation' }}
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>
            
            <ActionIcon
              onClick={() => setMobileMenuOpened(true)}
              variant="subtle"
              size="lg"
              aria-label="Open navigation menu"
              style={{ touchAction: 'manipulation' }}
            >
              <Menu size={20} />
            </ActionIcon>
          </Group>
        ) : (
          // Desktop Navigation
          <Group gap="md">
            <Group gap="xs">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    variant={location.pathname === item.path ? 'light' : 'subtle'}
                    leftSection={<IconComponent size={16} />}
                    size="sm"
                    className="custom-button-hover"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>

            <ActionIcon
              onClick={toggleColorScheme}
              variant="subtle"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>
          </Group>
        )}

        {/* Mobile Drawer - only render on mobile */}
        {isMobile && (
          <Drawer
            opened={mobileMenuOpened}
            onClose={() => setMobileMenuOpened(false)}
            title="Navigation"
            position="right"
            size="75%"
            overlayProps={{ opacity: 0.5, blur: 4 }}
            trapFocus
            closeOnClickOutside
            closeOnEscape
          >
            <Stack gap="md">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    variant={location.pathname === item.path ? 'light' : 'subtle'}
                    leftSection={<IconComponent size={18} />}
                    size="md"
                    fullWidth
                    onClick={handleMobileNavClick}
                    className="custom-button-hover"
                    justify="flex-start"
                    style={{ 
                      touchAction: 'manipulation',
                      minHeight: '48px' // Ensure good touch target size
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Drawer>
        )}
      </Group>
    </Container>
  );
};

export default Navbar;
