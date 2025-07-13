import { Badge, Card, Divider, Grid, Group, NumberInput, Slider, Stack, Switch, Tabs, Text, Title, useMantineColorScheme } from '@mantine/core';
import { Calculator, Calendar, Clock, DollarSign, PiggyBank, Target, TrendingUp, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  employerMatch: number;
  employerMatchPercent: number;
  annualReturn: number;
  inflationRate: number;
  retirementIncome: number;
  socialSecurityBenefit: number;
  withdrawalRate: number;
  lifeExpectancy: number;
  retirementStrategy: 'conservative' | 'moderate' | 'aggressive';
  includeRothIRA: boolean;
  rothContribution: number;
  taxRate: number;
  retirementTaxRate: number;
}

/*
interface _RetirementResult {
  yearsToRetirement: number;
  totalSavingsAtRetirement: number;
  totalContributions: number;
  totalEmployerMatch: number;
  totalGrowth: number;
  monthlyRetirementIncome: number;
  retirementDuration: number;
  totalNeeded: number;
  shortfall: number;
  surplusYears: number;
  yearlyProjection: Array<{
    age: number;
    year: number;
    balance: number;
    contributions: number;
    growth: number;
    withdrawals: number;
    isRetired: boolean;
  }>;
  scenarioAnalysis: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
}
*/

const RetirementPlanner: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [inputs, setInputs] = useState<RetirementInput>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    employerMatch: 500,
    employerMatchPercent: 50,
    annualReturn: 7,
    inflationRate: 2.5,
    retirementIncome: 5000,
    socialSecurityBenefit: 1800,
    withdrawalRate: 4,
    lifeExpectancy: 85,
    retirementStrategy: 'moderate',
    includeRothIRA: true,
    rothContribution: 500,
    taxRate: 22,
    retirementTaxRate: 18
  });

  const results = useMemo(() => {
    const {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      employerMatch,
      annualReturn,
      inflationRate,
      retirementIncome,
      socialSecurityBenefit,
      withdrawalRate,
      lifeExpectancy,
      rothContribution,
      taxRate: _taxRate,
      retirementTaxRate: _retirementTaxRate
    } = inputs;

    if (currentAge >= retirementAge || retirementAge >= lifeExpectancy) {
      return null;
    }

    const yearsToRetirement = retirementAge - currentAge;
    const retirementDuration = lifeExpectancy - retirementAge;
    const monthlyReturn = annualReturn / 100 / 12;
    // const _monthlyInflation = inflationRate / 100 / 12;

    // Calculate retirement savings growth
    let balance = currentSavings;
    let totalContributions = 0;
    let totalEmployerMatch = 0;
    let totalGrowth = 0;
    const yearlyProjection = [];

    // Accumulation phase
    for (let year = 0; year < yearsToRetirement; year++) {
      const startBalance = balance;
      const yearContributions = (monthlyContribution + employerMatch + rothContribution) * 12;
      
      // Monthly growth calculation
      for (let month = 0; month < 12; month++) {
        const monthlyGrowth = balance * monthlyReturn;
        balance += monthlyGrowth + monthlyContribution + employerMatch + rothContribution;
        totalGrowth += monthlyGrowth;
      }
      
      totalContributions += (monthlyContribution + rothContribution) * 12;
      totalEmployerMatch += employerMatch * 12;

      yearlyProjection.push({
        age: currentAge + year + 1,
        year: year + 1,
        balance: Math.round(balance),
        contributions: Math.round(yearContributions),
        growth: Math.round(balance - startBalance - yearContributions),
        withdrawals: 0,
        isRetired: false
      });
    }

    const totalSavingsAtRetirement = balance;

    // Calculate required retirement income (inflation-adjusted)
    const inflationAdjustedIncome = retirementIncome * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const monthlyRetirementIncome = inflationAdjustedIncome;
    const netIncomeNeeded = Math.max(0, monthlyRetirementIncome - socialSecurityBenefit);
    const annualIncomeNeeded = netIncomeNeeded * 12;

    // Calculate total needed using withdrawal rate
    const totalNeeded = annualIncomeNeeded / (withdrawalRate / 100);
    const shortfall = Math.max(0, totalNeeded - totalSavingsAtRetirement);

    // Withdrawal phase simulation
    let retirementBalance = totalSavingsAtRetirement;
    let surplusYears = 0;

    for (let year = 0; year < retirementDuration; year++) {
      // const startBalance = retirementBalance;
      const annualWithdrawal = Math.min(annualIncomeNeeded, retirementBalance * (withdrawalRate / 100));
      
      // Apply growth and withdrawals
      const annualGrowth = retirementBalance * (annualReturn / 100);
      retirementBalance = retirementBalance + annualGrowth - annualWithdrawal;

      if (retirementBalance > 0) {
        surplusYears++;
      }

      yearlyProjection.push({
        age: retirementAge + year + 1,
        year: yearsToRetirement + year + 1,
        balance: Math.round(Math.max(0, retirementBalance)),
        contributions: 0,
        growth: Math.round(annualGrowth),
        withdrawals: Math.round(annualWithdrawal),
        isRetired: true
      });

      if (retirementBalance <= 0) break;
    }

    // Scenario analysis with different return rates
    const scenarios = {
      conservative: 5,
      moderate: 7,
      aggressive: 10
    };

    const scenarioAnalysis = Object.entries(scenarios).reduce((acc, [key, rate]) => {
      let scenarioBalance = currentSavings;
      const scenarioMonthlyReturn = rate / 100 / 12;
      
      for (let month = 0; month < yearsToRetirement * 12; month++) {
        const monthlyGrowth = scenarioBalance * scenarioMonthlyReturn;
        scenarioBalance += monthlyGrowth + monthlyContribution + employerMatch + rothContribution;
      }
      
      acc[key as keyof typeof scenarios] = Math.round(scenarioBalance);
      return acc;
    }, {} as Record<string, number>);

    return {
      yearsToRetirement,
      totalSavingsAtRetirement: Math.round(totalSavingsAtRetirement),
      totalContributions: Math.round(totalContributions),
      totalEmployerMatch: Math.round(totalEmployerMatch),
      totalGrowth: Math.round(totalGrowth),
      monthlyRetirementIncome,
      retirementDuration,
      totalNeeded: Math.round(totalNeeded),
      shortfall: Math.round(shortfall),
      surplusYears,
      yearlyProjection,
      scenarioAnalysis
    };
  }, [inputs]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.yearlyProjection.map(item => ({
      ...item,
      netGrowth: item.growth - item.withdrawals,
      phase: item.isRetired ? 'Retirement' : 'Accumulation'
    }));
  }, [results]);

  const contributionBreakdown = useMemo(() => {
    if (!results) return [];
    
    const monthlyTotal = inputs.monthlyContribution + inputs.employerMatch + inputs.rothContribution;
    
    return [
      { 
        name: 'Personal Contributions', 
        value: inputs.monthlyContribution, 
        color: '#8884d8',
        percentage: (inputs.monthlyContribution / monthlyTotal) * 100
      },
      { 
        name: 'Employer Match', 
        value: inputs.employerMatch, 
        color: '#82ca9d',
        percentage: (inputs.employerMatch / monthlyTotal) * 100
      },
      ...(inputs.includeRothIRA && inputs.rothContribution > 0 ? [{
        name: 'Roth IRA', 
        value: inputs.rothContribution, 
        color: '#ffc658',
        percentage: (inputs.rothContribution / monthlyTotal) * 100
      }] : [])
    ];
  }, [results, inputs]);

  const recommendations = useMemo(() => {
    if (!results) return [];
    
    const recs = [];
    
    // Retirement readiness
    if (results.shortfall > 0) {
      recs.push({
        type: 'warning',
        text: `You may have a shortfall of $${results.shortfall.toLocaleString()}. Consider increasing contributions or working longer.`
      });
    } else {
      recs.push({
        type: 'success',
        text: `Great! You're on track for retirement with ${results.surplusYears} years of financial security.`
      });
    }
    
    // Contribution optimization
    const currentSavingsRate = ((inputs.monthlyContribution + inputs.rothContribution) * 12) / (inputs.monthlyContribution * 12 / 0.15); // Estimate income
    if (currentSavingsRate < 0.15) {
      recs.push({
        type: 'info',
        text: `Consider increasing your savings rate to 15-20% of income for better retirement security.`
      });
    }
    
    // Employer match optimization
    if (inputs.employerMatch < inputs.monthlyContribution * 0.5) {
      recs.push({
        type: 'info',
        text: `Make sure you're maximizing your employer match - it's free money!`
      });
    }
    
    // Diversification
    if (inputs.annualReturn > 8) {
      recs.push({
        type: 'warning',
        text: `Your expected return of ${inputs.annualReturn}% is optimistic. Consider a more conservative estimate.`
      });
    }
    
    // Time horizon
    if (results.yearsToRetirement < 10) {
      recs.push({
        type: 'warning',
        text: `With ${results.yearsToRetirement} years to retirement, consider a more conservative investment strategy.`
      });
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
    <div className="space-y-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2} className="flex items-center gap-2">
            <PiggyBank size={24} />
            Retirement Planner
          </Title>
          <Badge variant="light" color="purple">Financial Planning</Badge>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Group grow>
                <NumberInput
                  label="Current Age"
                  value={inputs.currentAge}
                  onChange={(value) => setInputs(prev => ({ ...prev, currentAge: Number(value) || 0 }))}
                  min={18}
                  max={80}
                  leftSection={<Calendar size={16} />}
                />
                <NumberInput
                  label="Retirement Age"
                  value={inputs.retirementAge}
                  onChange={(value) => setInputs(prev => ({ ...prev, retirementAge: Number(value) || 0 }))}
                  min={50}
                  max={80}
                  leftSection={<Target size={16} />}
                />
              </Group>

              <NumberInput
                label="Current Retirement Savings ($)"
                value={inputs.currentSavings}
                onChange={(value) => setInputs(prev => ({ ...prev, currentSavings: Number(value) || 0 }))}
                min={0}
                step={1000}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <Group grow>
                <NumberInput
                  label="Monthly Contribution ($)"
                  value={inputs.monthlyContribution}
                  onChange={(value) => setInputs(prev => ({ ...prev, monthlyContribution: Number(value) || 0 }))}
                  min={0}
                  step={50}
                  leftSection={<DollarSign size={16} />}
                />
                <NumberInput
                  label="Employer Match ($)"
                  value={inputs.employerMatch}
                  onChange={(value) => setInputs(prev => ({ ...prev, employerMatch: Number(value) || 0 }))}
                  min={0}
                  step={50}
                  leftSection={<DollarSign size={16} />}
                />
              </Group>

              <Group align="flex-end">
                <Switch
                  label="Include Roth IRA"
                  checked={inputs.includeRothIRA}
                  onChange={(event) => setInputs(prev => ({ ...prev, includeRothIRA: event.currentTarget.checked }))}
                />
                {inputs.includeRothIRA && (
                  <NumberInput
                    label="Roth IRA Contribution ($)"
                    value={inputs.rothContribution}
                    onChange={(value) => setInputs(prev => ({ ...prev, rothContribution: Number(value) || 0 }))}
                    min={0}
                    step={50}
                    leftSection={<DollarSign size={16} />}
                    style={{ flex: 1 }}
                  />
                )}
              </Group>

              <div>
                <Text size="sm" fw={500} mb="xs">Expected Annual Return (%)</Text>
                <Slider
                  value={inputs.annualReturn}
                  onChange={(value) => setInputs(prev => ({ ...prev, annualReturn: value }))}
                  min={3}
                  max={12}
                  step={0.5}
                  marks={[
                    { value: 4, label: '4%' },
                    { value: 7, label: '7%' },
                    { value: 10, label: '10%' },
                    { value: 12, label: '12%' }
                  ]}
                  mb="md"
                />
                <Text size="sm" c="dimmed" ta="center">
                  Current: {inputs.annualReturn}%
                </Text>
              </div>

              <Group grow>
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
                  label="Life Expectancy"
                  value={inputs.lifeExpectancy}
                  onChange={(value) => setInputs(prev => ({ ...prev, lifeExpectancy: Number(value) || 0 }))}
                  min={70}
                  max={100}
                  leftSection={<Clock size={16} />}
                />
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <NumberInput
                label="Desired Monthly Retirement Income ($)"
                value={inputs.retirementIncome}
                onChange={(value) => setInputs(prev => ({ ...prev, retirementIncome: Number(value) || 0 }))}
                min={0}
                step={100}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <NumberInput
                label="Expected Social Security Benefit ($)"
                value={inputs.socialSecurityBenefit}
                onChange={(value) => setInputs(prev => ({ ...prev, socialSecurityBenefit: Number(value) || 0 }))}
                min={0}
                step={100}
                thousandSeparator=","
                leftSection={<Users size={16} />}
              />

              <div>
                <Text size="sm" fw={500} mb="xs">Withdrawal Rate (%)</Text>
                <Slider
                  value={inputs.withdrawalRate}
                  onChange={(value) => setInputs(prev => ({ ...prev, withdrawalRate: value }))}
                  min={3}
                  max={6}
                  step={0.1}
                  marks={[
                    { value: 3, label: '3%' },
                    { value: 4, label: '4%' },
                    { value: 5, label: '5%' },
                    { value: 6, label: '6%' }
                  ]}
                  mb="md"
                />
                <Text size="sm" c="dimmed" ta="center">
                  Current: {inputs.withdrawalRate}% (4% is traditional safe rate)
                </Text>
              </div>

              <Group grow>
                <NumberInput
                  label="Current Tax Rate (%)"
                  value={inputs.taxRate}
                  onChange={(value) => setInputs(prev => ({ ...prev, taxRate: Number(value) || 0 }))}
                  min={0}
                  max={50}
                  step={1}
                />
                <NumberInput
                  label="Retirement Tax Rate (%)"
                  value={inputs.retirementTaxRate}
                  onChange={(value) => setInputs(prev => ({ ...prev, retirementTaxRate: Number(value) || 0 }))}
                  min={0}
                  max={50}
                  step={1}
                />
              </Group>

              {results && (
                <Stack gap="md" mt="md">
                  <Card withBorder p="md" className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Retirement Savings</Text>
                      <Text size="xl" fw={700} c="purple">
                        ${results.totalSavingsAtRetirement.toLocaleString()}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Years to Retirement</Text>
                      <Text size="xl" fw={700} c="green">
                        {results.yearsToRetirement}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className={`bg-gradient-to-r ${
                    results.shortfall > 0 
                      ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20' 
                      : 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                  }`}>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        {results.shortfall > 0 ? 'Shortfall' : 'Surplus'}
                      </Text>
                      <Text size="lg" fw={600} c={results.shortfall > 0 ? 'red' : 'green'}>
                        ${Math.abs(results.shortfall).toLocaleString()}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Retirement Duration</Text>
                      <Text size="lg" fw={600} c="blue">
                        {results.retirementDuration} years
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
          <Tabs defaultValue="projection" className="w-full">
            <Tabs.List>
              <Tabs.Tab value="projection" leftSection={<TrendingUp size={16} />}>
                Projection
              </Tabs.Tab>
              <Tabs.Tab value="contributions" leftSection={<PiggyBank size={16} />}>
                Contributions
              </Tabs.Tab>
              <Tabs.Tab value="scenarios" leftSection={<Target size={16} />}>
                Scenarios
              </Tabs.Tab>
              <Tabs.Tab value="analysis" leftSection={<Calculator size={16} />}>
                Analysis
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="projection" pt="md">
              <Title order={4} mb="md">Retirement Savings Projection</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="age" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="balance" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
                    <Bar dataKey="contributions" fill={chartColors.secondary} />
                    <Bar dataKey="withdrawals" fill={chartColors.danger} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="contributions" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Title order={4} mb="md">Monthly Contribution Breakdown</Title>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={contributionBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                        >
                          {contributionBreakdown.map((entry, index) => (
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
                  <Title order={4} mb="md">Contribution Summary</Title>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text>Total Contributions:</Text>
                      <Text fw={600}>${results.totalContributions.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Employer Match:</Text>
                      <Text fw={600} c="green">${results.totalEmployerMatch.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Investment Growth:</Text>
                      <Text fw={600} c="blue">${results.totalGrowth.toLocaleString()}</Text>
                    </Group>
                    <Divider />
                    <Group justify="space-between">
                      <Text fw={600}>Total at Retirement:</Text>
                      <Text fw={700} size="lg">${results.totalSavingsAtRetirement.toLocaleString()}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="scenarios" pt="md">
              <Title order={4} mb="md">Return Scenarios</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={[
                    { name: 'Conservative (5%)', value: results.scenarioAnalysis.conservative, color: '#8884d8' },
                    { name: 'Moderate (7%)', value: results.scenarioAnalysis.moderate, color: '#82ca9d' },
                    { name: 'Aggressive (10%)', value: results.scenarioAnalysis.aggressive, color: '#ffc658' }
                  ]}>
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
                    <Bar dataKey="value" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="analysis" pt="md">
              <Title order={4} mb="md">Retirement Analysis & Recommendations</Title>
              <Stack gap="md">
                {recommendations.map((rec, index) => (
                  <Card key={index} withBorder p="md" className={`
                    ${rec.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}
                    ${rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : ''}
                    ${rec.type === 'info' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}
                  `}>
                    <Text size="sm">{rec.text}</Text>
                  </Card>
                ))}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default RetirementPlanner; 