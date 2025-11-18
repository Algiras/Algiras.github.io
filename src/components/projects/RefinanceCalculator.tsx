import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  Grid,
  Group,
  NumberInput,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  DollarSign,
  Home,
  Info,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface RefinanceInput {
  currentLoan: {
    balance: number;
    interestRate: number;
    termYears: number;
    monthlyPayment: number;
    monthsRemaining: number;
  };
  newLoan: {
    interestRate: number;
    termYears: number;
    closingCosts: number;
    points: number;
    includePointsInCosts: boolean;
  };
}

interface RefinanceResult {
  currentLoan: {
    totalInterest: number;
    totalCost: number;
    payoffMonths: number;
  };
  newLoan: {
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    payoffMonths: number;
  };
  savings: {
    monthly: number;
    total: number;
    breakEvenMonths: number;
    netSavings: number;
  };
  comparison: {
    interestSaved: number;
    timeSaved: number;
    totalSavings: number;
  };
  schedule: Array<{
    month: number;
    currentBalance: number;
    newBalance: number;
    currentCumulativeInterest: number;
    newCumulativeInterest: number;
  }>;
}

const RefinanceCalculator: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultInputs: RefinanceInput = {
    currentLoan: {
      balance: 250000,
      interestRate: 6.5,
      termYears: 30,
      monthlyPayment: 1580,
      monthsRemaining: 300,
    },
    newLoan: {
      interestRate: 5.5,
      termYears: 30,
      closingCosts: 5000,
      points: 0,
      includePointsInCosts: true,
    },
  };

  const [inputsStorage, setInputs] = useLocalStorage<RefinanceInput>(
    'refinance-calculator-inputs',
    defaultInputs
  );

  // Ensure non-null value (hook always returns initialValue if null)
  const inputs = inputsStorage ?? defaultInputs;

  const resetToDefaults = () => {
    setInputs(defaultInputs);
  };

  const calculateLoan = (
    balance: number,
    interestRate: number,
    monthlyPayment: number,
    monthsToCalculate: number
  ) => {
    const monthlyRate = interestRate / 100 / 12;
    let remainingBalance = balance;
    let totalInterest = 0;
    let month = 0;

    while (remainingBalance > 0.01 && month < monthsToCalculate) {
      month++;
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(
        monthlyPayment - interestPayment,
        remainingBalance
      );
      remainingBalance -= principalPayment;
      totalInterest += interestPayment;
    }

    return {
      totalInterest,
      remainingBalance,
      monthsPaid: month,
    };
  };

  const results = useMemo(() => {
    const { currentLoan, newLoan } = inputs;

    // Calculate current loan totals
    const currentCalc = calculateLoan(
      currentLoan.balance,
      currentLoan.interestRate,
      currentLoan.monthlyPayment,
      currentLoan.monthsRemaining
    );

    // Calculate new loan payment
    const newMonthlyRate = newLoan.interestRate / 100 / 12;
    const newTotalPayments = newLoan.termYears * 12;
    const pointsCost = newLoan.includePointsInCosts
      ? (currentLoan.balance * newLoan.points) / 100
      : 0;
    const totalClosingCosts = newLoan.closingCosts + pointsCost;
    const newLoanBalance =
      currentLoan.balance + (newLoan.includePointsInCosts ? 0 : pointsCost);
    const newMonthlyPayment =
      (newLoanBalance *
        (newMonthlyRate * Math.pow(1 + newMonthlyRate, newTotalPayments))) /
      (Math.pow(1 + newMonthlyRate, newTotalPayments) - 1);

    // Calculate new loan totals
    const newCalc = calculateLoan(
      newLoanBalance,
      newLoan.interestRate,
      newMonthlyPayment,
      newTotalPayments
    );

    // Calculate savings
    const monthlySavings = currentLoan.monthlyPayment - newMonthlyPayment;
    const interestSaved = currentCalc.totalInterest - newCalc.totalInterest;
    const totalSavings = interestSaved - totalClosingCosts;
    const breakEvenMonths = totalClosingCosts / monthlySavings;

    // Generate comparison schedule
    const schedule: RefinanceResult['schedule'] = [];
    const maxMonths = Math.max(currentLoan.monthsRemaining, newTotalPayments);

    let currentBalance = currentLoan.balance;
    let newBalance = newLoanBalance;
    let currentCumInterest = 0;
    let newCumInterest = 0;
    const currentMonthlyRate = currentLoan.interestRate / 100 / 12;

    for (let month = 0; month <= maxMonths; month++) {
      if (month > 0) {
        if (currentBalance > 0.01 && month <= currentLoan.monthsRemaining) {
          const currentInterest = currentBalance * currentMonthlyRate;
          const currentPrincipal = Math.min(
            currentLoan.monthlyPayment - currentInterest,
            currentBalance
          );
          currentBalance -= currentPrincipal;
          currentCumInterest += currentInterest;
        }

        if (newBalance > 0.01 && month <= newTotalPayments) {
          const newInterest = newBalance * newMonthlyRate;
          const newPrincipal = Math.min(
            newMonthlyPayment - newInterest,
            newBalance
          );
          newBalance -= newPrincipal;
          newCumInterest += newInterest;
        }
      }

      schedule.push({
        month,
        currentBalance: Math.max(0, currentBalance),
        newBalance: Math.max(0, newBalance),
        currentCumulativeInterest: currentCumInterest,
        newCumulativeInterest: newCumInterest,
      });
    }

    return {
      currentLoan: {
        totalInterest: currentCalc.totalInterest,
        totalCost: currentLoan.balance + currentCalc.totalInterest,
        payoffMonths: currentLoan.monthsRemaining,
      },
      newLoan: {
        monthlyPayment: newMonthlyPayment,
        totalInterest: newCalc.totalInterest,
        totalCost: newLoanBalance + totalClosingCosts + newCalc.totalInterest,
        payoffMonths: newTotalPayments,
      },
      savings: {
        monthly: monthlySavings,
        total: interestSaved,
        breakEvenMonths,
        netSavings: totalSavings,
      },
      comparison: {
        interestSaved,
        timeSaved: currentLoan.monthsRemaining - newTotalPayments,
        totalSavings,
      },
      schedule,
    };
  }, [inputs]);

  const chartData = useMemo(() => {
    return results.schedule.map((item, index) => ({
      month: index,
      currentBalance: item.currentBalance,
      newBalance: item.newBalance,
      currentInterest: item.currentCumulativeInterest,
      newInterest: item.newCumulativeInterest,
    }));
  }, [results]);

  const comparisonData = [
    {
      metric: 'Monthly Payment',
      current: inputs.currentLoan.monthlyPayment,
      new: results.newLoan.monthlyPayment,
    },
    {
      metric: 'Total Interest',
      current: results.currentLoan.totalInterest,
      new: results.newLoan.totalInterest,
    },
    {
      metric: 'Total Cost',
      current: results.currentLoan.totalCost,
      new: results.newLoan.totalCost,
    },
  ];

  const chartColors = {
    primary: isDark ? '#8884d8' : '#6366f1',
    secondary: isDark ? '#82ca9d' : '#10b981',
    accent: isDark ? '#ffc658' : '#f59e0b',
    danger: isDark ? '#ff7300' : '#ef4444',
  };

  const isWorthRefinancing =
    results.savings.netSavings > 0 &&
    results.savings.breakEvenMonths < results.newLoan.payoffMonths;

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    const pointsCost = inputs.newLoan.includePointsInCosts
      ? (inputs.currentLoan.balance * inputs.newLoan.points) / 100
      : 0;
    const totalClosingCosts = inputs.newLoan.closingCosts + pointsCost;
    const rateDifference =
      inputs.currentLoan.interestRate - inputs.newLoan.interestRate;

    if (rateDifference >= 0.5) {
      recs.push({
        type: 'success',
        icon: <CheckCircle size={16} />,
        title: 'Good Rate Reduction',
        message: `A ${rateDifference.toFixed(2)}% rate reduction is significant and typically makes refinancing worthwhile.`,
      });
    } else if (rateDifference < 0.25) {
      recs.push({
        type: 'warning',
        icon: <AlertCircle size={16} />,
        title: 'Small Rate Difference',
        message: `A ${rateDifference.toFixed(2)}% rate reduction may not justify refinancing costs. Consider if you plan to stay in the home long-term.`,
      });
    }

    if (results.savings.breakEvenMonths > 60) {
      recs.push({
        type: 'warning',
        icon: <AlertCircle size={16} />,
        title: 'Long Break-Even Period',
        message: `Break-even point is ${(results.savings.breakEvenMonths / 12).toFixed(1)} years. Only refinance if you plan to stay in the home longer.`,
      });
    } else if (results.savings.breakEvenMonths < 24) {
      recs.push({
        type: 'success',
        icon: <CheckCircle size={16} />,
        title: 'Quick Break-Even',
        message: `You'll break even in ${(results.savings.breakEvenMonths / 12).toFixed(1)} years, making this a good refinancing opportunity.`,
      });
    }

    if (inputs.newLoan.points > 0) {
      const pointsSavings =
        ((inputs.currentLoan.interestRate - inputs.newLoan.interestRate) *
          inputs.newLoan.points) /
        100;
      if (pointsSavings > 0.25) {
        recs.push({
          type: 'info',
          icon: <Info size={16} />,
          title: 'Points May Be Worth It',
          message: `Buying ${inputs.newLoan.points} point(s) reduces your rate by approximately ${pointsSavings.toFixed(2)}%. Consider if you'll stay in the home long enough to recoup the cost.`,
        });
      }
    }

    if (totalClosingCosts > inputs.currentLoan.balance * 0.05) {
      recs.push({
        type: 'warning',
        icon: <AlertCircle size={16} />,
        title: 'High Closing Costs',
        message: `Closing costs of $${totalClosingCosts.toLocaleString()} represent ${((totalClosingCosts / inputs.currentLoan.balance) * 100).toFixed(1)}% of your loan balance. Shop around for better rates.`,
      });
    }

    return recs;
  }, [inputs, results]);

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2} className="flex items-center gap-2">
            <Home size={24} />
            Refinance Calculator
          </Title>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="gray"
              size="md"
              onClick={resetToDefaults}
              title="Reset to defaults"
            >
              <RotateCcw size={18} />
            </ActionIcon>
            <Badge variant="light" color="blue" size="md">
              Mortgage Analysis
            </Badge>
          </Group>
        </Group>

        {!isWorthRefinancing && (
          <Alert
            icon={<Info size={16} />}
            title="Consider Carefully"
            color="yellow"
            mb="md"
          >
            Refinancing may not be beneficial in this scenario. You&apos;ll
            break even in {results.savings.breakEvenMonths.toFixed(1)} months,
            but consider your long-term plans and closing costs.
          </Alert>
        )}

        {isWorthRefinancing && (
          <Alert
            icon={<Info size={16} />}
            title="Potential Savings"
            color="green"
            mb="md"
          >
            Refinancing could save you $
            {results.savings.netSavings.toLocaleString()} over the life of the
            loan. Break-even point: {results.savings.breakEvenMonths.toFixed(1)}{' '}
            months.
          </Alert>
        )}

        {recommendations.length > 0 && (
          <Stack gap="md" mb="md">
            {recommendations.map((rec, index) => (
              <Alert
                key={index}
                icon={rec.icon}
                title={rec.title}
                color={
                  rec.type === 'success'
                    ? 'green'
                    : rec.type === 'warning'
                      ? 'yellow'
                      : 'blue'
                }
              >
                {rec.message}
              </Alert>
            ))}
          </Stack>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Title order={4}>Current Loan</Title>
              <NumberInput
                label="Current Balance ($)"
                value={inputs.currentLoan.balance}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    currentLoan: {
                      ...prev.currentLoan,
                      balance: Number(value) || 0,
                    },
                  }))
                }
                min={0}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />
              <NumberInput
                label="Current Interest Rate (%)"
                value={inputs.currentLoan.interestRate}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    currentLoan: {
                      ...prev.currentLoan,
                      interestRate: Number(value) || 0,
                    },
                  }))
                }
                min={0}
                max={30}
                decimalScale={2}
                step={0.1}
              />
              <NumberInput
                label="Current Monthly Payment ($)"
                value={inputs.currentLoan.monthlyPayment}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    currentLoan: {
                      ...prev.currentLoan,
                      monthlyPayment: Number(value) || 0,
                    },
                  }))
                }
                min={0}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />
              <NumberInput
                label="Months Remaining"
                value={inputs.currentLoan.monthsRemaining}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    currentLoan: {
                      ...prev.currentLoan,
                      monthsRemaining: Number(value) || 0,
                    },
                  }))
                }
                min={1}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Title order={4}>New Loan</Title>
              <NumberInput
                label="New Interest Rate (%)"
                value={inputs.newLoan.interestRate}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    newLoan: {
                      ...prev.newLoan,
                      interestRate: Number(value) || 0,
                    },
                  }))
                }
                min={0}
                max={30}
                decimalScale={2}
                step={0.1}
              />
              <NumberInput
                label="New Loan Term (Years)"
                value={inputs.newLoan.termYears}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    newLoan: { ...prev.newLoan, termYears: Number(value) || 0 },
                  }))
                }
                min={1}
                max={30}
              />
              <NumberInput
                label="Closing Costs ($)"
                value={inputs.newLoan.closingCosts}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    newLoan: {
                      ...prev.newLoan,
                      closingCosts: Number(value) || 0,
                    },
                  }))
                }
                min={0}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
                description="Includes fees and other costs (excluding points)"
              />

              <NumberInput
                label="Points"
                value={inputs.newLoan.points}
                onChange={value =>
                  setInputs(prev => ({
                    ...prev,
                    newLoan: { ...prev.newLoan, points: Number(value) || 0 },
                  }))
                }
                min={0}
                max={5}
                decimalScale={1}
                step={0.25}
                description="Each point typically reduces rate by 0.25%"
              />

              <Switch
                label="Include points in closing costs"
                checked={inputs.newLoan.includePointsInCosts}
                onChange={e =>
                  setInputs(prev => ({
                    ...prev,
                    newLoan: {
                      ...prev.newLoan,
                      includePointsInCosts: e.currentTarget.checked,
                    },
                  }))
                }
                description="If checked, points are added to closing costs. If unchecked, points are added to loan balance."
              />

              {inputs.newLoan.points > 0 && (
                <Text size="sm" c="dimmed">
                  Points cost: $
                  {(
                    (inputs.currentLoan.balance * inputs.newLoan.points) /
                    100
                  ).toLocaleString()}
                  {inputs.newLoan.includePointsInCosts
                    ? ' (included in closing costs)'
                    : ' (added to loan balance)'}
                </Text>
              )}

              <Card
                withBorder
                p="md"
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    New Monthly Payment
                  </Text>
                  <Text size="xl" fw={700} c="blue">
                    $
                    {results.newLoan.monthlyPayment.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
              </Card>

              <Card
                withBorder
                p="md"
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Monthly Savings
                  </Text>
                  <Text size="xl" fw={700} c="green">
                    $
                    {results.savings.monthly.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
              </Card>

              <Card
                withBorder
                p="md"
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Break-Even Point
                  </Text>
                  <Text size="lg" fw={600} c="purple">
                    {results.savings.breakEvenMonths.toFixed(1)} months
                  </Text>
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Tabs defaultValue="comparison" className="w-full">
          <Tabs.List>
            <Tabs.Tab value="comparison" leftSection={<Calculator size={16} />}>
              Comparison
            </Tabs.Tab>
            <Tabs.Tab value="balance" leftSection={<TrendingUp size={16} />}>
              Balance Over Time
            </Tabs.Tab>
            <Tabs.Tab value="savings" leftSection={<DollarSign size={16} />}>
              Savings Analysis
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="comparison" pt="md">
            <Title order={4} mb="md">
              Loan Comparison
            </Title>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey="metric"
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="current"
                    fill={chartColors.primary}
                    name="Current Loan"
                  />
                  <Bar
                    dataKey="new"
                    fill={chartColors.secondary}
                    name="New Loan"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="balance" pt="md">
            <Title order={4} mb="md">
              Loan Balance Comparison
            </Title>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    labelFormatter={value => `Month ${value}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="currentBalance"
                    stroke={chartColors.primary}
                    fill={chartColors.primary}
                    fillOpacity={0.3}
                    name="Current Loan Balance"
                  />
                  <Area
                    type="monotone"
                    dataKey="newBalance"
                    stroke={chartColors.secondary}
                    fill={chartColors.secondary}
                    fillOpacity={0.3}
                    name="New Loan Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="savings" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Title order={4} mb="md">
                  Savings Breakdown
                </Title>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text>Monthly Savings:</Text>
                    <Text fw={600} c="green">
                      $
                      {results.savings.monthly.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text>Interest Saved:</Text>
                    <Text fw={600} c="green">
                      ${results.comparison.interestSaved.toLocaleString()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text>Closing Costs:</Text>
                    <Text fw={600} c="red">
                      $
                      {(
                        inputs.newLoan.closingCosts +
                        (inputs.newLoan.includePointsInCosts
                          ? (inputs.currentLoan.balance *
                              inputs.newLoan.points) /
                            100
                          : 0)
                      ).toLocaleString()}
                    </Text>
                  </Group>
                  {inputs.newLoan.points > 0 && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Points Cost:
                      </Text>
                      <Text size="sm" c="dimmed">
                        $
                        {(
                          (inputs.currentLoan.balance * inputs.newLoan.points) /
                          100
                        ).toLocaleString()}
                      </Text>
                    </Group>
                  )}
                  <Group justify="space-between">
                    <Text>Time Saved:</Text>
                    <Text fw={600}>
                      {results.comparison.timeSaved > 0
                        ? `${results.comparison.timeSaved} months`
                        : `${Math.abs(results.comparison.timeSaved)} months longer`}
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    pt="md"
                    style={{
                      borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    }}
                  >
                    <Text fw={600} size="lg">
                      Net Savings:
                    </Text>
                    <Text
                      fw={700}
                      size="lg"
                      c={results.savings.netSavings > 0 ? 'green' : 'red'}
                    >
                      ${results.savings.netSavings.toLocaleString()}
                    </Text>
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Title order={4} mb="md">
                  Interest Comparison
                </Title>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#374151' : '#e5e7eb'}
                      />
                      <XAxis
                        dataKey="month"
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                      />
                      <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) =>
                          `$${value.toLocaleString()}`
                        }
                        labelFormatter={value => `Month ${value}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="currentInterest"
                        stroke={chartColors.danger}
                        fill={chartColors.danger}
                        fillOpacity={0.3}
                        name="Current Loan Interest"
                      />
                      <Area
                        type="monotone"
                        dataKey="newInterest"
                        stroke={chartColors.accent}
                        fill={chartColors.accent}
                        fillOpacity={0.3}
                        name="New Loan Interest"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </>
  );
};

export default RefinanceCalculator;
