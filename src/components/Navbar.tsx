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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

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
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>
            
            <ActionIcon
              onClick={() => setMobileMenuOpened(true)}
              variant="subtle"
              size="lg"
              aria-label="Open navigation menu"
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
