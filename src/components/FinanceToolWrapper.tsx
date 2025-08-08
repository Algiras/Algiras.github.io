import { Container, Stack } from '@mantine/core';
import React from 'react';
import BackToFinanceButton from './BackToFinanceButton';

interface FinanceToolWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  useContainer?: boolean;
}

const FinanceToolWrapper: React.FC<FinanceToolWrapperProps> = ({ 
  children, 
  showBackButton = true,
  useContainer = true
}) => {
  const content = (
    <Stack gap="xl" mt={showBackButton ? "md" : 0} className="mobile-stack">
      {showBackButton && <BackToFinanceButton />}
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

export default FinanceToolWrapper;