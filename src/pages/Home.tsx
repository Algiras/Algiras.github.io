import {
    ActionIcon, Badge,
    Box, Button, Card, Container, Divider, Flex, Group, SimpleGrid, Stack, Text, ThemeIcon, Title, Tooltip
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    ArrowRight, Bot, Code, Download,
    ExternalLink, Github, Linkedin, Mail,
    MapPin, Target, Users, Zap
} from 'lucide-react';
import React from 'react';

import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../utils/documentUtils';

const Home: React.FC = () => {
  useDocumentTitle('Algimantas Krasnauskas - Software Engineer');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const skills = [
    'React', 'TypeScript', 'Node.js', 'PostgreSQL', 
    'Docker', 'GraphQL', 'Functional Programming', 'ElasticSearch', 'Redis', 'Scala'
  ];

  return (
    <Container size="xl" py="xl" className="animated-background">
      {/* Hero Section */}
      <Box py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap="xl"
          >
            <Stack gap="xl" style={{ flex: 1 }}>
              <Box>
                <Text size="lg" c="dimmed" mb="xs">
                  Hello, I'm
                </Text>
                <Title
                  order={1}
                  size="3.5rem"
                  fw={800}
                  lh={1.1}
                  mb="md"
                  className="animate-gradient-text"
                >
                  Algimantas Krasnauskas
                </Title>
                <Text size="xl" c="dimmed" mb="lg">
                  Senior Software Engineer crafting scalable solutions with modern technologies.
                  Passionate about functional programming, AI integration, and building exceptional user experiences.
                </Text>
                <Group gap="md">
                  <Button
                    component="a"
                    href="https://github.com/Algiras"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    rightSection={<ArrowRight size={18} />}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    className="custom-button-hover"
                  >
                    View My Work
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftSection={<Download size={18} />}
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="custom-button-hover"
                  >
                    Contact Me
                  </Button>
                </Group>
              </Box>
              
              <Group gap="md">
                <Tooltip label="LinkedIn Profile">
                  <ActionIcon
                    component="a"
                    href="https://www.linkedin.com/in/asimplek"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    variant="subtle"
                    color="blue"
                    className="custom-button-hover"
                  >
                    <Linkedin size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="GitHub Profile">
                  <ActionIcon
                    component="a"
                    href="https://github.com/Algiras"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    variant="subtle"
                    color="gray"
                    className="custom-button-hover"
                  >
                    <Github size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Email Me">
                  <ActionIcon
                    component="a"
                    href="mailto:algiras.dev@gmail.com"
                    size="lg"
                    variant="subtle"
                    color="red"
                    className="custom-button-hover"
                  >
                    <Mail size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>

            <Box style={{ flex: 1 }} ta="center">
              <Box
                style={{
                  width: '100%',
                  maxWidth: 320,
                  height: 'auto',
                  aspectRatio: '1/1',
                  margin: '0 auto',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Floating Icons - Reduced animation */}
                {!isMobile && (
                  <>
                    <Box
                      style={{
                        position: 'absolute',
                        top: '10%',
                        left: '15%',
                        animation: 'float 6s ease-in-out infinite',
                      }}
                    >
                      <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                        <Bot size={20} />
                      </ThemeIcon>
                    </Box>
                    <Box
                      style={{
                        position: 'absolute',
                        top: '20%',
                        right: '10%',
                        animation: 'float 6s ease-in-out infinite 2s',
                      }}
                    >
                      <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                        <Zap size={20} />
                      </ThemeIcon>
                    </Box>
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '25%',
                        left: '8%',
                        animation: 'float 6s ease-in-out infinite 4s',
                      }}
                    >
                      <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                        <Target size={20} />
                      </ThemeIcon>
                    </Box>
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '15%',
                        right: '20%',
                        animation: 'float 6s ease-in-out infinite 3s',
                      }}
                    >
                      <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                        <Users size={20} />
                      </ThemeIcon>
                    </Box>
                  </>
                )}

                {/* Main Circle - Subtle animation */}
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: 280,
                    maxHeight: 280,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5), var(--mantine-color-indigo-6))',
                    borderRadius: '50%',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%)',
                    }}
                  />
                  <Stack align="center" gap="xs" style={{ zIndex: 1 }}>
                    <Code size={48} color="white" />
                    <Text size="xl" fw={700} c="white">
                      AK
                    </Text>
                    <Text size="xs" c="white" opacity={0.8}>
                      Software Engineer
                    </Text>
                  </Stack>
                </Box>
              </Box>
              <Group justify="center" mt="md" gap="xs">
                <MapPin size={16} />
                <Text size="sm" c="dimmed">Vilnius, Lithuania</Text>
              </Group>
            </Box>
          </Flex>
        </Container>
      </Box>

      <Divider my="xl" />

      {/* Skills Section */}
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Box ta="center">
            <Title order={2} size="h2" mb="md">
              Technical Expertise
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              Specialized in modern web technologies and passionate about clean, efficient code
            </Text>
          </Box>

          <Group justify="center" gap="sm">
            {skills.map((skill) => (
              <Badge
                key={skill}
                size="lg"
                variant="light"
                radius="md"
                className="animate-skill-bounce"
                style={{ 
                  cursor: 'pointer'
                }}
              >
                {skill}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Container>

      <Divider my="xl" />

      {/* About Section */}
      <Container size="lg" py="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack gap="md">
            <Title order={2} size="h2">
              About Me
            </Title>
            <Text size="md" c="dimmed" lh={1.6}>
              I'm a passionate software engineer with over 8 years of experience building 
              scalable web applications and leading development teams. My journey began with 
              a fascination for problem-solving through code, and it has evolved into a 
              career focused on creating meaningful digital experiences.
            </Text>
            <Text size="md" c="dimmed" lh={1.6}>
              Currently, I'm exploring the intersection of functional programming and AI, 
              always seeking to improve code quality and development efficiency. I believe 
              in writing clean, maintainable code that not only works but tells a story.
            </Text>
          </Stack>

          <SimpleGrid cols={1} spacing="md">
            <Card padding="lg" radius="md" withBorder className="animate-card-glow">
              <Group gap="md" align="flex-start">
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <Code size={20} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Title order={3} size="h4">
                    Functional Programming
                  </Title>
                  <Text size="sm" c="dimmed">
                    Exploring functional programming concepts and their practical applications 
                    in modern software development, focusing on immutability and declarative patterns.
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Card padding="lg" radius="md" withBorder className="animate-card-glow">
              <Group gap="md" align="flex-start">
                <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                  <Bot size={20} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Title order={3} size="h4">
                    AI & Machine Learning
                  </Title>
                  <Text size="sm" c="dimmed">
                    Investigating AI integration in software development, including automated 
                    testing, code generation, and intelligent user interfaces.
                  </Text>
                </Stack>
              </Group>
            </Card>
          </SimpleGrid>
        </SimpleGrid>
      </Container>

      <Divider my="xl" />

      {/* Contact Information Section */}
      <Container size="lg" py="xl" id="contact">
        <Stack gap="xl">
          <Box ta="center">
            <Title order={2} size="h2" mb="md">
              Get In Touch
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              Let's connect and discuss opportunities, collaborations, or just chat about technology
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder ta="center" className="animate-card-glow">
              <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="md">
                <Linkedin size={24} />
              </ThemeIcon>
              <Title order={4} size="h5" mb="xs">
                LinkedIn
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Connect with me professionally
              </Text>
              <Button
                component="a"
                href="https://www.linkedin.com/in/asimplek"
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                size="sm"
                fullWidth
                rightSection={<ExternalLink size={16} />}
                className="custom-button-hover"
              >
                View Profile
              </Button>
            </Card>

            <Card padding="lg" radius="md" withBorder ta="center" className="animate-card-glow">
              <ThemeIcon size="xl" radius="md" variant="light" color="gray" mb="md">
                <Github size={24} />
              </ThemeIcon>
              <Title order={4} size="h5" mb="xs">
                GitHub
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Explore my open source work
              </Text>
              <Button
                component="a"
                href="https://github.com/Algiras"
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                size="sm"
                fullWidth
                rightSection={<ExternalLink size={16} />}
                className="custom-button-hover"
              >
                View Repositories
              </Button>
            </Card>

            <Card padding="lg" radius="md" withBorder ta="center" className="animate-card-glow">
              <ThemeIcon size="xl" radius="md" variant="light" color="red" mb="md">
                <Mail size={24} />
              </ThemeIcon>
              <Title order={4} size="h5" mb="xs">
                Email
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Send me a direct message
              </Text>
              <Button
                component="a"
                href="mailto:algiras.dev@gmail.com"
                variant="light"
                size="sm"
                fullWidth
                rightSection={<Mail size={16} />}
                className="custom-button-hover"
              >
                Send Email
              </Button>
            </Card>
          </SimpleGrid>

          <Card padding="lg" radius="md" withBorder>
            <Group gap="md" align="center" justify="center">
              <ThemeIcon size="lg" radius="md" variant="light" color="green">
                <MapPin size={20} />
              </ThemeIcon>
              <Stack gap={0}>
                <Title order={4} size="h5">
                  Location
                </Title>
                <Text size="sm" c="dimmed">
                  Vilnius, Lithuania (UTC+2)
                </Text>
              </Stack>
            </Group>
          </Card>
        </Stack>
      </Container>

      <Divider my="xl" />

      {/* CTA Section */}
      <Container size="lg" py="xl">
        <Card padding="xl" radius="md" withBorder ta="center" className="animate-card-glow glass-effect">
          <Stack gap="md">
            <Title order={2} size="h2">
              Let's Build Something Amazing Together
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              I'm always interested in discussing new opportunities, innovative projects, 
              or just chatting about technology and development.
            </Text>
            <Group justify="center" gap="md" wrap="wrap">
              <Button
                component={Link}
                to="/finance"
                size={{ base: 'md', sm: 'lg' }}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                rightSection={<ArrowRight size={18} />}
                className="custom-button-hover"
              >
                Financial Tools
              </Button>
              <Button
                component={Link}
                to="/documents"
                size={{ base: 'md', sm: 'lg' }}
                variant="gradient"
                gradient={{ from: 'purple', to: 'pink' }}
                rightSection={<ArrowRight size={18} />}
                className="custom-button-hover"
              >
                Document Tools
              </Button>
              <Button
                component="a"
                href="https://github.com/Algiras"
                target="_blank"
                rel="noopener noreferrer"
                size={{ base: 'md', sm: 'lg' }}
                variant="outline"
                rightSection={<ExternalLink size={18} />}
                className="custom-button-hover"
              >
                View GitHub
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    </Container>
  );
};

export default Home;
