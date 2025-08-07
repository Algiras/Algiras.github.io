import {
    Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, ThemeIcon, Title
} from '@mantine/core';
import { Edit, FileText } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Documents: React.FC = () => {
  const documentTools = [
    {
      id: 'markdown-to-pdf',
      path: '/documents/markdown-to-pdf',
      title: 'Markdown to PDF',
      description: 'Convert markdown text to beautifully formatted PDF documents with live preview',
      icon: FileText,
      color: 'blue',
      tags: ['Markdown', 'PDF', 'Export'],
      features: [
        'Live markdown preview',
        'Multiple document templates',
        'Custom styling options',
        'Browser-based PDF generation',
        'No server required',
      ],
    },
  ];

  return (
    <Container size="xl" py={{ base: 'md', sm: 'lg', md: 'xl' }}>
      <Stack gap="xl" className="mobile-stack">
        {/* Header */}
        <Box ta="center">
          <Title 
            order={1} 
            size="h1"
            mb="md"
            className="mobile-title"
          >
            Document Tools
          </Title>
          <Text 
            size="lg" 
            c="dimmed" 
            maw={600} 
            mx="auto"
            className="mobile-description"
          >
            Powerful document creation and conversion tools that work entirely in your browser.
            Create, edit, and export professional documents with ease.
          </Text>
        </Box>

        {/* Document Tools Grid */}
        <SimpleGrid 
          cols={{ base: 1, md: 2, lg: 3 }} 
          spacing="xl"
          className="mobile-grid"
        >
          {documentTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card
                key={tool.id}
                padding="xl"
                radius="md"
                withBorder
                className="animate-card-glow mobile-card"
                style={{ height: '100%' }}
              >
                <Stack gap="md" h="100%" className="mobile-card-stack">
                  <Group gap="md" className="mobile-card-header">
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color={tool.color}
                      className="mobile-icon"
                    >
                      <IconComponent size={24} className="mobile-icon-svg" />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Title 
                        order={3} 
                        size="h4"
                        className="mobile-card-title"
                      >
                        {tool.title}
                      </Title>
                    </Box>
                  </Group>

                  <Text 
                    size="sm" 
                    c="dimmed" 
                    style={{ flex: 1 }}
                    className="mobile-card-description"
                  >
                    {tool.description}
                  </Text>

                  <Group gap="xs" mb="md" className="mobile-tags">
                    {tool.tags.map((tag) => (
                      <Badge
                        key={tag}
                        size="sm"
                        variant="light"
                        color={tool.color}
                        className="mobile-badge"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Stack gap="xs" mb="md" className="mobile-features">
                    <Text 
                      size="sm" 
                      fw={500}
                      className="mobile-features-title"
                    >
                      Key Features:
                    </Text>
                    {tool.features.map((feature, index) => (
                      <Text 
                        key={index} 
                        size="xs" 
                        c="dimmed"
                        className="mobile-feature-item"
                      >
                        • {feature}
                      </Text>
                    ))}
                  </Stack>

                  <Button
                    component={Link}
                    to={tool.path}
                    variant="light"
                    color={tool.color}
                    fullWidth
                    rightSection={<Edit size={16} />}
                    className="custom-button-hover mobile-action-button"
                  >
                    Open Editor
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>

      </Stack>
    </Container>
  );
};

export default Documents; 