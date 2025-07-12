import React from 'react';
import {
  Container,
  Group,
  Title,
  ActionIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { Sun, Moon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Container size="lg" h="100%">
      <Group h="100%" justify="space-between">
        <Title order={3}>
          Algimantas K.
        </Title>

        <ActionIcon
          onClick={toggleColorScheme}
          variant="subtle"
          size="lg"
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </ActionIcon>
      </Group>
    </Container>
  );
};

export default Navbar;
