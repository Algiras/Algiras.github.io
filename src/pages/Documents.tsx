import React from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  Badge,
  Button,
  Stack,
  ThemeIcon,
  Box,
} from '@mantine/core';
import { FileText, Edit } from 'lucide-react';
import MarkdownToPDF from '../components/documents/MarkdownToPDF';

const Documents: React.FC = () => {
  const [activeDocument, setActiveDocument] = React.useState<string | null>(null);

  const documentTools = [
    {
      id: 'markdown-to-pdf',
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

  if (activeDocument === 'markdown-to-pdf') {
    return (
      <Container size="xl" py="xl">
        <Button onClick={() => setActiveDocument(null)} mb="md" variant="light">
          ← Back to Documents
        </Button>
        <MarkdownToPDF />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box ta="center">
          <Title order={1} size="h1" mb="md">
            Document Tools
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Powerful document creation and conversion tools that work entirely in your browser.
            Create, edit, and export professional documents with ease.
          </Text>
        </Box>

        {/* Document Tools Grid */}
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
          {documentTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card
                key={tool.id}
                padding="xl"
                radius="md"
                withBorder
                className="animate-card-glow"
                style={{ height: '100%' }}
              >
                <Stack gap="md" h="100%">
                  <Group gap="md">
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color={tool.color}
                    >
                      <IconComponent size={24} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Title order={3} size="h4">
                        {tool.title}
                      </Title>
                    </Box>
                  </Group>

                  <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                    {tool.description}
                  </Text>

                  <Group gap="xs" mb="md">
                    {tool.tags.map((tag) => (
                      <Badge
                        key={tag}
                        size="sm"
                        variant="light"
                        color={tool.color}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Stack gap="xs" mb="md">
                    <Text size="sm" fw={500}>
                      Key Features:
                    </Text>
                    {tool.features.map((feature, index) => (
                      <Text key={index} size="xs" c="dimmed">
                        • {feature}
                      </Text>
                    ))}
                  </Stack>

                  <Button
                    onClick={() => setActiveDocument(tool.id)}
                    variant="light"
                    color={tool.color}
                    fullWidth
                    rightSection={<Edit size={16} />}
                    className="custom-button-hover"
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