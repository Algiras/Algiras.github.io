import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  Award,
  Book,
  Briefcase,
  Code,
  ExternalLink,
  GraduationCap,
  Heart,
  Languages,
  Mail,
  MapPin,
  Rocket,
  Sparkles,
  Terminal,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useDocumentTitle } from '../utils/documentUtils';

// Section wrapper with scroll animation
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  animationType?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'flipUp';
}> = ({ children, delay = 0, animationType = 'fadeUp' }) => {
  const { ref, style } = useScrollAnimation({ delay, animationType });
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
};

// Animated Skill Bar
const SkillBar: React.FC<{ name: string; level: number; color: string; delay: number }> = ({
  name,
  level,
  color,
  delay,
}) => {
  const [progress, setProgress] = useState(0);
  const { ref, isVisible } = useScrollAnimation({ delay });

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setProgress(level), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, level]);

  return (
    <Box ref={ref}>
      <Group justify="space-between" mb={5}>
        <Text size="sm" fw={500}>
          {name}
        </Text>
        <Text size="sm" c="dimmed">
          {level}%
        </Text>
      </Group>
      <Progress
        value={progress}
        color={color}
        size="md"
        radius="xl"
        style={{
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </Box>
  );
};

const AboutPage: React.FC = () => {
  useDocumentTitle('About Me - Algimantas Krasauskas');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 768px)');

  const skills = [
    { name: 'TypeScript / JavaScript', level: 95, color: 'blue' },
    { name: 'React / Next.js', level: 90, color: 'cyan' },
    { name: 'Rust', level: 85, color: 'orange' },
    { name: 'Scala / Functional Programming', level: 88, color: 'violet' },
    { name: 'Node.js / Backend', level: 87, color: 'green' },
    { name: 'AI / LLM Integration', level: 92, color: 'pink' },
    { name: 'System Architecture', level: 90, color: 'indigo' },
    { name: 'Open Source', level: 93, color: 'teal' },
  ];

  const languages = [
    { name: 'English', level: 'Native/Bilingual', flag: '🇬🇧' },
    { name: 'Lithuanian', level: 'Native', flag: '🇱🇹' },
    { name: 'German', level: 'Elementary', flag: '🇩🇪' },
  ];

  const interests = [
    { icon: Code, label: 'Open Source', color: 'blue' },
    { icon: Sparkles, label: 'AI & LLMs', color: 'violet' },
    { icon: Terminal, label: 'Rust', color: 'orange' },
    { icon: Book, label: 'Research', color: 'cyan' },
    { icon: Rocket, label: 'Developer Tools', color: 'pink' },
    { icon: Heart, label: 'Teaching', color: 'red' },
  ];

  const achievements = [
    { label: '8 Free Tools Built', value: '8', icon: Code, color: 'cyan' },
    { label: 'Open Source Projects', value: '15+', icon: Sparkles, color: 'violet' },
    { label: 'Certifications', value: '10+', icon: Award, color: 'orange' },
    { label: 'LinkedIn Connections', value: '500+', icon: User, color: 'green' },
  ];

  const certifications = [
    'Advanced Concepts in Time Value of Money (Coursera, 2021)',
    'Introduction to Time Value of Money (Coursera, 2021)',
    'Managing Your Money: MBA Insights (Coursera, 2020)',
    'Functional Programming in Haskell (FutureLearn, 2019)',
    'Functional Program Design in Scala (Coursera, 2018)',
    'Functional Programming Principles in Scala (Coursera, 2018)',
    'Introduction to Data Science in Python (Coursera, 2017)',
    'Enterprise Search using Apache Solr (Pluralsight)',
    'OAuth2, OpenID Connect and JWT (Pluralsight)',
    'The Dark Side of Technology Careers (Pluralsight)',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py={{ base: 80, md: 120 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container size="md">
          <AnimatedSection animationType="fadeUp">
            <Stack align="center" gap="xl" ta="center">
              {/* Profile Photo */}
              <Box
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: isDark
                    ? '0 0 60px rgba(56, 190, 201, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  border: `4px solid ${isDark ? 'rgba(56, 190, 201, 0.5)' : 'white'}`,
                  background: isDark ? 'rgba(56, 190, 201, 0.1)' : 'white',
                }}
                className="animate-orb-pulse"
              >
                <img
                  src="/images/profile.jpg"
                  alt="Algimantas Krasauskas"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              <Box>
                <Title order={1} size={isMobile ? 'h2' : 'h1'} mb="xs">
                  Algimantas{' '}
                  <Text component="span" inherit className="glow-text">
                    Krasauskas
                  </Text>
                </Title>
                <Text size="xl" fw={600} c="dimmed" mb="sm">
                  Senior Software Engineer at Wix
                </Text>
                <Group justify="center" gap="xs">
                  <Badge
                    size="lg"
                    variant="light"
                    color="cyan"
                    leftSection={<MapPin size={14} />}
                  >
                    Vilnius, Lithuania
                  </Badge>
                  <Badge size="lg" variant="light" color="green" leftSection={<Sparkles size={14} />}>
                    Available for Collaboration
                  </Badge>
                </Group>
              </Box>

              <Text size="lg" c="dimmed" maw={700} lh={1.7}>
                A highly motivated and experienced developer with a passion for continuous learning.
                Specializing in building developer tools, exploring AI/LLM capabilities, and
                creating open-source solutions. I combine functional programming principles (Scala, Haskell)
                with modern technologies (Rust, TypeScript, React) to solve real-world problems and push
                the boundaries of what's possible with AI.
              </Text>

              <Group gap="md">
                <Button
                  component="a"
                  href="mailto:algiras.dev@gmail.com"
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  leftSection={<Mail size={18} />}
                  className="custom-button-hover"
                >
                  Get in Touch
                </Button>
                <Button
                  component="a"
                  href="https://www.linkedin.com/in/asimplek"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="outline"
                  color="cyan"
                  rightSection={<ExternalLink size={16} />}
                  className="custom-button-hover"
                  style={{
                    borderColor: isDark ? 'rgba(56, 190, 201, 0.4)' : undefined,
                  }}
                >
                  LinkedIn Profile
                </Button>
              </Group>
            </Stack>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={{ base: 40, md: 60 }} style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
        <Container size="lg">
          <AnimatedSection>
            <Group justify="center" mb="lg">
              <Badge size="lg" variant="light" color="blue" leftSection={<User size={14} />}>
                703 LinkedIn Followers
              </Badge>
              <Badge size="lg" variant="light" color="green" leftSection={<Heart size={14} />}>
                2 Recommendations
              </Badge>
            </Group>
          </AnimatedSection>

          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <AnimatedSection key={achievement.label} delay={index * 100} animationType="scaleIn">
                  <Paper
                    p="lg"
                    className="glass-card"
                    style={{
                      textAlign: 'center',
                      borderTop: `3px solid var(--mantine-color-${achievement.color}-6)`,
                    }}
                  >
                    <ThemeIcon
                      size={50}
                      radius="md"
                      variant="light"
                      color={achievement.color}
                      mx="auto"
                      mb="sm"
                      className="neon-icon"
                    >
                      <Icon size={24} />
                    </ThemeIcon>
                    <Text size="xl" fw={700} className="glow-text">
                      {achievement.value}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {achievement.label}
                    </Text>
                  </Paper>
                </AnimatedSection>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Skills Section */}
      <Box py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <AnimatedSection animationType="flipUp">
            <Stack align="center" gap="md" ta="center" mb="xl">
              <ThemeIcon size={60} radius="md" variant="light" color="violet" className="neon-icon">
                <Code size={30} />
              </ThemeIcon>
              <Title order={2}>
                Technical{' '}
                <Text component="span" inherit className="glow-text">
                  Skills
                </Text>
              </Title>
              <Text size="md" c="dimmed" maw={600}>
                Core technologies and expertise areas I work with daily
              </Text>
            </Stack>
          </AnimatedSection>

          <Grid gutter="xl">
            {skills.map((skill, index) => (
              <Grid.Col key={skill.name} span={{ base: 12, sm: 6 }}>
                <AnimatedSection delay={index * 50}>
                  <SkillBar
                    name={skill.name}
                    level={skill.level}
                    color={skill.color}
                    delay={index * 100}
                  />
                </AnimatedSection>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Experience Timeline */}
      <Box py={{ base: 60, md: 80 }} style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
        <Container size="md">
          <AnimatedSection animationType="flipUp">
            <Stack align="center" gap="md" ta="center" mb="xl">
              <ThemeIcon size={60} radius="md" variant="light" color="blue" className="neon-icon">
                <Briefcase size={30} />
              </ThemeIcon>
              <Title order={2}>
                Career{' '}
                <Text component="span" inherit className="glow-text">
                  Journey
                </Text>
              </Title>
            </Stack>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <Timeline
              active={3}
              bulletSize={24}
              lineWidth={2}
              color="cyan"
              style={{
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              <Timeline.Item
                bullet={<Briefcase size={14} />}
                title={<Text fw={600}>Senior Software Engineer at Wix</Text>}
              >
                <Text size="sm" c="dimmed" mt={4}>
                  Present • Vilnius, Lithuania
                </Text>
                <Text size="sm" mt="xs">
                  Building developer tools and AI-powered solutions. Working on LLM evaluation
                  tools, RAG indexers, and innovative AI agent protocols.
                </Text>
                <Group gap="xs" mt="sm">
                  <Badge size="sm" variant="light" color="cyan">
                    AI/LLM
                  </Badge>
                  <Badge size="sm" variant="light" color="violet">
                    Rust
                  </Badge>
                  <Badge size="sm" variant="light" color="blue">
                    Developer Tools
                  </Badge>
                </Group>
              </Timeline.Item>

              <Timeline.Item
                bullet={<GraduationCap size={14} />}
                title={<Text fw={600}>Kaunas University of Technology</Text>}
              >
                <Text size="sm" c="dimmed" mt={4}>
                  2009 - 2013
                </Text>
                <Text size="sm" mt="xs">
                  Bachelor's degree in Computer Science. Built strong foundation in algorithms,
                  data structures, and software engineering principles.
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<Heart size={14} />}
                title={<Text fw={600}>Unity Game Developer at Tiny Lab Productions</Text>}
              >
                <Text size="sm" c="dimmed" mt={4}>
                  Dec 2014 - Feb 2015 • Volunteer
                </Text>
                <Text size="sm" mt="xs">
                  Contributed to game development projects using Unity engine, helping create
                  engaging gaming experiences for the community.
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<Award size={14} />}
                title={<Text fw={600}>10+ Professional Certifications</Text>}
              >
                <Text size="sm" mt="xs" mb="xs">
                  Continuous learning through Coursera, FutureLearn, and Pluralsight:
                </Text>
                <Stack gap={4}>
                  {certifications.slice(0, 5).map((cert) => (
                    <Text key={cert} size="xs" c="dimmed">
                      • {cert}
                    </Text>
                  ))}
                  <Text size="xs" c="dimmed" fs="italic">
                    + 5 more certifications
                  </Text>
                </Stack>
              </Timeline.Item>

              <Timeline.Item
                bullet={<Rocket size={14} />}
                title={<Text fw={600}>Open Source Contributions</Text>}
              >
                <Text size="sm" mt="xs">
                  Active contributor to open source projects including EmbedEval (LLM evaluation),
                  RustyPageIndex (vectorless RAG in Rust), Memory Palace Red Queen (AI learning),
                  and various AI/ML developer tools.
                </Text>
              </Timeline.Item>
            </Timeline>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Certifications Section */}
      <Box py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <AnimatedSection animationType="flipUp">
            <Stack align="center" gap="md" ta="center" mb="xl">
              <ThemeIcon size={60} radius="md" variant="light" color="orange" className="neon-icon">
                <Award size={30} />
              </ThemeIcon>
              <Title order={2}>
                Professional{' '}
                <Text component="span" inherit className="glow-text">
                  Certifications
                </Text>
              </Title>
              <Text size="md" c="dimmed" maw={600}>
                Committed to continuous learning and staying current with industry trends
              </Text>
            </Stack>
          </AnimatedSection>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {certifications.map((cert, index) => (
              <AnimatedSection key={cert} delay={index * 50} animationType="scaleIn">
                <Paper
                  p="md"
                  className="glass-card"
                  style={{
                    height: '100%',
                    borderLeft: `3px solid var(--mantine-color-orange-6)`,
                  }}
                >
                  <Group gap="xs" align="flex-start">
                    <ThemeIcon size="sm" radius="xl" variant="light" color="orange" mt={2}>
                      <Award size={12} />
                    </ThemeIcon>
                    <Text size="sm" style={{ flex: 1 }}>
                      {cert}
                    </Text>
                  </Group>
                </Paper>
              </AnimatedSection>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Languages & Interests */}
      <Box py={{ base: 60, md: 80 }} style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* Languages */}
            <AnimatedSection animationType="fadeLeft">
              <Paper p="xl" className="glass-card" style={{ height: '100%' }}>
                <Group mb="lg">
                  <ThemeIcon size={50} radius="md" variant="light" color="pink" className="neon-icon">
                    <Languages size={24} />
                  </ThemeIcon>
                  <Title order={3}>Languages</Title>
                </Group>
                <Stack gap="md">
                  {languages.map((lang) => (
                    <Group key={lang.name} justify="space-between">
                      <Group gap="sm">
                        <Text size="xl">{lang.flag}</Text>
                        <Text fw={500}>{lang.name}</Text>
                      </Group>
                      <Badge variant="light" color="pink">
                        {lang.level}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </AnimatedSection>

            {/* Interests */}
            <AnimatedSection animationType="fadeRight">
              <Paper p="xl" className="glass-card" style={{ height: '100%' }}>
                <Group mb="lg">
                  <ThemeIcon size={50} radius="md" variant="light" color="orange" className="neon-icon">
                    <Heart size={24} />
                  </ThemeIcon>
                  <Title order={3}>Interests</Title>
                </Group>
                <SimpleGrid cols={2} spacing="md">
                  {interests.map((interest) => {
                    const Icon = interest.icon;
                    return (
                      <Paper
                        key={interest.label}
                        p="md"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid var(--mantine-color-${interest.color}-6)`,
                          borderRadius: 8,
                        }}
                      >
                        <Stack align="center" gap="xs">
                          <ThemeIcon
                            size={40}
                            radius="md"
                            variant="light"
                            color={interest.color}
                          >
                            <Icon size={20} />
                          </ThemeIcon>
                          <Text size="sm" fw={500} ta="center">
                            {interest.label}
                          </Text>
                        </Stack>
                      </Paper>
                    );
                  })}
                </SimpleGrid>
              </Paper>
            </AnimatedSection>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Current Focus / Now */}
      <Box py={{ base: 60, md: 80 }} style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
        <Container size="md">
          <AnimatedSection animationType="scaleIn">
            <Paper
              p="xl"
              className="glass-card"
              style={{
                borderTop: `3px solid var(--mantine-color-cyan-6)`,
              }}
            >
              <Stack gap="lg">
                <Group>
                  <ThemeIcon size={50} radius="md" variant="light" color="cyan" className="neon-icon">
                    <Rocket size={24} />
                  </ThemeIcon>
                  <Title order={2}>
                    What I'm{' '}
                    <Text component="span" inherit className="glow-text">
                      Working On
                    </Text>
                  </Title>
                </Group>

                <Text size="md" lh={1.7}>
                  Currently exploring the intersection of AI and developer productivity. Building
                  tools that leverage LLMs for code evaluation, RAG-based search systems, and
                  innovative learning protocols. Also maintaining this portfolio with free financial
                  calculators and research papers.
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  <Box>
                    <Text size="sm" fw={600} mb="xs">
                      🔬 Research
                    </Text>
                    <Text size="xs" c="dimmed">
                      LLM evaluation methods, vectorless RAG approaches
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={600} mb="xs">
                      🛠️ Building
                    </Text>
                    <Text size="xs" c="dimmed">
                      Developer tools, AI agents, memory systems
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={600} mb="xs">
                      📚 Learning
                    </Text>
                    <Text size="xs" c="dimmed">
                      Advanced Rust patterns, AI safety, system design
                    </Text>
                  </Box>
                </SimpleGrid>

                <Group gap="md" mt="md">
                  <Button
                    component="a"
                    href="https://github.com/Algiras"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    rightSection={<ExternalLink size={16} />}
                    className="custom-button-hover"
                  >
                    View GitHub Projects
                  </Button>
                  <Button
                    component="a"
                    href="/research"
                    variant="outline"
                    color="cyan"
                    className="custom-button-hover"
                    style={{
                      borderColor: isDark ? 'rgba(56, 190, 201, 0.4)' : undefined,
                    }}
                  >
                    Read My Research
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </AnimatedSection>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 60, md: 80 }}>
        <Container size="md">
          <AnimatedSection animationType="scaleIn">
            <Paper
              p="xl"
              className="glass-card"
              ta="center"
              style={{
                borderTop: `3px solid var(--mantine-color-violet-6)`,
              }}
            >
              <Stack align="center" gap="lg">
                <Title order={2}>
                  Let's{' '}
                  <Text component="span" inherit className="glow-text">
                    Connect
                  </Text>
                </Title>
                <Text size="md" c="dimmed" maw={500}>
                  Interested in collaboration, have a project idea, or just want to chat about AI
                  and developer tools? I'd love to hear from you!
                </Text>
                <Group gap="md">
                  <Button
                    component="a"
                    href="mailto:algiras.dev@gmail.com"
                    size="lg"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    leftSection={<Mail size={18} />}
                    className="custom-button-hover"
                  >
                    Send Email
                  </Button>
                  <Button
                    component="a"
                    href="https://www.linkedin.com/in/asimplek"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    variant="outline"
                    color="cyan"
                    rightSection={<ExternalLink size={16} />}
                    className="custom-button-hover"
                    style={{
                      borderColor: isDark ? 'rgba(56, 190, 201, 0.4)' : undefined,
                    }}
                  >
                    Connect on LinkedIn
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
