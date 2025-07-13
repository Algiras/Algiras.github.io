import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Title, Grid, Textarea, Button, Text, Select, Group, Badge, Stack, Switch, NumberInput, Divider } from '@mantine/core';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { Download, Eye, FileText, Settings, Palette, Save, RotateCcw } from 'lucide-react';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useMarkdownDocumentPersistence } from '../../hooks/useCalculatorPersistence';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  styles: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
  };
}

const MarkdownToPDF: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === 'dark';
  const previewRef = useRef<HTMLDivElement>(null);

  // Use persistence hook
  const { data: persistedData, saveData, clearAllData, getLastUpdated } = useMarkdownDocumentPersistence();

  // Initialize with persisted data or default sample content
  const [markdown, setMarkdown] = useState(() => {
    if (persistedData?.content) {
      return persistedData.content;
    }
    return `# Document Title

## Introduction

This is a **sample markdown document** that demonstrates the capabilities of our markdown-to-PDF converter.

### Features

- Live preview as you type
- Multiple document templates
- Professional styling options
- Browser-based PDF generation
- No server required

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three

### Blockquote

> This is a blockquote. It can be used to highlight important information or quotes.

### Table

| Feature | Description | Status |
|---------|-------------|--------|
| Live Preview | Real-time markdown rendering | ✅ |
| PDF Export | Generate PDF documents | ✅ |
| Templates | Multiple styling options | ✅ |

---

**Thank you for using our markdown-to-PDF converter!**
`;
  });

  const [selectedTemplate, setSelectedTemplate] = useState(() => persistedData?.template || 'professional');
  const [customSettings, setCustomSettings] = useState(() => ({
    fontSize: persistedData?.settings?.fontSize || 12,
    lineHeight: persistedData?.settings?.lineHeight || 1.6,
    includePageNumbers: persistedData?.settings?.includePageNumbers ?? true,
    includeHeader: persistedData?.settings?.includeHeader || false,
    headerText: persistedData?.settings?.headerText || '',
    includeFooter: persistedData?.settings?.includeFooter || false,
    footerText: persistedData?.settings?.footerText || '',
         pageSize: persistedData?.settings?.pageSize || 'a4',
    pageMargins: {
      top: persistedData?.settings?.marginTop || 20,
      right: persistedData?.settings?.marginRight || 20,
      bottom: persistedData?.settings?.marginBottom || 20,
      left: persistedData?.settings?.marginLeft || 20
    }
  }));

  // Auto-save data when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveData({
        content: markdown,
        template: selectedTemplate,
        settings: {
          fontSize: customSettings.fontSize,
          lineHeight: customSettings.lineHeight,
          includePageNumbers: customSettings.includePageNumbers,
          includeHeader: customSettings.includeHeader,
          includeFooter: customSettings.includeFooter,
          headerText: customSettings.headerText,
          footerText: customSettings.footerText,
          pageSize: customSettings.pageSize,
          marginTop: customSettings.pageMargins.top,
          marginRight: customSettings.pageMargins.right,
          marginBottom: customSettings.pageMargins.bottom,
          marginLeft: customSettings.pageMargins.left,
        }
      });
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [markdown, selectedTemplate, customSettings, saveData]);

  const templates: DocumentTemplate[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, business-appropriate styling',
      styles: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        lineHeight: 1.6,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          text: '#1e293b',
          background: '#ffffff'
        }
      }
    },
    {
      id: 'academic',
      name: 'Academic',
      description: 'Formal academic paper styling',
      styles: {
        fontFamily: 'Times New Roman, serif',
        fontSize: 11,
        lineHeight: 2.0,
        margins: { top: 25, right: 25, bottom: 25, left: 25 },
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          text: '#111827',
          background: '#ffffff'
        }
      }
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with accent colors',
      styles: {
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 13,
        lineHeight: 1.5,
        margins: { top: 15, right: 15, bottom: 15, left: 15 },
        colors: {
          primary: '#7c3aed',
          secondary: '#a78bfa',
          text: '#374151',
          background: '#ffffff'
        }
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and simple styling',
      styles: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        lineHeight: 1.4,
        margins: { top: 30, right: 30, bottom: 30, left: 30 },
        colors: {
          primary: '#000000',
          secondary: '#666666',
          text: '#333333',
          background: '#ffffff'
        }
      }
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  // Check if content is empty or only whitespace
  const trimmedMarkdown = markdown.trim();
  const isContentEmpty = useMemo(() => {
    return !trimmedMarkdown;
  }, [trimmedMarkdown]);

  const htmlContent = useMemo(() => {
    // Always try to render the actual content, even if empty
    try {
      const result = marked(trimmedMarkdown || '');
      return typeof result === 'string' ? result : '<p>Error parsing markdown</p>';
    } catch (error) {
      return '<p style="color: #ef4444;">Error parsing markdown. Please check your syntax.</p>';
    }
  }, [trimmedMarkdown]);

  const generatePDF = async () => {
    // Check for empty content
    if (isContentEmpty) {
      alert('Cannot generate PDF: No content to export. Please add some markdown content first.');
      return;
    }

    if (!previewRef.current) {
      alert('Cannot generate PDF: Preview not available. Please try again.');
      return;
    }

    try {
      // Page size configurations
      const pageConfigs = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 }
      };
      
      const pageConfig = pageConfigs[customSettings.pageSize];
      const margins = customSettings.pageMargins;
      
      // Calculate content area
      const contentWidth = pageConfig.width - margins.left - margins.right;
      const contentHeight = pageConfig.height - margins.top - margins.bottom;
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: currentTemplate.styles.colors.background,
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight
      });

      // Check if canvas is valid
      if (canvas.width === 0 || canvas.height === 0) {
        alert('Cannot generate PDF: Invalid content dimensions. Please check your content.');
        return;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', customSettings.pageSize);
      
      // Calculate scaling to fit content width
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate how many pages we need
      const pagesNeeded = Math.ceil(imgHeight / contentHeight);
      
      // Add pages with proper margins and page breaks
      for (let page = 0; page < pagesNeeded; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the image for this page
        const sourceY = page * contentHeight * (canvas.width / imgWidth);
        const sourceHeight = Math.min(contentHeight * (canvas.width / imgWidth), canvas.height - sourceY);
        
        // Create a temporary canvas for this page portion
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
          
          // Add image with margins
          pdf.addImage(
            pageImgData,
            'PNG',
            margins.left,
            margins.top,
            imgWidth,
            pageImgHeight
          );
        }
        
        // Add headers if enabled
        if (customSettings.includeHeader && customSettings.headerText) {
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(customSettings.headerText, margins.left, margins.top - 5);
        }
        
        // Add footers if enabled
        if (customSettings.includeFooter && customSettings.footerText) {
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(customSettings.footerText, margins.left, pageConfig.height - margins.bottom + 15);
        }
      }

      // Add page numbers if enabled
      if (customSettings.includePageNumbers) {
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          
          // Position page numbers at bottom center
          const pageNumberY = pageConfig.height - margins.bottom + 15;
          pdf.text(`Page ${i} of ${pageCount}`, pageConfig.width / 2, pageNumberY, { align: 'center' });
        }
      }

      // Save the PDF
      pdf.save('document.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
    }
  };

  const pageWidths = {
    a4: '210mm',
    letter: '216mm'
  };

  const previewStyles = {
    fontFamily: currentTemplate.styles.fontFamily,
    fontSize: `${customSettings.fontSize}px`,
    lineHeight: customSettings.lineHeight,
    color: currentTemplate.styles.colors.text,
    backgroundColor: currentTemplate.styles.colors.background, // Always white for document
    padding: `${customSettings.pageMargins.top}mm ${customSettings.pageMargins.right}mm ${customSettings.pageMargins.bottom}mm ${customSettings.pageMargins.left}mm`,
    minHeight: '800px',
    maxWidth: pageWidths[customSettings.pageSize],
    margin: '0 auto',
    boxShadow: isDark ? '0 0 10px rgba(0,0,0,0.3)' : '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`
  };

  return (
    <div className="space-y-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2} className="flex items-center gap-2">
            <FileText size={24} />
            Markdown to PDF Converter
          </Title>
          <Badge variant="light" color="blue">Browser-based</Badge>
        </Group>

        {/* Instructions for ChatGPT */}
        <Card 
          shadow="xs" 
          padding="md" 
          radius="md" 
          withBorder 
          mb="lg" 
          style={{ 
            backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0]
          }}
        >
          <Stack gap="sm">
            <Group gap="xs">
              <Text size="sm" fw={600} c={theme.primaryColor}>💡 Pro Tip: Generate content with ChatGPT</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Copy this prompt to ChatGPT to generate markdown-ready documents:
            </Text>
            <Card 
              shadow="xs" 
              padding="sm" 
              radius="sm" 
              style={{ 
                backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`
              }}
            >
              <Text size="xs" style={{ fontFamily: theme.fontFamilyMonospace }}>
                "Please create a [document type] in markdown format. Use proper markdown syntax including # for headings, ** for bold, * for italic, - for bullet points, numbered lists, code blocks with ```, tables with | separators, and {'>'} for blockquotes. Format it so I can copy and paste directly into a markdown editor."
              </Text>
            </Card>
            <Text size="xs" c="dimmed">
              Replace [document type] with: report, resume, proposal, article, documentation, etc.
            </Text>
          </Stack>
        </Card>

        {/* Main Editor and Preview Grid */}
        <Grid align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md" h="100%">
              <Group justify="space-between">
                <Text size="lg" fw={600}>Editor</Text>
                <Group gap="xs">
                  <Button
                    onClick={() => setMarkdown('')}
                    size="sm"
                    variant="light"
                    color="red"
                    disabled={isContentEmpty}
                    title="Clear all content"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={clearAllData}
                    size="sm"
                    variant="light"
                    color="gray"
                    leftSection={<RotateCcw size={16} />}
                    title="Reset to defaults and clear saved data"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={generatePDF}
                    size="sm"
                    leftSection={<Download size={16} />}
                    variant="filled"
                    color="blue"
                    disabled={isContentEmpty}
                    title={isContentEmpty ? 'Add some content to export PDF' : 'Export document as PDF'}
                  >
                    Export PDF
                  </Button>
                </Group>
              </Group>

              <Textarea
                value={markdown}
                onChange={(event) => setMarkdown(event.currentTarget.value)}
                placeholder="Enter your markdown content here...

Try typing:
# My Document Title
## Introduction
This is a **bold** and *italic* text example.

- List item 1
- List item 2

> This is a blockquote

```javascript
console.log('Hello, world!');
```"
                styles={{
                  input: {
                    fontFamily: 'Monaco, Menlo, monospace',
                    fontSize: '14px',
                    height: '800px',
                    resize: 'vertical'
                  }
                }}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md" h="100%">
              <Group justify="space-between">
                <Text size="lg" fw={600}>Preview</Text>
                <Badge 
                  variant="light" 
                  color={isContentEmpty ? "gray" : "green"} 
                  leftSection={<Eye size={12} />}
                >
                  {isContentEmpty ? "No Content" : "Live Preview"}
                </Badge>
              </Group>

              <div
                ref={previewRef}
                style={{
                  ...previewStyles,
                  height: '800px',
                  overflow: 'auto'
                }}
                className="preview-content"
              >
                {/* Header Preview */}
                {customSettings.includeHeader && customSettings.headerText && (
                  <div style={{
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '10px',
                    marginBottom: '20px',
                    fontSize: '10px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    {customSettings.headerText}
                  </div>
                )}

                {isContentEmpty ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    color: '#9ca3af',
                    textAlign: 'center',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '8px',
                    margin: '20px 0'
                  }}>
                    <div style={{ fontSize: '2em', marginBottom: '0.5em' }}>📝</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Start typing to see your document preview</p>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                )}

                {/* Footer Preview */}
                {customSettings.includeFooter && customSettings.footerText && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '10px',
                    marginTop: '20px',
                    fontSize: '10px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    {customSettings.footerText}
                  </div>
                )}

                {/* Page Number Preview */}
                {customSettings.includePageNumbers && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '10px',
                    fontSize: '10px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    Page 1 of 1
                  </div>
                )}
              </div>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Annotations Section */}
        <Stack gap="sm" mt="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              <strong>Template:</strong> {currentTemplate.name} - {currentTemplate.description}
            </Text>
            <Text size="sm" c="dimmed">
              {trimmedMarkdown.length} characters • {trimmedMarkdown.split(/\s+/).filter(word => word.length > 0).length} words
            </Text>
          </Group>
          
          {getLastUpdated() && (
            <Text size="xs" c="dimmed" ta="center">
              <Save size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Auto-saved {getLastUpdated()?.toLocaleString()}
            </Text>
          )}
        </Stack>
      </Card>

      {/* Settings Section Below */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={600}>Document Settings</Text>
            <Select
              value={selectedTemplate}
              onChange={(value) => setSelectedTemplate(value || 'professional')}
              data={templates.map(t => ({ value: t.id, label: t.name }))}
              leftSection={<Palette size={16} />}
              size="sm"
              placeholder="Select template"
            />
          </Group>

          <Divider />

          <Group grow>
            <NumberInput
              label="Font Size"
              value={customSettings.fontSize}
              onChange={(value) => setCustomSettings(prev => ({ ...prev, fontSize: Number(value) || 12 }))}
              min={8}
              max={24}
              step={1}
            />
            <NumberInput
              label="Line Height"
              value={customSettings.lineHeight}
              onChange={(value) => setCustomSettings(prev => ({ ...prev, lineHeight: Number(value) || 1.6 }))}
              min={1}
              max={3}
              step={0.1}
              decimalScale={1}
            />
          </Group>

          <Group grow>
            <Select
              label="Page Size"
              value={customSettings.pageSize}
              onChange={(value) => setCustomSettings(prev => ({ ...prev, pageSize: (value as 'a4' | 'letter') || 'a4' }))}
              data={[
                { value: 'a4', label: 'A4 (210 × 297 mm)' },
                { value: 'letter', label: 'Letter (8.5 × 11 in)' }
              ]}
            />
            <NumberInput
              label="Top Margin (mm)"
              value={customSettings.pageMargins.top}
              onChange={(value) => setCustomSettings(prev => ({ 
                ...prev, 
                pageMargins: { ...prev.pageMargins, top: Number(value) || 20 }
              }))}
              min={5}
              max={50}
              step={1}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Left Margin (mm)"
              value={customSettings.pageMargins.left}
              onChange={(value) => setCustomSettings(prev => ({ 
                ...prev, 
                pageMargins: { ...prev.pageMargins, left: Number(value) || 20 }
              }))}
              min={5}
              max={50}
              step={1}
            />
            <NumberInput
              label="Right Margin (mm)"
              value={customSettings.pageMargins.right}
              onChange={(value) => setCustomSettings(prev => ({ 
                ...prev, 
                pageMargins: { ...prev.pageMargins, right: Number(value) || 20 }
              }))}
              min={5}
              max={50}
              step={1}
            />
            <NumberInput
              label="Bottom Margin (mm)"
              value={customSettings.pageMargins.bottom}
              onChange={(value) => setCustomSettings(prev => ({ 
                ...prev, 
                pageMargins: { ...prev.pageMargins, bottom: Number(value) || 20 }
              }))}
              min={5}
              max={50}
              step={1}
            />
          </Group>

          <Group grow>
            <Switch
              label="Include Page Numbers"
              checked={customSettings.includePageNumbers}
              onChange={(event) => setCustomSettings(prev => ({ ...prev, includePageNumbers: event.currentTarget.checked }))}
            />
            <div></div>
          </Group>

          <Switch
            label="Include Header"
            checked={customSettings.includeHeader}
            onChange={(event) => setCustomSettings(prev => ({ ...prev, includeHeader: event.currentTarget.checked }))}
          />

          <Textarea
            label="Header Text"
            value={customSettings.headerText}
            onChange={(event) => setCustomSettings(prev => ({ ...prev, headerText: event.currentTarget.value }))}
            placeholder="Enter header text..."
            rows={2}
            disabled={!customSettings.includeHeader}
            style={{ 
              height: '100%',
              opacity: customSettings.includeHeader ? 1 : 0.5,
              transition: 'opacity 0.2s ease'
            }}
          />

          <Switch
            label="Include Footer"
            checked={customSettings.includeFooter}
            onChange={(event) => setCustomSettings(prev => ({ ...prev, includeFooter: event.currentTarget.checked }))}
          />

          <Textarea
            label="Footer Text"
            value={customSettings.footerText}
            onChange={(event) => setCustomSettings(prev => ({ ...prev, footerText: event.currentTarget.value }))}
            placeholder="Enter footer text..."
            rows={2}
            disabled={!customSettings.includeFooter}
            style={{ 
              opacity: customSettings.includeFooter ? 1 : 0.5,
              transition: 'opacity 0.2s ease'
            }}
          />
        </Stack>
      </Card>

      <style>
        {`
          .preview-content h1 {
            color: ${currentTemplate.styles.colors.primary};
            font-size: 2em;
            margin-bottom: 0.5em;
            border-bottom: 2px solid ${currentTemplate.styles.colors.primary};
            padding-bottom: 0.3em;
          }
          .preview-content h2 {
            color: ${currentTemplate.styles.colors.primary};
            font-size: 1.5em;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          .preview-content h3 {
            color: ${currentTemplate.styles.colors.secondary};
            font-size: 1.2em;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          .preview-content code {
            background-color: #f5f5f5;
            color: #333;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: ${theme.fontFamilyMonospace};
            font-size: 0.9em;
          }
          .preview-content pre {
            background-color: #f8f9fa;
            color: #333;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
            border-left: 4px solid ${currentTemplate.styles.colors.primary};
          }
          .preview-content blockquote {
            border-left: 4px solid ${currentTemplate.styles.colors.secondary};
            padding-left: 1em;
            margin: 1em 0;
            color: ${currentTemplate.styles.colors.secondary};
            font-style: italic;
          }
          .preview-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
          }
          .preview-content th,
          .preview-content td {
            border: 1px solid #ddd;
            padding: 0.5em;
            text-align: left;
          }
          .preview-content th {
            background-color: ${currentTemplate.styles.colors.primary};
            color: white;
          }
          .preview-content ul,
          .preview-content ol {
            padding-left: 1.5em;
          }
          .preview-content li {
            margin-bottom: 0.3em;
          }
          .preview-content hr {
            border: none;
            height: 2px;
            background-color: ${currentTemplate.styles.colors.secondary};
            margin: 2em 0;
          }
          .preview-content strong {
            color: ${currentTemplate.styles.colors.primary};
          }
          .preview-content a {
            color: ${currentTemplate.styles.colors.primary};
            text-decoration: none;
          }
          .preview-content a:hover {
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};

export default MarkdownToPDF; 