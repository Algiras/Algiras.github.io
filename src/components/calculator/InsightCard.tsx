import { ActionIcon, Box, Button, Card, Checkbox, Group, Stack, Text, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { AlertCircle, CheckCircle, Info, Lightbulb, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React, { useState } from 'react';

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface InsightCardProps {
  insight: Insight;
  dismissible?: boolean;
  onDismiss?: (dontShowAgain: boolean) => void;
}

const INSIGHT_CONFIG: Record<Insight['type'], {
  icon: LucideIcon;
  color: string;
  emoji: string;
}> = {
  success: { icon: CheckCircle, color: 'teal', emoji: '🎯' },
  warning: { icon: AlertCircle, color: 'orange', emoji: '⚠️' },
  info: { icon: Info, color: 'blue', emoji: 'ℹ️' },
  tip: { icon: Lightbulb, color: 'yellow', emoji: '💡' },
};

/**
 * InsightCard - Display auto-generated recommendations and insights
 * Color-coded by type with optional actions and dismissal
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  dismissible = true,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(dontShowAgain);
  };

  return (
    <Card
      className="insight-card"
      p="md"
      radius="md"
      withBorder
      style={{
        borderLeftWidth: 4,
        borderLeftColor: `var(--mantine-color-${config.color}-6)`,
        backgroundColor: isDark
          ? `rgba(var(--mantine-color-${config.color}-rgb), 0.05)`
          : `rgba(var(--mantine-color-${config.color}-rgb), 0.02)`,
        animation: 'insightSlideIn 0.4s ease-out',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size="lg"
              radius="md"
              variant="light"
              color={config.color}
              style={{
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </ThemeIcon>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="sm"
                fw={600}
                style={{
                  color: `var(--mantine-color-${config.color}-7)`,
                }}
              >
                {config.emoji} {insight.title}
              </Text>
            </Box>
          </Group>

          {dismissible && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={handleDismiss}
              aria-label="Dismiss insight"
            >
              <X size={16} />
            </ActionIcon>
          )}
        </Group>

        <Text size="sm" c="dimmed" lh={1.5} pl={48}>
          {insight.description}
        </Text>

        {(insight.action || dismissible) && (
          <Group gap="sm" pl={48}>
            {insight.action && (
              <Button
                size="xs"
                variant="light"
                color={config.color}
                onClick={insight.action.onClick}
              >
                {insight.action.label}
              </Button>
            )}

            {dismissible && onDismiss && (
              <Checkbox
                size="xs"
                label="Don't show again"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.currentTarget.checked)}
                styles={{
                  label: { fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' },
                }}
              />
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
};

/**
 * InsightList - Display multiple insights in a grid
 */
export interface InsightListProps {
  insights: Insight[];
  dismissible?: boolean;
  onDismiss?: (index: number, dontShowAgain: boolean) => void;
}

export const InsightList: React.FC<InsightListProps> = ({
  insights,
  dismissible = true,
  onDismiss,
}) => {
  if (insights.length === 0) return null;

  return (
    <Stack gap="md">
      {insights.map((insight, index) => (
        <Box
          key={`${insight.type}-${index}`}
          style={{
            animation: `insightSlideIn 0.4s ease-out ${index * 0.1}s both`,
          }}
        >
          <InsightCard
            insight={insight}
            dismissible={dismissible}
            onDismiss={(dontShowAgain) => onDismiss?.(index, dontShowAgain)}
          />
        </Box>
      ))}
    </Stack>
  );
};
