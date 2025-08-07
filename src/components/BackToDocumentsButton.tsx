import { Button } from '@mantine/core';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface BackToDocumentsButtonProps {
  mb?: string;
}

const BackToDocumentsButton: React.FC<BackToDocumentsButtonProps> = ({ mb = "md" }) => {
  return (
    <Button 
      component={Link} 
      to="/documents" 
      mb={mb} 
      variant="light"
      leftSection={<ChevronLeft size={16} />}
      className="custom-button-hover"
    >
      Back to Documents
    </Button>
  );
};

export default BackToDocumentsButton;