import { Badge, Card, Grid, Group, NumberInput, Select, Slider, Stack, Tabs, Text, Title, useMantineColorScheme, ActionIcon } from '@mantine/core';
import { Calculator, DollarSign, PiggyBank, Target, TrendingUp, RotateCcw } from 'lucide-react';
import React, { useMemo } from 'react';

import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { calculateInvestmentGrowth } from '../../utils/financialCalculations';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface InvestmentInput {
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  investmentPeriod: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually';
  inflationRate: number;
  taxRate: number;
  targetAmount: number;
}

const InvestmentCalculator: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultInputs: InvestmentInput = {
    initialAmount: 5000,
    monthlyContribution: 500,
    annualInterestRate: 7,
    investmentPeriod: 30,
    compoundingFrequency: 'monthly',
    inflationRate: 2.5,
    taxRate: 15,
    targetAmount: 1000000
  };

  const [inputsStorage, setInputs] = useLocalStorage<InvestmentInput>('investment-calculator-inputs', defaultInputs);

  // Ensure non-null value (hook always returns initialValue if null)
  const inputs = inputsStorage ?? defaultInputs;

  const resetToDefaults = () => {
    setInputs(defaultInputs);
  };

  const results = useMemo(() => {
    const {
      initialAmount,
      monthlyContribution,
      annualInterestRate,
      investmentPeriod,
      compoundingFrequency: _compoundingFrequency,
      inflationRate,
      taxRate,
      targetAmount
    } = inputs;

    if (initialAmount < 0 || monthlyContribution < 0 || annualInterestRate < 0 || investmentPeriod <= 0) {
      return null;
    }

    const monthlyRate = annualInterestRate / 100 / 12;
    // const _compoundingPerYear = compoundingFrequency === 'monthly' ? 12 : compoundingFrequency === 'quarterly' ? 4 : 1;

    // Calculate future value with compound interest
    let futureValue = initialAmount;
    let totalContributions = initialAmount;
    const yearlyBreakdown = [];

    for (let year = 1; year <= investmentPeriod; year++) {
      // const _startBalance = futureValue;
      // const _startContributions = totalContributions;
      
      futureValue = calculateInvestmentGrowth({
        initialAmount: futureValue,
        monthlyContribution,
        annualInterestRate,
        investmentPeriod: 1,
        inflationRate,
        taxRate: taxRate
      }).futureValue;
      
      totalContributions += monthlyContribution * 12;
      // const _yearInterest = futureValue - startBalance - (monthlyContribution * 12);
      const realValue = futureValue / Math.pow(1 + inflationRate / 100, year);

      yearlyBreakdown.push({
        year,
        balance: Math.round(futureValue),
        contributions: Math.round(totalContributions),
        interest: Math.round(futureValue - totalContributions),
        realValue: Math.round(realValue)
      });
    }

    const totalInterest = futureValue - totalContributions;
    const realValue = futureValue / Math.pow(1 + inflationRate / 100, investmentPeriod);
    const afterTaxValue = futureValue - (totalInterest * taxRate / 100);

    // Calculate months to reach target
    let monthsToTarget = 0;
    let currentValue = initialAmount;
    let currentContributions = initialAmount;

    while (currentValue < targetAmount && monthsToTarget < 1200) { // Max 100 years
      currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
      currentContributions += monthlyContribution;
      monthsToTarget++;
    }

    return {
      futureValue: Math.round(futureValue),
      totalContributions: Math.round(totalContributions),
      totalInterest: Math.round(totalInterest),
      realValue: Math.round(realValue),
      afterTaxValue: Math.round(afterTaxValue),
      monthsToTarget: currentValue >= targetAmount ? monthsToTarget : -1,
      yearlyBreakdown
    };
  }, [inputs]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.yearlyBreakdown.map(item => ({
      ...item,
      contributionsOnly: item.contributions,
      interestEarned: item.interest
    }));
  }, [results]);

  const pieData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Total Contributions', value: results.totalContributions, color: '#8884d8' },
      { name: 'Interest Earned', value: results.totalInterest, color: '#82ca9d' }
    ];
  }, [results]);

  const scenarios = useMemo(() => {
    if (!results) return [];
    
    const baseInputs = inputs;
    const scenarios = [
      { name: 'Conservative (5%)', rate: 5, color: '#8884d8' },
      { name: 'Moderate (7%)', rate: 7, color: '#82ca9d' },
      { name: 'Aggressive (10%)', rate: 10, color: '#ffc658' },
      { name: 'Very Aggressive (12%)', rate: 12, color: '#ff7300' }
    ];

    return scenarios.map(scenario => {
      const monthlyRate = scenario.rate / 100 / 12;
      let futureValue = baseInputs.initialAmount;
      let totalContributions = baseInputs.initialAmount;

      for (let month = 1; month <= baseInputs.investmentPeriod * 12; month++) {
        futureValue = futureValue * (1 + monthlyRate) + baseInputs.monthlyContribution;
        totalContributions += baseInputs.monthlyContribution;
      }

      return {
        name: scenario.name,
        value: Math.round(futureValue),
        contributions: Math.round(totalContributions),
        interest: Math.round(futureValue - totalContributions),
        color: scenario.color
      };
    });
  }, [inputs, results]);

  const recommendations = useMemo(() => {
    if (!results) return [];
    
    const recs = [];
    const contributionRatio = results.totalContributions / results.futureValue;
    
    if (contributionRatio > 0.7) {
      recs.push({ 
        type: 'warning', 
        text: 'Your contributions make up most of your final value. Consider increasing your investment period or interest rate for better compound growth.' 
      });
    } else if (contributionRatio < 0.3) {
      recs.push({ 
        type: 'success', 
        text: 'Excellent! Compound interest is doing most of the work. Your money is growing efficiently.' 
      });
    }
    
    if (results.monthsToTarget > 0 && results.monthsToTarget <= inputs.investmentPeriod * 12) {
      recs.push({ 
        type: 'success', 
        text: `You'll reach your target of $${inputs.targetAmount.toLocaleString()} in ${Math.round(results.monthsToTarget / 12)} years!` 
      });
    } else if (results.monthsToTarget > inputs.investmentPeriod * 12) {
      recs.push({ 
        type: 'warning', 
        text: 'You may need to increase contributions or extend your investment period to reach your target.' 
      });
    }
    
    if (inputs.inflationRate > 0) {
      const realReturn = ((results.realValue / results.totalContributions) - 1) * 100;
      if (realReturn > 100) {
        recs.push({ 
          type: 'success', 
          text: `After inflation, your real return is ${realReturn.toFixed(1)}%. Your purchasing power is growing well.` 
        });
      } else if (realReturn < 50) {
        recs.push({ 
          type: 'warning', 
          text: 'Inflation is significantly reducing your real returns. Consider higher-yield investments.' 
        });
      }
    }
    
    return recs;
  }, [results, inputs]);

  const chartColors = {
    primary: isDark ? '#8884d8' : '#6366f1',
    secondary: isDark ? '#82ca9d' : '#10b981',
    accent: isDark ? '#ffc658' : '#f59e0b',
    danger: isDark ? '#ff7300' : '#ef4444'
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2} className="flex items-center gap-2">
            <PiggyBank size={24} />
            Investment Calculator
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
            <Badge variant="light" color="green">Compound Interest</Badge>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <NumberInput
                label="Initial Investment ($)"
                value={inputs.initialAmount}
                onChange={(value) => setInputs(prev => ({ ...prev, initialAmount: Number(value) || 0 }))}
                min={0}
                step={100}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <NumberInput
                label="Monthly Contribution ($)"
                value={inputs.monthlyContribution}
                onChange={(value) => setInputs(prev => ({ ...prev, monthlyContribution: Number(value) || 0 }))}
                min={0}
                step={50}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <div>
                <Text size="sm" fw={500} mb="xs">Annual Interest Rate (%)</Text>
                <Slider
                  value={inputs.annualInterestRate}
                  onChange={(value) => setInputs(prev => ({ ...prev, annualInterestRate: value }))}
                  min={0}
                  max={20}
                  step={0.1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 5, label: '5%' },
                    { value: 10, label: '10%' },
                    { value: 15, label: '15%' },
                    { value: 20, label: '20%' }
                  ]}
                  mb="md"
                />
                <Text size="sm" c="dimmed" ta="center">
                  Current: {inputs.annualInterestRate}%
                </Text>
              </div>

              <NumberInput
                label="Investment Period (Years)"
                value={inputs.investmentPeriod}
                onChange={(value) => setInputs(prev => ({ ...prev, investmentPeriod: Number(value) || 0 }))}
                min={1}
                max={50}
              />

              <Select
                label="Compounding Frequency"
                value={inputs.compoundingFrequency}
                onChange={(value) => setInputs(prev => ({ ...prev, compoundingFrequency: value as any }))}
                data={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'annually', label: 'Annually' }
                ]}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <NumberInput
                label="Inflation Rate (%)"
                value={inputs.inflationRate}
                onChange={(value) => setInputs(prev => ({ ...prev, inflationRate: Number(value) || 0 }))}
                min={0}
                max={10}
                step={0.1}
                decimalScale={1}
              />

              <NumberInput
                label="Tax Rate on Gains (%)"
                value={inputs.taxRate}
                onChange={(value) => setInputs(prev => ({ ...prev, taxRate: Number(value) || 0 }))}
                min={0}
                max={50}
                step={1}
              />

              <NumberInput
                label="Target Amount ($)"
                value={inputs.targetAmount}
                onChange={(value) => setInputs(prev => ({ ...prev, targetAmount: Number(value) || 0 }))}
                min={0}
                step={10000}
                thousandSeparator=","
                leftSection={<Target size={16} />}
              />

              {results && (
                <Stack gap="md" mt="md">
                  <Card withBorder p="md" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Future Value</Text>
                      <Text size="xl" fw={700} c="blue">
                        ${results.futureValue.toLocaleString()}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Total Interest</Text>
                      <Text size="lg" fw={600} c="green">
                        ${results.totalInterest.toLocaleString()}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Real Value (Inflation-Adjusted)</Text>
                      <Text size="lg" fw={600}>
                        ${results.realValue.toLocaleString()}
                      </Text>
                    </Group>
                  </Card>
                </Stack>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      {results && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Tabs defaultValue="growth" className="w-full">
            <Tabs.List>
              <Tabs.Tab value="growth" leftSection={<TrendingUp size={16} />}>
                Growth Timeline
              </Tabs.Tab>
              <Tabs.Tab value="breakdown" leftSection={<Calculator size={16} />}>
                Breakdown
              </Tabs.Tab>
              <Tabs.Tab value="scenarios" leftSection={<Target size={16} />}>
                Scenarios
              </Tabs.Tab>
              <Tabs.Tab value="analysis" leftSection={<PiggyBank size={16} />}>
                Analysis
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="growth" pt="md">
              <Title order={4} mb="md">Investment Growth Over Time</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="year" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="contributions" stackId="1" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="interestEarned" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
                    <Line type="monotone" dataKey="realValue" stroke={chartColors.accent} strokeWidth={2} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="breakdown" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Title order={4} mb="md">Contributions vs Interest</Title>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Title order={4} mb="md">Summary</Title>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text>Total Contributions:</Text>
                      <Text fw={600}>${results.totalContributions.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Interest Earned:</Text>
                      <Text fw={600} c="green">${results.totalInterest.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Future Value:</Text>
                      <Text fw={600} c="blue">${results.futureValue.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>After-Tax Value:</Text>
                      <Text fw={600}>${results.afterTaxValue.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Real Value:</Text>
                      <Text fw={600}>${results.realValue.toLocaleString()}</Text>
                    </Group>
                    {results.monthsToTarget > 0 && (
                      <Group justify="space-between">
                        <Text>Time to Target:</Text>
                        <Text fw={600} c="green">
                          {Math.round(results.monthsToTarget / 12)} years
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="scenarios" pt="md">
              <Title order={4} mb="md">Different Return Scenarios</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={scenarios}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="contributions" stackId="a" fill={chartColors.secondary} />
                    <Bar dataKey="interest" stackId="a" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="analysis" pt="md">
              <Title order={4} mb="md">Investment Analysis & Recommendations</Title>
              <Stack gap="md">
                {recommendations.map((rec, index) => (
                  <Card key={index} withBorder p="md" className={`
                    ${rec.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}
                    ${rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : ''}
                    ${rec.type === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : ''}
                  `}>
                    <Text size="sm">{rec.text}</Text>
                  </Card>
                ))}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      )}
    </>
  );
};

export default InvestmentCalculator; 