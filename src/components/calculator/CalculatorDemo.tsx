import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { Calculator, Home } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  AnimatedCurrency,
  AnimatedPercentage,
  ExportPanel,
  InputHelper,
  InsightList,
  FINANCIAL_HELPERS,
} from './index';
import { generateMortgageInsights } from '../../utils/insightGenerator';
import { generateMortgageMarkdown, generateAmortizationCSV } from '../../utils/calculatorExport';

/**
 * CalculatorDemo - Reference implementation showing all calculator enhancements
 *
 * This demonstrates:
 * - AnimatedCurrency for animated result metrics
 * - InsightList for auto-generated recommendations
 * - InputHelper for contextual tooltips
 * - ExportPanel for PDF/CSV/Share functionality
 */
export const CalculatorDemo: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Simple state management
  const [inputs, setInputs] = useState({
    homePrice: 400000,
    downPayment: 80000,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 6000,
    homeInsurance: 1200,
    extraPayment: 0,
  });

  // Calculate results
  const results = useMemo(() => {
    const downPaymentPercent = (inputs.downPayment / inputs.homePrice) * 100;
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;

    // Monthly P&I
    const monthlyPrincipalInterest =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Other monthly costs
    const monthlyPropertyTax = inputs.propertyTax / 12;
    const monthlyInsurance = inputs.homeInsurance / 12;

    // PMI if down payment < 20%
    const pmiRate = downPaymentPercent < 20 ? 0.5 : 0;
    const monthlyPMI = (loanAmount * (pmiRate / 100)) / 12;

    const totalMonthlyPayment =
      monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI;

    // Total interest calculation
    let remainingBalance = loanAmount;
    let totalInterest = 0;
    let payoffMonths = numPayments;

    for (let month = 1; month <= numPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = monthlyPrincipalInterest - interestPayment + inputs.extraPayment;

      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      remainingBalance -= principalPayment;
      totalInterest += interestPayment;

      if (remainingBalance <= 0) {
        payoffMonths = month;
        break;
      }
    }

    const totalCost = loanAmount + totalInterest;
    const payoffYears = Math.floor(payoffMonths / 12);
    const payoffRemainder = payoffMonths % 12;

    return {
      loanAmount,
      downPaymentPercent,
      monthlyPrincipalInterest,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyPMI,
      monthlyHOA: 0,
      totalMonthlyPayment,
      totalInterest,
      totalCost,
      payoffTime: payoffMonths,
      payoffDate: `${payoffYears} years ${payoffRemainder} months`,
      amortizationSchedule: [], // Simplified for demo
    };
  }, [inputs]);

  // Generate insights
  const insights = useMemo(() => {
    return generateMortgageInsights(
      {
        ...inputs,
        downPaymentPercent: results.downPaymentPercent,
        pmiRate: 0.5,
        hoaFees: 0,
      },
      results
    );
  }, [inputs, results]);

  // Export options
  const exportOptions = useMemo(() => ({
    calculatorType: 'mortgage',
    calculatorName: 'Simple Mortgage Calculator Demo',
    inputs,
    results,
    generateMarkdown: () => generateMortgageMarkdown(inputs, results),
    generateCSV: () => generateAmortizationCSV([
      // Simplified schedule for demo
      { month: 1, payment: results.totalMonthlyPayment, principal: 500, interest: 2000, balance: results.loanAmount - 500 },
    ]),
  }), [inputs, results]);

  return (
    <Stack gap="lg" style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      {/* Header */}
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm">
          <Calculator size={32} color={isDark ? '#38bec9' : '#3b82f6'} />
          <div>
            <Title order={2}>Calculator Enhancement Demo</Title>
            <Text size="sm" c="dimmed">
              Reference implementation showing all new features
            </Text>
          </div>
        </Group>
        <Badge size="lg" variant="light" color="green">
          New Features ✨
        </Badge>
      </Group>

      <Divider />

      <Grid>
        {/* Inputs Section */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder p="lg">
            <Stack gap="md">
              <Group gap="xs">
                <Home size={20} />
                <Title order={3}>Inputs</Title>
              </Group>

              {/* Input with Helper Tooltip */}
              <div>
                <Group gap={4} mb={4}>
                  <Text size="sm" fw={500}>Home Price</Text>
                  <InputHelper
                    helpText="Total purchase price of the property"
                    currentAverage="$400,000 (US median)"
                  />
                </Group>
                <NumberInput
                  value={inputs.homePrice}
                  onChange={(val) => setInputs(prev => ({ ...prev, homePrice: val as number }))}
                  prefix="$"
                  thousandSeparator=","
                  min={0}
                />
              </div>

              {/* Down Payment with Helper */}
              <div>
                <Group gap={4} mb={4}>
                  <Text size="sm" fw={500}>Down Payment</Text>
                  <InputHelper
                    {...FINANCIAL_HELPERS.downPayment}
                  />
                </Group>
                <NumberInput
                  value={inputs.downPayment}
                  onChange={(val) => setInputs(prev => ({ ...prev, downPayment: val as number }))}
                  prefix="$"
                  thousandSeparator=","
                  min={0}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  {results.downPaymentPercent.toFixed(1)}% of home price
                </Text>
              </div>

              {/* Interest Rate with Helper */}
              <div>
                <Group gap={4} mb={4}>
                  <Text size="sm" fw={500}>Interest Rate</Text>
                  <InputHelper
                    {...FINANCIAL_HELPERS.interestRate}
                  />
                </Group>
                <NumberInput
                  value={inputs.interestRate}
                  onChange={(val) => setInputs(prev => ({ ...prev, interestRate: val as number }))}
                  suffix="%"
                  decimalScale={2}
                  min={0}
                  max={20}
                  step={0.1}
                />
              </div>

              {/* Loan Term */}
              <div>
                <Group gap={4} mb={4}>
                  <Text size="sm" fw={500}>Loan Term</Text>
                  <InputHelper
                    {...FINANCIAL_HELPERS.loanTerm}
                  />
                </Group>
                <NumberInput
                  value={inputs.loanTerm}
                  onChange={(val) => setInputs(prev => ({ ...prev, loanTerm: val as number }))}
                  suffix=" years"
                  min={5}
                  max={30}
                  step={5}
                />
              </div>

              {/* Extra Payment with Helper */}
              <div>
                <Group gap={4} mb={4}>
                  <Text size="sm" fw={500}>Extra Monthly Payment</Text>
                  <InputHelper
                    {...FINANCIAL_HELPERS.extraPayment}
                  />
                </Group>
                <NumberInput
                  value={inputs.extraPayment}
                  onChange={(val) => setInputs(prev => ({ ...prev, extraPayment: val as number }))}
                  prefix="$"
                  thousandSeparator=","
                  min={0}
                />
              </div>

              <Button
                variant="light"
                size="sm"
                onClick={() => setInputs({
                  homePrice: 400000,
                  downPayment: 80000,
                  interestRate: 6.5,
                  loanTerm: 30,
                  propertyTax: 6000,
                  homeInsurance: 1200,
                  extraPayment: 0,
                })}
              >
                Reset to Defaults
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Results Section */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            {/* Animated Metrics */}
            <Card withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Title order={3}>Results</Title>
                <ExportPanel options={exportOptions} variant="menu" />
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <AnimatedCurrency
                  value={results.totalMonthlyPayment}
                  label="Total Monthly Payment"
                  description="Principal, interest, taxes & insurance"
                  size="lg"
                  decimals={0}
                />

                <AnimatedCurrency
                  value={results.totalInterest}
                  label="Total Interest"
                  description={`Over ${inputs.loanTerm} years`}
                  size="md"
                  decimals={0}
                  colorScheme="negative"
                />

                <AnimatedCurrency
                  value={results.loanAmount}
                  label="Loan Amount"
                  description={`${results.downPaymentPercent.toFixed(1)}% down payment`}
                  size="md"
                  decimals={0}
                  colorScheme="neutral"
                />

                <AnimatedPercentage
                  value={results.downPaymentPercent}
                  label="Down Payment"
                  description={results.downPaymentPercent >= 20 ? 'No PMI required ✓' : 'PMI required'}
                  size="md"
                  colorScheme={results.downPaymentPercent >= 20 ? 'positive' : 'negative'}
                />
              </SimpleGrid>

              <Divider my="lg" />

              {/* Monthly Breakdown */}
              <Stack gap="xs">
                <Text size="sm" fw={600} c="dimmed">Monthly Payment Breakdown</Text>
                <Group justify="space-between">
                  <Text size="sm">Principal & Interest</Text>
                  <Text size="sm" fw={500}>${results.monthlyPrincipalInterest.toFixed(0)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Property Tax</Text>
                  <Text size="sm" fw={500}>${results.monthlyPropertyTax.toFixed(0)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Home Insurance</Text>
                  <Text size="sm" fw={500}>${results.monthlyInsurance.toFixed(0)}</Text>
                </Group>
                {results.monthlyPMI > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" c="orange">PMI</Text>
                    <Text size="sm" fw={500} c="orange">${results.monthlyPMI.toFixed(0)}</Text>
                  </Group>
                )}
              </Stack>
            </Card>

            {/* Insights Section */}
            {insights.length > 0 && (
              <Card withBorder p="lg">
                <Title order={4} mb="md">💡 Smart Insights</Title>
                <InsightList insights={insights} />
              </Card>
            )}

            {/* Feature Callout */}
            <Card withBorder p="md" style={{ backgroundColor: isDark ? 'rgba(56, 190, 201, 0.05)' : 'rgba(59, 130, 246, 0.05)' }}>
              <Text size="sm" fw={600} mb="xs">✨ Enhanced Features Demo</Text>
              <Text size="xs" c="dimmed" lh={1.6}>
                This demo showcases: <strong>AnimatedMetric</strong> for smooth number transitions,
                <strong> InputHelper</strong> tooltips with market data, <strong> InsightList</strong> for
                AI-generated recommendations, and <strong> ExportPanel</strong> for PDF/CSV/Share.
                All components are reusable across calculators.
              </Text>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
