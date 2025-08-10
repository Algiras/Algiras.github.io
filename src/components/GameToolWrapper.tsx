import { Container, Stack } from '@mantine/core';
import React from 'react';
import BackToGamesButton from './BackToGamesButton';

interface GameToolWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  useContainer?: boolean;
}

const GameToolWrapper: React.FC<GameToolWrapperProps> = ({
  children,
  showBackButton = true,
  useContainer = true,
}) => {
  const content = (
    <Stack gap="xl" mt={showBackButton ? 'md' : 0} className="mobile-stack">
      {showBackButton && <BackToGamesButton />}
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

export default GameToolWrapper;


