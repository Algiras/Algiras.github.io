import { Container, Stack } from '@mantine/core';
import React from 'react';
import BackToDocumentsButton from './BackToDocumentsButton';

interface DocumentToolWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  useContainer?: boolean;
}

const DocumentToolWrapper: React.FC<DocumentToolWrapperProps> = ({ 
  children, 
  showBackButton = true,
  useContainer = true
}) => {
  const content = (
    <Stack gap="xl" mt={showBackButton ? "md" : 0}>
      {showBackButton && <BackToDocumentsButton />}
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

export default DocumentToolWrapper;