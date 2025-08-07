import { Button } from '@mantine/core';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface BackToFinanceButtonProps {
  mb?: string;
}

const BackToFinanceButton: React.FC<BackToFinanceButtonProps> = ({ mb = "md" }) => {
  return (
    <Button 
      component={Link} 
      to="/finance" 
      mb={mb} 
      variant="light"
      leftSection={<ChevronLeft size={16} />}
      className="custom-button-hover"
    >
      Back to Finance
    </Button>
  );
};

export default BackToFinanceButton;