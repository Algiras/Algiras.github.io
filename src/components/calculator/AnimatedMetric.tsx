import { Group, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface AnimatedMetricProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  colorScheme?: 'positive' | 'negative' | 'neutral';
  previousValue?: number;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AnimatedMetric - Animated number counter with formatting and delta display
 * Counts from 0 (or previousValue) to target value with easeOut curve
 * Supports currency formatting, percentages, and color schemes
 */
export const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  colorScheme = 'neutral',
  previousValue,
  label,
  description,
  size = 'md',
}) => {
  const [count, setCount] = useState(previousValue ?? 0);
  const { colorScheme: theme } = useMantineColorScheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const startValue = previousValue ?? 0;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // EaseOut curve (same as hero counter)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = startValue + (value - startValue) * easeOut;

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, previousValue]);

  // Format number with decimals and separators
  const formattedValue = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Calculate delta if previousValue provided
  const delta = previousValue !== undefined ? value - previousValue : null;
  const deltaPercent = previousValue !== undefined && previousValue !== 0
    ? ((value - previousValue) / Math.abs(previousValue)) * 100
    : null;

  // Determine color based on scheme
  const getColor = () => {
    if (colorScheme === 'neutral') return isDark ? 'cyan' : 'blue';
    if (colorScheme === 'positive') return 'teal';
    if (colorScheme === 'negative') return 'red';
    return isDark ? 'cyan' : 'blue';
  };

  const color = getColor();

  // Size variants
  const sizes = {
    sm: { value: '1.5rem', label: 'sm', delta: 'xs' },
    md: { value: '2.5rem', label: 'md', delta: 'sm' },
    lg: { value: '3.5rem', label: 'lg', delta: 'md' },
  };

  return (
    <Stack gap="xs" className="calculator-metric">
      {label && (
        <Text size={sizes[size].label} fw={600} c="dimmed">
          {label}
        </Text>
      )}

      <Group gap="md" align="baseline">
        <Text
          size="xl"
          fw={700}
          style={{
            fontSize: sizes[size].value,
            color: `var(--mantine-color-${color}-6)`,
            lineHeight: 1,
          }}
        >
          {prefix}{formattedValue}{suffix}
        </Text>

        {delta !== null && delta !== 0 && (
          <Group gap={4} style={{ alignItems: 'center' }}>
            {delta > 0 ? (
              <TrendingUp size={16} color="var(--mantine-color-teal-6)" />
            ) : (
              <TrendingDown size={16} color="var(--mantine-color-red-6)" />
            )}
            <Text
              size={sizes[size].delta}
              fw={600}
              c={delta > 0 ? 'teal' : 'red'}
            >
              {delta > 0 ? '+' : ''}{delta.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}
              {deltaPercent !== null && ` (${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%)`}
            </Text>
          </Group>
        )}
      </Group>

      {description && (
        <Text size="xs" c="dimmed" lh={1.4}>
          {description}
        </Text>
      )}
    </Stack>
  );
};

// Convenience wrapper for currency
export const AnimatedCurrency: React.FC<Omit<AnimatedMetricProps, 'prefix'>> = (props) => (
  <AnimatedMetric {...props} prefix="$" />
);

// Convenience wrapper for percentage
export const AnimatedPercentage: React.FC<Omit<AnimatedMetricProps, 'suffix'>> = (props) => (
  <AnimatedMetric {...props} suffix="%" decimals={props.decimals ?? 2} />
);
