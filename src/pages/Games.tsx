import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Gamepad2, Rocket, Sparkles } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Games: React.FC = () => {
  const games = [
    {
      id: 'akotchi',
      path: '/games/akotchi',
      title: 'Akotchi',
      description:
        'A retro Tamagotchi-inspired virtual pet with pixel art, sound effects, and persistent storage. Care, play, and grow your Akotchi!',
      icon: Gamepad2,
      color: 'grape',
      tags: ['Retro', 'Canvas', 'LocalStorage'],
      features: ['Persistent pet state', 'Pixel animations', 'Simple actions', 'No backend required'],
    },
  ];

  return (
    <Container size="xl" py={{ base: 'md', sm: 'lg', md: 'xl' }}>
      <Stack gap="xl" className="mobile-stack">
        <Box ta="center">
          <Title order={1} size="h1" mb="md" className="mobile-title">
            Games
          </Title>
          <Text size="lg" c="dimmed" maw={700} mx="auto" className="mobile-description">
            Play small, delightful browser games built with web technologies. No downloads, no accounts.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl" className="mobile-grid">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card key={game.id} padding="xl" radius="md" withBorder className="animate-card-glow mobile-card">
                <Stack gap="md" className="mobile-card-stack">
                  <Group gap="md" className="mobile-card-header">
                    <ThemeIcon size="xl" radius="md" variant="light" color={game.color} className="mobile-icon">
                      <IconComponent size={24} className="mobile-icon-svg" />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Title order={3} size="h4" className="mobile-card-title">
                        {game.title}
                      </Title>
                    </Box>
                  </Group>

                  <Text size="sm" c="dimmed" style={{ flex: 1 }} className="mobile-card-description">
                    {game.description}
                  </Text>

                  <Group gap="xs" mb="md" className="mobile-tags">
                    {game.tags.map((tag) => (
                      <Badge key={tag} size="sm" variant="light" color={game.color} className="mobile-badge">
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Stack gap="xs" mb="md" className="mobile-features">
                    <Text size="sm" fw={500} className="mobile-features-title">
                      Key Features:
                    </Text>
                    {game.features.map((feature, index) => (
                      <Text key={index} size="xs" c="dimmed" className="mobile-feature-item">
                        • {feature}
                      </Text>
                    ))}
                  </Stack>

                  <Group justify="space-between" wrap="wrap">
                    <Button component={Link} to={game.path} variant="light" color={game.color} rightSection={<Rocket size={16} />}>
                      Play
                    </Button>
                    <Button component={Link} to={game.path} variant="subtle" rightSection={<Sparkles size={16} />}>
                      Learn more
                    </Button>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default Games;


