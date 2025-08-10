import { Button } from '@mantine/core';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface BackToGamesButtonProps {
  mb?: string;
}

const BackToGamesButton: React.FC<BackToGamesButtonProps> = ({ mb = 'md' }) => {
  return (
    <Button
      component={Link}
      to="/games"
      mb={mb}
      variant="light"
      leftSection={<ChevronLeft size={16} />}
      className="custom-button-hover"
    >
      Back to Games
    </Button>
  );
};

export default BackToGamesButton;


