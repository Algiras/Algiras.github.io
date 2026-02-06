import {
  ActionIcon,
  Box,
  Button,
  Container,
  Drawer,
  Group,
  Stack,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import {
  BookOpen,
  Calculator,
  FileText,
  Home,
  Menu,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Custom hook to detect mobile screen size
const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile, { passive: true });
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};

const Navbar: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  useEffect(() => {
    try {
      localStorage.setItem(
        'color-scheme',
        colorScheme === 'dark' ? 'dark' : 'light'
      );
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [colorScheme]);
  const location = useLocation();
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const isMobile = useIsMobile(768);

  const navigationItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'About', path: '/about', icon: User },
    { label: 'Finance', path: '/finance', icon: Calculator },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Research', path: '/research', icon: BookOpen },
  ];

  const handleMobileNavClick = () => {
    setMobileMenuOpened(false);
  };

  useEffect(() => {
    if (mobileMenuOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpened]);

  useEffect(() => {
    setMobileMenuOpened(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Container size="lg" h="100%" className="glass-navbar">
      <Group h="100%" justify="space-between">
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Title order={3} className="hero-gradient-text" style={{ fontSize: '1.25rem' }}>
            Algimantas K.
          </Title>
        </Link>

        {isMobile ? (
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
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpened(true);
              }}
              variant="light"
              size="xl"
              aria-label="Open navigation menu"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                minWidth: '48px',
                minHeight: '48px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Menu size={22} />
            </ActionIcon>
          </Group>
        ) : (
          <Group gap="md">
            <Group gap="xs">
              {navigationItems.map(item => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Box key={item.path} style={{ position: 'relative' }}>
                    <Button
                      component={Link}
                      to={item.path}
                      variant={active ? 'light' : 'subtle'}
                      leftSection={<IconComponent size={16} />}
                      size="sm"
                      className="custom-button-hover"
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </Button>
                    {active && (
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          left: '20%',
                          right: '20%',
                          height: 2,
                          background: 'linear-gradient(90deg, #3b82f6, #38bec9)',
                          borderRadius: 1,
                          boxShadow: '0 0 8px rgba(56, 190, 201, 0.5)',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Group>

            <ActionIcon
              onClick={toggleColorScheme}
              variant="subtle"
              size="lg"
              aria-label="Toggle color scheme"
              className="custom-button-hover"
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>
          </Group>
        )}

        <Drawer
          opened={mobileMenuOpened && isMobile}
          onClose={() => setMobileMenuOpened(false)}
          title="Navigation"
          position="right"
          size="80%"
          overlayProps={{
            opacity: 0.6,
            blur: 4,
            onClick: () => setMobileMenuOpened(false),
          }}
          trapFocus
          closeOnClickOutside
          closeOnEscape
          transitionProps={{
            transition: 'slide-left',
            duration: 200,
            timingFunction: 'ease',
          }}
          styles={{
            content: {
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            },
            body: {
              flex: 1,
              padding: '1rem',
              paddingTop: '0.5rem',
            },
          }}
        >
          <Stack gap="md">
            {navigationItems.map(item => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  variant={isActive(item.path) ? 'filled' : 'light'}
                  leftSection={<IconComponent size={20} />}
                  size="lg"
                  fullWidth
                  onClick={handleMobileNavClick}
                  justify="flex-start"
                  styles={{
                    root: {
                      height: '56px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      border: isActive(item.path)
                        ? 'none'
                        : '1px solid var(--mantine-color-default-border)',
                    },
                    inner: {
                      justifyContent: 'flex-start',
                      gap: '12px',
                    },
                  }}
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Drawer>
      </Group>
    </Container>
  );
};

export default Navbar;
