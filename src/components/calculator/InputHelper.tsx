import { ActionIcon, Anchor, Box, Stack, Text, Tooltip } from '@mantine/core';
import { HelpCircle } from 'lucide-react';
import React from 'react';

export interface InputHelperProps {
  helpText: string;
  currentAverage?: string | number;
  learnMoreUrl?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: number;
}

/**
 * InputHelper - Contextual help tooltip for calculator inputs
 * Shows explanation, current market averages, and optional learn more link
 */
export const InputHelper: React.FC<InputHelperProps> = ({
  helpText,
  currentAverage,
  learnMoreUrl,
  position = 'top',
  size = 18,
}) => {
  const tooltipContent = (
    <Stack gap="xs" style={{ maxWidth: 300 }}>
      <Text size="sm" lh={1.5}>
        {helpText}
      </Text>

      {currentAverage && (
        <Text size="xs" c="dimmed" fs="italic">
          Current average: <strong>{currentAverage}</strong>
        </Text>
      )}

      {learnMoreUrl && (
        <Anchor
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          underline="always"
        >
          Learn more
        </Anchor>
      )}
    </Stack>
  );

  return (
    <Tooltip
      label={tooltipContent}
      position={position}
      multiline
      w={300}
      withArrow
      transitionProps={{ transition: 'pop', duration: 200 }}
      styles={{
        tooltip: {
          padding: '12px',
        },
      }}
    >
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        radius="xl"
        aria-label="Help"
        style={{ cursor: 'help' }}
      >
        <HelpCircle size={size} />
      </ActionIcon>
    </Tooltip>
  );
};

/**
 * InputLabelWithHelper - Convenience component for label + helper icon
 */
export interface InputLabelWithHelperProps extends InputHelperProps {
  label: string;
  required?: boolean;
}

export const InputLabelWithHelper: React.FC<InputLabelWithHelperProps> = ({
  label,
  required,
  ...helperProps
}) => {
  return (
    <Box
      component="label"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: 4,
      }}
    >
      {label}
      {required && <Text component="span" c="red">*</Text>}
      <InputHelper {...helperProps} />
    </Box>
  );
};

/**
 * Common helper texts for financial inputs
 */
export const FINANCIAL_HELPERS = {
  interestRate: {
    helpText: 'Annual interest rate (APR) for the loan or investment.',
    currentAverage: '6.8% (Dec 2024)',
  },
  downPayment: {
    helpText: 'Initial payment made when purchasing. 20% down avoids PMI (Private Mortgage Insurance).',
  },
  loanTerm: {
    helpText: '15-year mortgages have higher monthly payments but save significant interest. 30-year loans have lower monthly payments.',
  },
  propertyTax: {
    helpText: 'Annual property tax, typically 1-1.5% of home value. Varies by state and county.',
    currentAverage: '1.1% of home value',
  },
  homeInsurance: {
    helpText: 'Annual home insurance premium to protect your property.',
    currentAverage: '$1,500-$2,000/year',
  },
  pmi: {
    helpText: 'Private Mortgage Insurance required when down payment is less than 20%. Typically 0.5-1% of loan amount annually.',
  },
  hoa: {
    helpText: 'Homeowners Association fees for shared amenities and maintenance in condos or planned communities.',
  },
  extraPayment: {
    helpText: 'Additional principal payment each month. Even small extra payments can save thousands in interest.',
  },
  inflation: {
    helpText: 'Expected annual inflation rate. Historical US average is around 3%.',
    currentAverage: '3.0%',
  },
  contribution: {
    helpText: 'Regular amount added to investment. Dollar-cost averaging reduces timing risk.',
  },
  rateOfReturn: {
    helpText: 'Expected annual return on investment. Historical S&P 500 average is ~10% before inflation.',
    currentAverage: '10% (S&P 500)',
  },
  debtToIncome: {
    helpText: 'Percentage of your gross monthly income that goes toward debt payments. Lenders prefer under 36%.',
  },
};
