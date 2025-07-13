import {
    Button as MantineButton,
    ButtonProps as MantineButtonProps
} from '@mantine/core';
import React from 'react';

interface ButtonProps extends MantineButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'filled'
    | 'outline'
    | 'subtle'
    | 'light'
    | 'default';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  ...props
}) => {
  // Map our custom variants to Mantine variants
  const getMantineVariant = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'filled';
      case 'secondary':
        return 'outline';
      default:
        return variant;
    }
  };

  return (
    <MantineButton
      variant={getMantineVariant(variant)}
      loading={isLoading}
      leftSection={icon && !isLoading ? icon : undefined}
      {...props}
    >
      {children}
    </MantineButton>
  );
};

export default Button;
