import { ActionIcon, Box, Button, CopyButton, Group, Menu, Modal, Stack, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { Check, Copy, Download, FileText, Link as LinkIcon, Share2 } from 'lucide-react';
import React, { useState } from 'react';

export interface ExportOptions {
  calculatorType: string;
  calculatorName: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  generateMarkdown?: () => string;
  generateCSV?: () => { filename: string; data: string };
}

export interface ExportPanelProps {
  options: ExportOptions;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  variant?: 'fab' | 'menu';
}

/**
 * ExportPanel - Unified export UI for calculators
 * Provides PDF, CSV, Share, and Copy functionality
 */
export const ExportPanel: React.FC<ExportPanelProps> = ({
  options,
  position = 'top-right',
  variant = 'menu',
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Generate PDF from markdown
  const handlePDFExport = () => {
    const markdown = options.generateMarkdown?.() || generateDefaultMarkdown();

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site to generate PDFs.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.calculatorName} Report</title>
        <style>
          @page {
            size: Letter;
            margin: 20mm;
          }

          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              margin: 0;
              padding: 0;
            }
          }

          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            max-width: 100%;
            margin: 0;
            padding: 20px;
          }

          h1 {
            font-size: 24pt;
            margin-bottom: 10px;
            color: #1f2937;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
          }

          h2 {
            font-size: 18pt;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #374151;
          }

          h3 {
            font-size: 14pt;
            margin-top: 15px;
            margin-bottom: 8px;
            color: #4b5563;
          }

          p {
            margin-bottom: 10px;
          }

          strong {
            color: #1f2937;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }

          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #d1d5db;
            font-size: 9pt;
            color: #6b7280;
          }

          .metric {
            margin: 10px 0;
            padding: 10px;
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
          }
        </style>
      </head>
      <body>
        <div id="content"></div>
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
          Created with <a href="${window.location.origin}">Algiras Financial Tools</a>
        </div>
        <script>
          // Simple markdown-to-HTML converter
          function markdownToHTML(md) {
            let html = md
              // Headers
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              // Bold
              .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
              // Lists
              .replace(/^- (.*$)/gim, '<li>$1</li>')
              // Paragraphs
              .replace(/\\n\\n/g, '</p><p>')
              // Line breaks
              .replace(/\\n/g, '<br>');

            // Wrap list items
            html = html.replace(/(<li>.*<\\/li>)/gs, '<ul>$1</ul>');

            return '<p>' + html + '</p>';
          }

          const markdown = ${JSON.stringify(markdown)};
          document.getElementById('content').innerHTML = markdownToHTML(markdown);

          // Auto-print after content loads
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Generate CSV and trigger download
  const handleCSVExport = () => {
    const csvData = options.generateCSV?.();
    if (!csvData) {
      alert('CSV export not available for this calculator.');
      return;
    }

    const blob = new Blob([csvData.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', csvData.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate shareable URL
  const handleShare = () => {
    const stateString = JSON.stringify(options.inputs);
    const encoded = btoa(encodeURIComponent(stateString));
    const url = `${window.location.origin}${window.location.pathname}?calc=${encoded}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  // Copy formatted text summary
  const getTextSummary = () => {
    const markdown = options.generateMarkdown?.() || generateDefaultMarkdown();
    return markdown;
  };

  // Generate default markdown if not provided
  const generateDefaultMarkdown = () => {
    let md = `# ${options.calculatorName}\n\n`;
    md += `## Inputs\n\n`;
    Object.entries(options.inputs).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      md += `- **${label}**: ${value}\n`;
    });
    md += `\n## Results\n\n`;
    Object.entries(options.results).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      md += `- **${label}**: ${value}\n`;
    });
    md += `\n---\n\n*Generated on ${new Date().toLocaleDateString()}*\n`;
    return md;
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { position: 'absolute', top: 16, right: 16 },
    'bottom-right': { position: 'absolute', bottom: 16, right: 16 },
    'top-left': { position: 'absolute', top: 16, left: 16 },
    'bottom-left': { position: 'absolute', bottom: 16, left: 16 },
  };

  if (variant === 'fab') {
    return (
      <>
        <Box style={positionStyles[position]}>
          <Tooltip label="Export & Share" position="left">
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color={isDark ? 'cyan' : 'blue'}
              onClick={handleShare}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Share2 size={24} />
            </ActionIcon>
          </Tooltip>
        </Box>

        <Modal
          opened={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title="Share Calculation"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Share this link to save your calculation
            </Text>
            <Group>
              <Box style={{ flex: 1, overflow: 'hidden' }}>
                <Text
                  size="sm"
                  style={{
                    padding: '8px 12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 4,
                    wordBreak: 'break-all',
                  }}
                >
                  {shareUrl}
                </Text>
              </Box>
              <CopyButton value={shareUrl} timeout={2000}>
                {({ copied, copy }) => (
                  <Button
                    size="sm"
                    color={copied ? 'teal' : 'blue'}
                    onClick={copy}
                    leftSection={copied ? <Check size={16} /> : <Copy size={16} />}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        </Modal>
      </>
    );
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          variant={isDark ? 'outline' : 'light'}
          leftSection={<Share2 size={16} />}
          color={isDark ? 'cyan' : 'blue'}
        >
          Export & Share
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Export Options</Menu.Label>

        <Menu.Item
          leftSection={<FileText size={16} />}
          onClick={handlePDFExport}
        >
          Download PDF
        </Menu.Item>

        {options.generateCSV && (
          <Menu.Item
            leftSection={<Download size={16} />}
            onClick={handleCSVExport}
          >
            Export CSV
          </Menu.Item>
        )}

        <Menu.Divider />

        <Menu.Label>Share</Menu.Label>

        <Menu.Item
          leftSection={<LinkIcon size={16} />}
          onClick={handleShare}
        >
          Generate Link
        </Menu.Item>

        <CopyButton value={getTextSummary()} timeout={2000}>
          {({ copied, copy }) => (
            <Menu.Item
              leftSection={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={copy}
              color={copied ? 'teal' : undefined}
            >
              {copied ? 'Copied!' : 'Copy Summary'}
            </Menu.Item>
          )}
        </CopyButton>
      </Menu.Dropdown>

      <Modal
        opened={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Calculation"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Share this link to save your calculation. Anyone with this link can view your inputs and results.
          </Text>
          <Box>
            <Text
              size="sm"
              p="md"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 4,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {shareUrl}
            </Text>
          </Box>
          <Group justify="flex-end">
            <CopyButton value={shareUrl} timeout={2000}>
              {({ copied, copy }) => (
                <Button
                  color={copied ? 'teal' : 'blue'}
                  onClick={copy}
                  leftSection={copied ? <Check size={16} /> : <Copy size={16} />}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              )}
            </CopyButton>
          </Group>
        </Stack>
      </Modal>
    </Menu>
  );
};
