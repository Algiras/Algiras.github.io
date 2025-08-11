import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Loader } from '@mantine/core';

const RouteTransition: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loading indicator when route changes
    setIsLoading(true);
    
    // Hide loading indicator after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <Loader 
        size="lg" 
        color="blue"
        style={{
          opacity: 0.8,
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
        }}
      />
    </Box>
  );
};

export default RouteTransition;
