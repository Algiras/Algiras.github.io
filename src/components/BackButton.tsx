import { Button } from '@mantine/core';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label: string;
  mb?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label, mb = 'md' }) => {
  return (
    <Button
      component={Link}
      to={to}
      mb={mb}
      variant="light"
      leftSection={<ChevronLeft size={16} />}
      className="custom-button-hover"
    >
      {label}
    </Button>
  );
};

export default BackButton;
