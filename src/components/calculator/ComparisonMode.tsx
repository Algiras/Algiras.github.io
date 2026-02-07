import { Badge, Box, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import React, { ReactNode } from 'react';

export interface ComparisonScenario {
  label: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  color: string;
}

export interface ComparisonModeProps {
  scenarios: ComparisonScenario[];
  renderCard: (scenario: ComparisonScenario, index: number) => ReactNode;
  compareMetrics?: string[]; // Which result metrics to compare
  metricFormatter?: (value: any) => string;
}

/**
 * ComparisonMode - Side-by-side scenario comparison
 * Shows 2-3 calculator instances with different inputs
 * Highlights differences with green/red deltas
 */
export const ComparisonMode: React.FC<ComparisonModeProps> = ({
  scenarios,
  renderCard,
  compareMetrics,
  metricFormatter = (v) => String(v),
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  if (scenarios.length < 2) {
    return <Text c="dimmed">Add at least 2 scenarios to compare</Text>;
  }

  // Calculate deltas for comparison metrics
  const getDelta = (metric: string, scenarioIndex: number): number | null => {
    if (scenarioIndex === 0) return null; // No delta for baseline

    const baseValue = scenarios[0].results[metric];
    const currentValue = scenarios[scenarioIndex].results[metric];

    if (typeof baseValue !== 'number' || typeof currentValue !== 'number') {
      return null;
    }

    return currentValue - baseValue;
  };

  const getDeltaPercent = (metric: string, scenarioIndex: number): number | null => {
    const delta = getDelta(metric, scenarioIndex);
    if (delta === null) return null;

    const baseValue = scenarios[0].results[metric];
    if (baseValue === 0) return null;

    return (delta / Math.abs(baseValue)) * 100;
  };

  return (
    <Stack gap="lg">
      {/* Comparison Header */}
      {compareMetrics && compareMetrics.length > 0 && (
        <Card withBorder p="md">
          <Text size="sm" fw={600} mb="md">
            Key Differences (vs {scenarios[0].label})
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {compareMetrics.map((metric) => (
              <Stack key={metric} gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                {scenarios.slice(1).map((scenario, idx) => {
                  const delta = getDelta(metric, idx + 1);
                  const deltaPercent = getDeltaPercent(metric, idx + 1);

                  if (delta === null) return null;

                  const isPositive = delta > 0;
                  const isNeutral = delta === 0;

                  return (
                    <Group key={scenario.label} gap="xs">
                      <Badge
                        size="xs"
                        variant="dot"
                        color={scenario.color}
                      >
                        {scenario.label}
                      </Badge>
                      <Group gap={4}>
                        {isNeutral ? (
                          <Minus size={14} color="var(--mantine-color-gray-5)" />
                        ) : isPositive ? (
                          <ArrowUp size={14} color="var(--mantine-color-red-6)" />
                        ) : (
                          <ArrowDown size={14} color="var(--mantine-color-teal-6)" />
                        )}
                        <Text
                          size="xs"
                          fw={600}
                          c={isNeutral ? 'dimmed' : isPositive ? 'red' : 'teal'}
                        >
                          {isPositive ? '+' : ''}{metricFormatter(delta)}
                          {deltaPercent !== null && ` (${isPositive ? '+' : ''}${deltaPercent.toFixed(1)}%)`}
                        </Text>
                      </Group>
                    </Group>
                  );
                })}
              </Stack>
            ))}
          </SimpleGrid>
        </Card>
      )}

      {/* Scenario Cards */}
      <SimpleGrid
        cols={{ base: 1, md: scenarios.length === 2 ? 2 : 3 }}
        spacing="lg"
      >
        {scenarios.map((scenario, index) => (
          <Box
            key={scenario.label}
            style={{
              position: 'relative',
            }}
          >
            {/* Scenario Label Badge */}
            <Badge
              size="lg"
              variant="filled"
              color={scenario.color}
              mb="sm"
              leftSection={
                index === 0 ? (
                  <ThemeIcon size="xs" color={scenario.color} radius="xl">
                    <Text size="xs" fw={700}>★</Text>
                  </ThemeIcon>
                ) : null
              }
            >
              {scenario.label}
              {index === 0 && ' (Baseline)'}
            </Badge>

            {/* Render the calculator card */}
            <Box
              style={{
                borderTop: `4px solid var(--mantine-color-${scenario.color}-6)`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {renderCard(scenario, index)}
            </Box>

            {/* Delta Badge for non-baseline scenarios */}
            {index > 0 && compareMetrics && compareMetrics.length > 0 && (
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  opacity: 0.9,
                }}
              >
                {(() => {
                  const primaryMetric = compareMetrics[0];
                  const delta = getDelta(primaryMetric, index);
                  if (delta === null || delta === 0) return null;

                  const isPositive = delta > 0;
                  return (
                    <Badge
                      size="sm"
                      variant="filled"
                      color={isPositive ? 'red' : 'teal'}
                      leftSection={isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    >
                      {isPositive ? '+' : ''}{metricFormatter(delta)}
                    </Badge>
                  );
                })()}
              </Box>
            )}
          </Box>
        ))}
      </SimpleGrid>

      {/* Comparison Legend */}
      <Card withBorder p="sm" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }}>
        <Group gap="xl" justify="center">
          <Group gap="xs">
            <ArrowDown size={14} color="var(--mantine-color-teal-6)" />
            <Text size="xs" c="dimmed">Lower (Better for costs)</Text>
          </Group>
          <Group gap="xs">
            <ArrowUp size={14} color="var(--mantine-color-red-6)" />
            <Text size="xs" c="dimmed">Higher (Worse for costs)</Text>
          </Group>
          <Group gap="xs">
            <Minus size={14} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed">No change</Text>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
};

/**
 * ComparisonToggle - Button to toggle comparison mode
 */
export interface ComparisonToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  scenarioCount?: number;
}

export const ComparisonToggle: React.FC<ComparisonToggleProps> = ({
  enabled,
  onToggle,
  scenarioCount = 2,
}) => {
  return (
    <Badge
      size="lg"
      variant={enabled ? 'filled' : 'outline'}
      color="blue"
      style={{ cursor: 'pointer' }}
      onClick={() => onToggle(!enabled)}
    >
      {enabled ? '✓ ' : ''}Compare {scenarioCount} Scenarios
    </Badge>
  );
};
