import { Badge, Card, Divider, Grid, Group, NumberInput, Progress, Slider, Stack, Tabs, Text, Title, useMantineColorScheme, ActionIcon } from '@mantine/core';
import { Calculator, DollarSign, Home, Percent, PiggyBank, TrendingUp, RotateCcw } from 'lucide-react';
import React, { useMemo } from 'react';

import { Area, AreaChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface MortgageInput {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  homeInsurance: number;
  pmiRate: number;
  hoaFees: number;
  extraPayment: number;
  mortgageType: 'fixed' | 'arm';
  armInitialRate: number;
  armAdjustmentPeriod: number;
}

/*
interface _MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffTime: number;
  amortizationSchedule: Array<{
    month: number;
    year: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    cumulativePrincipal: number;
    cumulativeInterest: number;
  }>;
  affordabilityAnalysis: {
    monthlyIncome: number;
    debtToIncomeRatio: number;
    housingRatio: number;
    isAffordable: boolean;
    maxAffordablePayment: number;
  };
}
*/

const MortgageCalculator: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultInputs: MortgageInput = {
    homePrice: 400000,
    downPayment: 80000,
    downPaymentPercent: 20,
    loanTerm: 30,
    interestRate: 6.5,
    propertyTax: 6000,
    homeInsurance: 1200,
    pmiRate: 0.5,
    hoaFees: 0,
    extraPayment: 0,
    mortgageType: 'fixed',
    armInitialRate: 5.5,
    armAdjustmentPeriod: 5
  };

  const [inputsStorage, setInputs] = useLocalStorage<MortgageInput>('mortgage-calculator-inputs', defaultInputs);
  const [monthlyIncomeStorage, setMonthlyIncome] = useLocalStorage<number>('mortgage-calculator-monthly-income', 8000);

  // Ensure non-null values (hook always returns initialValue if null)
  const inputs = inputsStorage ?? defaultInputs;
  const monthlyIncome = monthlyIncomeStorage ?? 8000;

  const resetToDefaults = () => {
    setInputs(defaultInputs);
    setMonthlyIncome(8000);
  };

  const updateDownPayment = (value: number, isPercent: boolean) => {
    if (isPercent) {
      const newPercent = value;
      const newAmount = (inputs.homePrice * newPercent) / 100;
      setInputs(prev => ({
        ...prev,
        downPaymentPercent: newPercent,
        downPayment: newAmount
      }));
    } else {
      const newAmount = value;
      const newPercent = (newAmount / inputs.homePrice) * 100;
      setInputs(prev => ({
        ...prev,
        downPayment: newAmount,
        downPaymentPercent: newPercent
      }));
    }
  };

  const results = useMemo(() => {
    const {
      homePrice,
      downPayment,
      loanTerm,
      interestRate,
      propertyTax,
      homeInsurance,
      pmiRate,
      hoaFees,
      extraPayment
    } = inputs;

    if (homePrice <= 0 || downPayment < 0 || loanTerm <= 0 || interestRate < 0) {
      return null;
    }

    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTerm * 12;

    // Calculate monthly principal and interest
    const monthlyPrincipalInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    // Calculate other monthly costs
    const monthlyPropertyTax = propertyTax / 12;
    const monthlyInsurance = homeInsurance / 12;
    const monthlyPMI = (downPayment / homePrice) < 0.2 ? (loanAmount * pmiRate / 100) / 12 : 0;
    const monthlyHOA = hoaFees;

    const totalMonthlyPayment = monthlyPrincipalInterest + monthlyPropertyTax + 
                               monthlyInsurance + monthlyPMI + monthlyHOA;

    // Generate amortization schedule
    const amortizationSchedule = [];
    let remainingBalance = loanAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    for (let month = 1; month <= totalPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = monthlyPrincipalInterest - interestPayment + extraPayment;
      
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      remainingBalance -= principalPayment;
      cumulativePrincipal += principalPayment;
      cumulativeInterest += interestPayment;

      amortizationSchedule.push({
        month,
        year: Math.ceil(month / 12),
        payment: monthlyPrincipalInterest + extraPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance,
        cumulativePrincipal,
        cumulativeInterest
      });

      if (remainingBalance <= 0) break;
    }

    const totalInterest = cumulativeInterest;
    const totalCost = loanAmount + totalInterest;
    const payoffTime = amortizationSchedule.length;

    // Affordability analysis
    const debtToIncomeRatio = (totalMonthlyPayment / monthlyIncome) * 100;
    const housingRatio = (totalMonthlyPayment / monthlyIncome) * 100;
    const isAffordable = debtToIncomeRatio <= 43 && housingRatio <= 28;
    const maxAffordablePayment = monthlyIncome * 0.28;

    return {
      loanAmount,
      monthlyPayment: monthlyPrincipalInterest,
      monthlyPrincipalInterest,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyPMI,
      monthlyHOA,
      totalMonthlyPayment,
      totalInterest,
      totalCost,
      payoffTime,
      amortizationSchedule,
      affordabilityAnalysis: {
        monthlyIncome,
        debtToIncomeRatio,
        housingRatio,
        isAffordable,
        maxAffordablePayment
      }
    };
  }, [inputs, monthlyIncome]);

  const chartData = useMemo(() => {
    if (!results) return [];
    
    // Group by year for better visualization
    const yearlyData = [];
    const schedule = results.amortizationSchedule;
    
    for (let year = 1; year <= Math.ceil(schedule.length / 12); year++) {
      const yearPayments = schedule.filter(p => p.year === year);
      if (yearPayments.length === 0) continue;
      
      const yearPrincipal = yearPayments.reduce((sum, p) => sum + p.principal, 0);
      const yearInterest = yearPayments.reduce((sum, p) => sum + p.interest, 0);
      const endBalance = yearPayments[yearPayments.length - 1]?.balance || 0;
      
      yearlyData.push({
        year,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.round(endBalance),
        cumulativePrincipal: Math.round(yearPayments[yearPayments.length - 1]?.cumulativePrincipal || 0),
        cumulativeInterest: Math.round(yearPayments[yearPayments.length - 1]?.cumulativeInterest || 0)
      });
    }
    
    return yearlyData;
  }, [results]);

  const costBreakdown = useMemo(() => {
    if (!results) return [];
    
    return [
      { 
        name: 'Principal & Interest', 
        value: results.monthlyPrincipalInterest, 
        color: '#8884d8',
        percentage: (results.monthlyPrincipalInterest / results.totalMonthlyPayment) * 100
      },
      { 
        name: 'Property Tax', 
        value: results.monthlyPropertyTax, 
        color: '#82ca9d',
        percentage: (results.monthlyPropertyTax / results.totalMonthlyPayment) * 100
      },
      { 
        name: 'Home Insurance', 
        value: results.monthlyInsurance, 
        color: '#ffc658',
        percentage: (results.monthlyInsurance / results.totalMonthlyPayment) * 100
      },
      ...(results.monthlyPMI > 0 ? [{
        name: 'PMI', 
        value: results.monthlyPMI, 
        color: '#ff7300',
        percentage: (results.monthlyPMI / results.totalMonthlyPayment) * 100
      }] : []),
      ...(results.monthlyHOA > 0 ? [{
        name: 'HOA Fees', 
        value: results.monthlyHOA, 
        color: '#8dd1e1',
        percentage: (results.monthlyHOA / results.totalMonthlyPayment) * 100
      }] : [])
    ];
  }, [results]);

  const recommendations = useMemo(() => {
    if (!results) return [];
    
    const recs = [];
    
    // Affordability recommendations
    if (!results.affordabilityAnalysis.isAffordable) {
      recs.push({
        type: 'warning',
        text: `Your debt-to-income ratio is ${results.affordabilityAnalysis.debtToIncomeRatio.toFixed(1)}%. Consider a smaller loan or higher income.`
      });
    } else {
      recs.push({
        type: 'success',
        text: `Great! Your mortgage payment fits within recommended affordability guidelines.`
      });
    }
    
    // Down payment recommendations
    if (inputs.downPaymentPercent < 20) {
      recs.push({
        type: 'warning',
        text: `With ${inputs.downPaymentPercent.toFixed(1)}% down, you'll pay PMI of $${results.monthlyPMI.toFixed(0)}/month until you reach 20% equity.`
      });
    } else {
      recs.push({
        type: 'success',
        text: `Excellent! With 20%+ down payment, you avoid PMI and save money monthly.`
      });
    }
    
    // Extra payment recommendations
    if (inputs.extraPayment === 0) {
      // const _extraPaymentSavings = results.totalInterest * 0.3; // Rough estimate
      recs.push({
        type: 'info',
        text: `Consider extra payments! Even $100/month could save you tens of thousands in interest.`
      });
    } else {
      const monthsSaved = (inputs.loanTerm * 12) - results.payoffTime;
      recs.push({
        type: 'success',
        text: `Your extra payments will save you ${Math.round(monthsSaved)} months and significant interest!`
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
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2} className="flex items-center gap-2">
            <Home size={24} />
            Mortgage Calculator
          </Title>
          <Group gap="xs">
            <ActionIcon 
              variant="light" 
              color="gray" 
              onClick={resetToDefaults}
              title="Reset to defaults"
            >
              <RotateCcw size={18} />
            </ActionIcon>
            <Badge variant="light" color="blue">Home Financing</Badge>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <NumberInput
                label="Home Price ($)"
                value={inputs.homePrice}
                onChange={(value) => setInputs(prev => ({ ...prev, homePrice: Number(value) || 0 }))}
                min={0}
                step={1000}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <Group grow>
                <NumberInput
                  label="Down Payment ($)"
                  value={inputs.downPayment}
                  onChange={(value) => updateDownPayment(Number(value) || 0, false)}
                  min={0}
                  step={1000}
                  thousandSeparator=","
                  leftSection={<DollarSign size={16} />}
                />
                <NumberInput
                  label="Down Payment (%)"
                  value={inputs.downPaymentPercent}
                  onChange={(value) => updateDownPayment(Number(value) || 0, true)}
                  min={0}
                  max={100}
                  step={0.5}
                  decimalScale={1}
                  leftSection={<Percent size={16} />}
                />
              </Group>

              <Group grow>
                <NumberInput
                  label="Loan Term (Years)"
                  value={inputs.loanTerm}
                  onChange={(value) => setInputs(prev => ({ ...prev, loanTerm: Number(value) || 0 }))}
                  min={1}
                  max={50}
                />
                <div>
                  <Text size="sm" fw={500} mb="xs">Interest Rate (%)</Text>
                  <Slider
                    value={inputs.interestRate}
                    onChange={(value) => setInputs(prev => ({ ...prev, interestRate: value }))}
                    min={2}
                    max={12}
                    step={0.1}
                    marks={[
                      { value: 3, label: '3%' },
                      { value: 6, label: '6%' },
                      { value: 9, label: '9%' },
                      { value: 12, label: '12%' }
                    ]}
                    mb="md"
                  />
                  <Text size="sm" c="dimmed" ta="center">
                    Current: {inputs.interestRate}%
                  </Text>
                </div>
              </Group>

              <Divider label="Additional Costs" labelPosition="center" />

              <Group grow>
                <NumberInput
                  label="Property Tax (Annual)"
                  value={inputs.propertyTax}
                  onChange={(value) => setInputs(prev => ({ ...prev, propertyTax: Number(value) || 0 }))}
                  min={0}
                  step={100}
                  thousandSeparator=","
                  leftSection={<DollarSign size={16} />}
                />
                <NumberInput
                  label="Home Insurance (Annual)"
                  value={inputs.homeInsurance}
                  onChange={(value) => setInputs(prev => ({ ...prev, homeInsurance: Number(value) || 0 }))}
                  min={0}
                  step={100}
                  thousandSeparator=","
                  leftSection={<DollarSign size={16} />}
                />
              </Group>

              <Group grow>
                <NumberInput
                  label="PMI Rate (%)"
                  value={inputs.pmiRate}
                  onChange={(value) => setInputs(prev => ({ ...prev, pmiRate: Number(value) || 0 }))}
                  min={0}
                  max={2}
                  step={0.1}
                  decimalScale={1}
                  leftSection={<Percent size={16} />}
                />
                <NumberInput
                  label="HOA Fees (Monthly)"
                  value={inputs.hoaFees}
                  onChange={(value) => setInputs(prev => ({ ...prev, hoaFees: Number(value) || 0 }))}
                  min={0}
                  step={25}
                  leftSection={<DollarSign size={16} />}
                />
              </Group>

              <NumberInput
                label="Extra Monthly Payment ($)"
                value={inputs.extraPayment}
                onChange={(value) => setInputs(prev => ({ ...prev, extraPayment: Number(value) || 0 }))}
                min={0}
                step={50}
                leftSection={<DollarSign size={16} />}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <NumberInput
                label="Monthly Income ($)"
                value={monthlyIncome}
                onChange={(value) => setMonthlyIncome(Number(value) || 0)}
                min={0}
                step={500}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              {results && (
                <Stack gap="md">
                  <Card withBorder p="md" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Monthly P&I</Text>
                      <Text size="xl" fw={700} c="blue">
                        ${results.monthlyPrincipalInterest.toFixed(0)}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Total Monthly Payment</Text>
                      <Text size="xl" fw={700} c="green">
                        ${results.totalMonthlyPayment.toFixed(0)}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Total Interest</Text>
                      <Text size="lg" fw={600} c="orange">
                        ${results.totalInterest.toFixed(0)}
                      </Text>
                    </Group>
                  </Card>

                  <Card withBorder p="md" className={`bg-gradient-to-r ${
                    results.affordabilityAnalysis.isAffordable 
                      ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                      : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
                  }`}>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Debt-to-Income Ratio</Text>
                        <Text size="lg" fw={600} c={results.affordabilityAnalysis.isAffordable ? 'green' : 'red'}>
                          {results.affordabilityAnalysis.debtToIncomeRatio.toFixed(1)}%
                        </Text>
                      </Group>
                      <Progress
                        value={results.affordabilityAnalysis.debtToIncomeRatio}
                        color={results.affordabilityAnalysis.isAffordable ? 'green' : 'red'}
                        size="sm"
                      />
                      <Text size="xs" c="dimmed">
                        Recommended: ≤ 43%
                      </Text>
                    </Stack>
                  </Card>
                </Stack>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      {results && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Tabs defaultValue="overview" className="w-full">
            <Tabs.List>
              <Tabs.Tab value="overview" leftSection={<Calculator size={16} />}>
                Overview
              </Tabs.Tab>
              <Tabs.Tab value="breakdown" leftSection={<PieChart style={{ width: 16, height: 16 }} />}>
                Payment Breakdown
              </Tabs.Tab>
              <Tabs.Tab value="amortization" leftSection={<TrendingUp size={16} />}>
                Amortization
              </Tabs.Tab>
              <Tabs.Tab value="affordability" leftSection={<PiggyBank size={16} />}>
                Affordability
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Title order={4} mb="md">Principal vs Interest Over Time</Title>
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
                        <Area type="monotone" dataKey="principal" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
                        <Area type="monotone" dataKey="interest" stackId="1" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.3} />
                        <Line type="monotone" dataKey="balance" stroke={chartColors.accent} strokeWidth={2} strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Title order={4} mb="md">Loan Summary</Title>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text>Home Price:</Text>
                      <Text fw={600}>${inputs.homePrice.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Down Payment:</Text>
                      <Text fw={600}>${inputs.downPayment.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Loan Amount:</Text>
                      <Text fw={600}>${results.loanAmount.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Interest Rate:</Text>
                      <Text fw={600}>{inputs.interestRate}%</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Loan Term:</Text>
                      <Text fw={600}>{inputs.loanTerm} years</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Total Cost:</Text>
                      <Text fw={600}>${results.totalCost.toLocaleString()}</Text>
                    </Group>
                    {inputs.extraPayment > 0 && (
                      <Group justify="space-between">
                        <Text>Payoff Time:</Text>
                        <Text fw={600} c="green">
                          {Math.round(results.payoffTime / 12)} years
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="breakdown" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Title order={4} mb="md">Monthly Payment Breakdown</Title>
                  <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                        >
                          {costBreakdown.map((entry, index) => (
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
                  <Title order={4} mb="md">Monthly Costs</Title>
                  <Stack gap="sm">
                    {costBreakdown.map((item, index) => (
                      <Group key={index} justify="space-between">
                        <Group gap="xs">
                          <div style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 2 }} />
                          <Text size="sm">{item.name}:</Text>
                        </Group>
                        <Text size="sm" fw={600}>${item.value.toFixed(0)}</Text>
                      </Group>
                    ))}
                    <Divider />
                    <Group justify="space-between">
                      <Text fw={600}>Total Monthly Payment:</Text>
                      <Text fw={700} size="lg">${results.totalMonthlyPayment.toFixed(0)}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="amortization" pt="md">
              <Title order={4} mb="md">Loan Balance Over Time</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
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
                    <Area type="monotone" dataKey="balance" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="cumulativePrincipal" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="affordability" pt="md">
              <Title order={4} mb="md">Affordability Analysis</Title>
              <Stack gap="md">
                <Card withBorder p="md" className={`
                  ${results.affordabilityAnalysis.isAffordable 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }
                `}>
                  <Group justify="space-between" align="center">
                    <Stack gap="xs">
                      <Text fw={600}>
                        {results.affordabilityAnalysis.isAffordable ? '✅ Affordable' : '⚠️ May Not Be Affordable'}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Based on debt-to-income ratio of {results.affordabilityAnalysis.debtToIncomeRatio.toFixed(1)}%
                      </Text>
                    </Stack>
                    <Text size="xl" fw={700} c={results.affordabilityAnalysis.isAffordable ? 'green' : 'red'}>
                      {results.affordabilityAnalysis.debtToIncomeRatio.toFixed(1)}%
                    </Text>
                  </Group>
                </Card>

                <Group grow>
                  <Card withBorder p="md">
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Monthly Income</Text>
                      <Text size="lg" fw={600}>${monthlyIncome.toLocaleString()}</Text>
                    </Stack>
                  </Card>
                  <Card withBorder p="md">
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Monthly Payment</Text>
                      <Text size="lg" fw={600}>${results.totalMonthlyPayment.toFixed(0)}</Text>
                    </Stack>
                  </Card>
                  <Card withBorder p="md">
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Max Recommended</Text>
                      <Text size="lg" fw={600}>${results.affordabilityAnalysis.maxAffordablePayment.toFixed(0)}</Text>
                    </Stack>
                  </Card>
                </Group>

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
    </>
  );
};

export default MortgageCalculator; 