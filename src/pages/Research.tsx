import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { BookOpen, Download, ExternalLink, FileText } from 'lucide-react';
import React from 'react';
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

interface ResearchPaper {
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  description: string;
  pdfUrl: string;
  tags: string[];
  color: string;
}

const ResearchPage: React.FC = () => {
  useDocumentTitle('Research Papers');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const supportsHover = useMediaQuery('(hover: hover)');

  const papers: ResearchPaper[] = [
    {
      title: 'Skillz Research',
      authors: ['Algimantas Krasnauskas'],
      year: 2024,
      venue: 'Technical Report',
      description:
        'A comprehensive research paper exploring skill development, learning methodologies, and practical applications in modern software engineering.',
      pdfUrl: 'https://algiras.github.io/skillz/skillz-research.pdf',
      tags: ['Software Engineering', 'Skills', 'Learning'],
      color: 'cyan',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py={{ base: 60, md: 80 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container size="lg">
          <AnimatedSection animationType="fadeUp">
            <Stack align="center" gap="md" ta="center">
              <ThemeIcon size={80} radius="md" variant="light" color="cyan" className="neon-icon">
                <BookOpen size={40} />
              </ThemeIcon>

              <Title order={1} size={isMobile ? 'h2' : 'h1'}>
                Research{' '}
                <Text component="span" inherit className="glow-text">
                  Papers
                </Text>
              </Title>

              <Text size="lg" c="dimmed" maw={600}>
                Exploring innovative ideas, methodologies, and findings in software engineering and
                technology.
              </Text>

              <Box
                mx="auto"
                mt="md"
                style={{
                  width: 60,
                  height: 3,
                  background: 'linear-gradient(90deg, #3b82f6, #38bec9)',
                  borderRadius: 2,
                  boxShadow: isDark ? '0 0 10px rgba(56, 190, 201, 0.5)' : undefined,
                }}
              />
            </Stack>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Papers Section */}
      <Box py={{ base: 40, md: 60 }}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 1 }} spacing="xl">
            {papers.map((paper, index) => (
              <AnimatedSection
                key={paper.title}
                delay={index * 100}
                animationType={index % 2 === 0 ? 'fadeLeft' : 'fadeRight'}
              >
                <Paper
                  className="glass-card magnetic-item"
                  p={{ base: 'lg', md: 'xl' }}
                  style={{
                    borderRadius: 16,
                    borderTop: `3px solid var(--mantine-color-${paper.color}-6)`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => window.open(paper.pdfUrl, '_blank')}
                >
                  <Stack gap="md">
                    {/* Header */}
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="md">
                        <ThemeIcon
                          size="xl"
                          radius="md"
                          variant="light"
                          color={paper.color}
                          className="neon-icon"
                        >
                          <FileText size={24} />
                        </ThemeIcon>
                        <Box>
                          <Title order={3} size="h4" mb={4}>
                            {paper.title}
                          </Title>
                          <Text size="sm" c="dimmed">
                            {paper.authors.join(', ')} • {paper.year}
                            {paper.venue && ` • ${paper.venue}`}
                          </Text>
                        </Box>
                      </Group>
                    </Group>

                    {/* Description */}
                    <Text size="sm" c="dimmed" lh={1.6}>
                      {paper.description}
                    </Text>

                    {/* Tags */}
                    <Group gap="xs">
                      {paper.tags.map((tag) => (
                        <Badge
                          key={tag}
                          size="sm"
                          variant={isDark ? 'outline' : 'light'}
                          color={paper.color}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Group>

                    {/* Actions */}
                    <Group gap="md" mt="sm">
                      <Button
                        component="a"
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan' }}
                        leftSection={<Download size={18} />}
                        rightSection={<ExternalLink size={14} />}
                        className="custom-button-hover ripple-effect"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download PDF
                      </Button>
                      <Button
                        component="a"
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        color={paper.color}
                        leftSection={<BookOpen size={18} />}
                        className="custom-button-hover"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          borderColor: isDark ? `rgba(56, 190, 201, 0.4)` : undefined,
                        }}
                      >
                        Read Online
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              </AnimatedSection>
            ))}
          </SimpleGrid>

          {/* Coming Soon Section */}
          <AnimatedSection delay={200} animationType="scaleIn">
            <Box
              mt="xl"
              p="xl"
              ta="center"
              className="glass-card"
              style={{
                borderRadius: 16,
                borderTop: `3px solid var(--mantine-color-violet-6)`,
              }}
            >
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" variant="light" color="violet">
                  <FileText size={30} />
                </ThemeIcon>
                <Title order={3} size="h4">
                  More Papers Coming Soon
                </Title>
                <Text size="sm" c="dimmed" maw={500}>
                  Stay tuned for more research publications exploring cutting-edge topics in
                  software engineering, AI, and technology.
                </Text>
              </Stack>
            </Box>
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
};

export default ResearchPage;
