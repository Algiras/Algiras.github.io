import {
    Card as MantineCard,
    CardProps as MantineCardProps, Text, Title
} from '@mantine/core';
import React from 'react';

interface CardProps extends MantineCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, ...props }) => {
  return (
    <MantineCard shadow="sm" padding="lg" radius="md" withBorder {...props}>
      {(title || subtitle) && (
        <MantineCard.Section withBorder inheritPadding py="xs">
          {title && <Title order={3}>{title}</Title>}
          {subtitle && (
            <Text size="sm" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </MantineCard.Section>
      )}
      <MantineCard.Section inheritPadding py="xs">
        {children}
      </MantineCard.Section>
    </MantineCard>
  );
};

export default Card;
