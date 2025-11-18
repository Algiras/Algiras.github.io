import { Container, Stack } from '@mantine/core';
import React from 'react';
import BackButton from './BackButton';

type ToolCategory = 'finance' | 'documents' | 'games';

interface ToolWrapperProps {
  children: React.ReactNode;
  category: ToolCategory;
  showBackButton?: boolean;
  useContainer?: boolean;
}

const CATEGORY_CONFIG: Record<ToolCategory, { path: string; label: string }> = {
  finance: { path: '/finance', label: 'Back to Finance' },
  documents: { path: '/documents', label: 'Back to Documents' },
  games: { path: '/games', label: 'Back to Games' },
};

const ToolWrapper: React.FC<ToolWrapperProps> = ({
  children,
  category,
  showBackButton = true,
  useContainer = true,
}) => {
  const { path, label } = CATEGORY_CONFIG[category];

  const content = (
    <Stack gap="xl" mt={showBackButton ? 'md' : 0} className="mobile-stack">
      {showBackButton && <BackButton to={path} label={label} />}
      {children}
    </Stack>
  );

  if (useContainer) {
    return (
      <Container size="xl" py={{ base: 'md', sm: 'lg', md: 'xl' }}>
        {content}
      </Container>
    );
  }

  return content;
};

export default ToolWrapper;
