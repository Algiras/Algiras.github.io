import {
    ActionIcon, Button, Container,
    Drawer, Group, Stack,
    Title, useMantineColorScheme
} from '@mantine/core';
import { Calculator, FileText, Home, Menu, Moon, Sun, Gamepad2, Bot } from 'lucide-react';
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
  // Persist color scheme toggle
  useEffect(() => {
    try {
      localStorage.setItem('color-scheme', colorScheme === 'dark' ? 'dark' : 'light');
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [colorScheme]);
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
      label: 'Games',
      path: '/games',
      icon: Gamepad2,
    },
    {
      label: 'AI',
      path: '/ai',
      icon: Bot,
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

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpened]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpened(false);
  }, [location.pathname]);

  return (
    <Container size="lg" h="100%">
      <Group h="100%" justify="space-between">
        <Link 
          to="/"
          style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Title order={3}>
            Algimantas K.
          </Title>
        </Link>

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpened(true);
              }}
              variant="light"
              size="xl"
              aria-label="Open navigation menu"
              styles={{
                root: {
                  border: '1px solid var(--mantine-color-default-border)',
                  '&:hover': {
                    backgroundColor: 'var(--mantine-color-default-hover)',
                    transform: 'scale(1.05)'
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                    backgroundColor: 'var(--mantine-color-default-hover)'
                  }
                }
              }}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                minWidth: '48px',
                minHeight: '48px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Menu size={22} />
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

        {/* Mobile Drawer - always render but only open on mobile */}
        <Drawer
            opened={mobileMenuOpened && isMobile}
            onClose={() => setMobileMenuOpened(false)}
            title="Navigation"
            position="right"
            size="80%"
            overlayProps={{ 
              opacity: 0.6, 
              blur: 4,
              onClick: () => setMobileMenuOpened(false)
            }}
            trapFocus
            closeOnClickOutside
            closeOnEscape
            transitionProps={{
              transition: 'slide-left',
              duration: 200,
              timingFunction: 'ease'
            }}
            styles={{
              content: {
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
              },
              body: {
                flex: 1,
                padding: '1rem',
                paddingTop: '0.5rem'
              }
            }}
          >
            <Stack gap="md">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    variant={location.pathname === item.path ? 'filled' : 'light'}
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
                        border: location.pathname === item.path ? 'none' : '1px solid var(--mantine-color-default-border)',
                      },
                      inner: {
                        justifyContent: 'flex-start',
                        gap: '12px'
                      }
                    }}
                    style={{ 
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      userSelect: 'none'
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
