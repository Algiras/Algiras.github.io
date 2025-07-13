import {
    ActionIcon, Button, Container,
    Group,
    Title, useMantineColorScheme
} from '@mantine/core';
import { Calculator, FileText, Home, Moon, Sun } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const location = useLocation();

  return (
    <Container size="lg" h="100%">
      <Group h="100%" justify="space-between">
        <Title order={3}>
          Algimantas K.
        </Title>

        <Group gap="md">
          <Group gap="xs">
            <Button
              component={Link}
              to="/"
              variant={location.pathname === '/' ? 'light' : 'subtle'}
              leftSection={<Home size={16} />}
              size="sm"
              className="custom-button-hover"
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/finance"
              variant={location.pathname === '/finance' ? 'light' : 'subtle'}
              leftSection={<Calculator size={16} />}
              size="sm"
              className="custom-button-hover"
            >
              Finance
            </Button>
            <Button
              component={Link}
              to="/documents"
              variant={location.pathname === '/documents' ? 'light' : 'subtle'}
              leftSection={<FileText size={16} />}
              size="sm"
              className="custom-button-hover"
            >
              Documents
            </Button>
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
      </Group>
    </Container>
  );
};

export default Navbar;
