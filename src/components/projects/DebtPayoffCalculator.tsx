import { Badge, Card, Divider, Grid, Group, NumberInput, Select, SimpleGrid, Stack, Tabs, Text, TextInput, Title, Button, useMantineColorScheme, Alert, Progress } from '@mantine/core';
import { Calculator, CreditCard, DollarSign, TrendingDown, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

interface PayoffResult {
  strategy: 'snowball' | 'avalanche';
  totalPayments: number;
  totalInterest: number;
  payoffTime: number;
  monthlyPayments: number[];
  schedule: Array<{
    month: number;
    totalBalance: number;
    totalPaid: number;
    debts: Array<{
      id: string;
      name: string;
      balance: number;
      paid: number;
      interest: number;
    }>;
  }>;
}

const DebtPayoffCalculator: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Credit Card', balance: 5000, interestRate: 18.99, minPayment: 150 },
    { id: '2', name: 'Personal Loan', balance: 10000, interestRate: 8.5, minPayment: 300 },
    { id: '3', name: 'Car Loan', balance: 15000, interestRate: 5.5, minPayment: 400 },
  ]);

  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [extraPayment, setExtraPayment] = useState(500);

  const calculatePayoff = (debts: Debt[], strategy: 'snowball' | 'avalanche', extraPayment: number): PayoffResult => {
    // Create a copy of debts to avoid mutating state
    const workingDebts = debts.map(d => ({ ...d, balance: d.balance }));
    
    // Sort debts based on strategy
    if (strategy === 'snowball') {
      // Snowball: Pay smallest balance first
      workingDebts.sort((a, b) => a.balance - b.balance);
    } else {
      // Avalanche: Pay highest interest rate first
      workingDebts.sort((a, b) => b.interestRate - a.interestRate);
    }

    const schedule: PayoffResult['schedule'] = [];
    let month = 0;
    let totalPaid = 0;
    let totalInterest = 0;
    const monthlyPayments: number[] = [];

    while (workingDebts.some(d => d.balance > 0.01) && month < 600) { // Max 50 years
      month++;
      const monthSchedule: PayoffResult['schedule'][0] = {
        month,
        totalBalance: 0,
        totalPaid: 0,
        debts: []
      };

      let availableExtra = extraPayment;

      // Pay off debts in order
      for (let i = 0; i < workingDebts.length; i++) {
        const debt = workingDebts[i];
        if (debt.balance <= 0.01) continue;

        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = debt.balance * monthlyRate;
        let payment = debt.minPayment;

        // Add extra payment to first active debt
        if (i === 0 && availableExtra > 0) {
          payment += availableExtra;
          availableExtra = 0;
        }

        // Apply payment
        const principalPayment = Math.min(payment - interest, debt.balance);
        debt.balance = Math.max(0, debt.balance - principalPayment);
        totalPaid += payment;
        totalInterest += interest;

        monthSchedule.debts.push({
          id: debt.id,
          name: debt.name,
          balance: debt.balance,
          paid: payment,
          interest
        });

        monthSchedule.totalBalance += debt.balance;
        monthSchedule.totalPaid += payment;

        // Move paid-off debt to end and re-sort remaining debts
        if (debt.balance <= 0.01 && i < workingDebts.length - 1) {
          const paidDebt = workingDebts.splice(i, 1)[0];
          workingDebts.push(paidDebt);
          i--; // Re-check current index
        }
      }

      monthlyPayments.push(monthSchedule.totalPaid);
      schedule.push(monthSchedule);
    }

    return {
      strategy,
      totalPayments: totalPaid,
      totalInterest,
      payoffTime: month,
      monthlyPayments,
      schedule
    };
  };

  const snowballResult = useMemo(() => calculatePayoff(debts, 'snowball', extraPayment), [debts, extraPayment]);
  const avalancheResult = useMemo(() => calculatePayoff(debts, 'avalanche', extraPayment), [debts, extraPayment]);

  const comparisonData = [
    {
      metric: 'Total Interest',
      snowball: snowballResult.totalInterest,
      avalanche: avalancheResult.totalInterest,
    },
    {
      metric: 'Payoff Time',
      snowball: snowballResult.payoffTime,
      avalanche: avalancheResult.payoffTime,
    },
    {
      metric: 'Total Paid',
      snowball: snowballResult.totalPayments,
      avalanche: avalancheResult.totalPayments,
    },
  ];

  const timelineData = useMemo(() => {
    const maxMonths = Math.max(snowballResult.payoffTime, avalancheResult.payoffTime);
    const data = [];
    
    for (let month = 0; month <= maxMonths; month++) {
      const snowballBalance = snowballResult.schedule[month]?.totalBalance || 0;
      const avalancheBalance = avalancheResult.schedule[month]?.totalBalance || 0;
      
      data.push({
        month,
        snowball: snowballBalance,
        avalanche: avalancheBalance,
      });
    }
    
    return data;
  }, [snowballResult, avalancheResult]);

  const chartColors = {
    primary: isDark ? '#8884d8' : '#6366f1',
    secondary: isDark ? '#82ca9d' : '#10b981',
    accent: isDark ? '#ffc658' : '#f59e0b',
  };

  const updateDebt = (id: string, field: keyof Debt, value: number) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addDebt = () => {
    setDebts(prev => [...prev, {
      id: String(Date.now()),
      name: `Debt ${prev.length + 1}`,
      balance: 5000,
      interestRate: 10,
      minPayment: 100
    }]);
  };

  const removeDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const savings = snowballResult.totalInterest - avalancheResult.totalInterest;
  const betterStrategy = savings > 0 ? 'avalanche' : 'snowball';
  const timeDifference = Math.abs(snowballResult.payoffTime - avalancheResult.payoffTime);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (Math.abs(savings) > 1000) {
      recs.push({
        type: 'success',
        icon: <CheckCircle size={16} />,
        title: 'Significant Savings Available',
        message: `The ${betterStrategy === 'avalanche' ? 'Avalanche' : 'Snowball'} method saves $${Math.abs(savings).toLocaleString()} in interest compared to the other strategy.`,
      });
    }

    if (timeDifference > 12) {
      const faster = snowballResult.payoffTime < avalancheResult.payoffTime ? 'Snowball' : 'Avalanche';
      recs.push({
        type: 'info',
        icon: <AlertCircle size={16} />,
        title: 'Faster Payoff Option',
        message: `The ${faster} method pays off debt ${Math.round(timeDifference / 12)} years faster, providing financial freedom sooner.`,
      });
    }

    if (totalMinPayments > 0 && extraPayment > 0) {
      const totalMonthly = totalMinPayments + extraPayment;
      const yearsToPayoff = (betterStrategy === 'avalanche' ? avalancheResult.payoffTime : snowballResult.payoffTime) / 12;
      recs.push({
        type: 'info',
        icon: <AlertCircle size={16} />,
        title: 'Monthly Payment Summary',
        message: `With your current plan, you'll pay $${totalMonthly.toLocaleString()}/month and be debt-free in ${yearsToPayoff.toFixed(1)} years.`,
      });
    }

    if (extraPayment === 0) {
      recs.push({
        type: 'warning',
        icon: <AlertCircle size={16} />,
        title: 'Consider Extra Payments',
        message: 'Adding extra monthly payments can significantly reduce your payoff time and total interest paid.',
      });
    }

    return recs;
  }, [savings, betterStrategy, timeDifference, totalMinPayments, extraPayment, snowballResult.payoffTime, avalancheResult.payoffTime]);

  // Debt breakdown pie chart data
  const debtPieData = useMemo(() => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0000ff'];
    return debts.map((debt, index) => ({
      name: debt.name,
      value: debt.balance,
      color: colors[index % colors.length],
    }));
  }, [debts]);

  // Payoff order visualization
  const payoffOrder = useMemo(() => {
    const snowballOrder = [...debts].sort((a, b) => a.balance - b.balance);
    const avalancheOrder = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    return { snowball: snowballOrder, avalanche: avalancheOrder };
  }, [debts]);

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2} className="flex items-center gap-2">
            <CreditCard size={24} />
            Debt Payoff Calculator
          </Title>
          <Badge variant="light" color="red">Debt Management</Badge>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Select
                label="Payoff Strategy"
                value={strategy}
                onChange={(value) => setStrategy(value as 'snowball' | 'avalanche')}
                data={[
                  { value: 'snowball', label: 'Debt Snowball (Smallest First)' },
                  { value: 'avalanche', label: 'Debt Avalanche (Highest Interest First)' }
                ]}
                description="Snowball: Pay smallest balances first. Avalanche: Pay highest interest first."
              />

              <NumberInput
                label="Extra Monthly Payment ($)"
                value={extraPayment}
                onChange={(value) => setExtraPayment(Number(value) || 0)}
                min={0}
                step={50}
                leftSection={<DollarSign size={16} />}
                description="Additional payment beyond minimums"
              />

              <Divider label="Your Debts" labelPosition="center" />

              {debts.map((debt, index) => (
                <Card key={debt.id} withBorder p="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={600}>Debt {index + 1}</Text>
                      {debts.length > 1 && (
                        <Button size="xs" variant="subtle" color="red" onClick={() => removeDebt(debt.id)}>
                          Remove
                        </Button>
                      )}
                    </Group>
                    <TextInput
                      label="Name"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, 'name', e.target.value as any)}
                      placeholder="e.g., Credit Card"
                    />
                    <NumberInput
                      label="Balance ($)"
                      value={debt.balance}
                      onChange={(value) => updateDebt(debt.id, 'balance', Number(value) || 0)}
                      min={0}
                      thousandSeparator=","
                    />
                    <NumberInput
                      label="Interest Rate (%)"
                      value={debt.interestRate}
                      onChange={(value) => updateDebt(debt.id, 'interestRate', Number(value) || 0)}
                      min={0}
                      max={100}
                      decimalScale={2}
                      step={0.1}
                    />
                    <NumberInput
                      label="Minimum Payment ($)"
                      value={debt.minPayment}
                      onChange={(value) => updateDebt(debt.id, 'minPayment', Number(value) || 0)}
                      min={0}
                      thousandSeparator=","
                    />
                  </Stack>
                </Card>
              ))}

              <Button variant="light" onClick={addDebt} fullWidth>
                Add Another Debt
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Card withBorder p="md" className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Total Debt</Text>
                  <Text size="xl" fw={700} c="red">
                    ${totalDebt.toLocaleString()}
                  </Text>
                </Group>
              </Card>

              <Card withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Text size="sm" c="dimmed">Strategy Comparison</Text>
                </Group>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm">Snowball Method:</Text>
                    <Text fw={600}>${snowballResult.totalInterest.toLocaleString()} interest</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Avalanche Method:</Text>
                    <Text fw={600}>${avalancheResult.totalInterest.toLocaleString()} interest</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>Savings with {betterStrategy === 'avalanche' ? 'Avalanche' : 'Snowball'}:</Text>
                    <Text size="lg" fw={700} c={betterStrategy === 'avalanche' ? 'green' : 'blue'}>
                      ${Math.abs(savings).toLocaleString()}
                    </Text>
                  </Group>
                </Stack>
              </Card>

              <Card withBorder p="md" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Payoff Time ({strategy === 'snowball' ? 'Snowball' : 'Avalanche'})</Text>
                  <Text size="xl" fw={700} c="blue">
                    {(strategy === 'snowball' ? snowballResult.payoffTime : avalancheResult.payoffTime) / 12} years
                  </Text>
                </Group>
              </Card>

              <Card withBorder p="md" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Total Interest ({strategy === 'snowball' ? 'Snowball' : 'Avalanche'})</Text>
                  <Text size="xl" fw={700} c="green">
                    ${(strategy === 'snowball' ? snowballResult.totalInterest : avalancheResult.totalInterest).toLocaleString()}
                  </Text>
                </Group>
              </Card>

              <Card withBorder p="md">
                <Text size="sm" c="dimmed" mb="xs">Total Monthly Payment</Text>
                <Text size="lg" fw={600}>
                  ${(totalMinPayments + extraPayment).toLocaleString()}
                </Text>
                <Progress 
                  value={(totalMinPayments / (totalMinPayments + extraPayment)) * 100} 
                  color="blue" 
                  size="sm" 
                  mt="xs"
                />
                <Group justify="space-between" mt="xs">
                  <Text size="xs" c="dimmed">Minimums: ${totalMinPayments.toLocaleString()}</Text>
                  <Text size="xs" c="dimmed">Extra: ${extraPayment.toLocaleString()}</Text>
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        {recommendations.length > 0 && (
          <Stack gap="md" mt="md">
            {recommendations.map((rec, index) => (
              <Alert key={index} icon={rec.icon} title={rec.title} color={rec.type === 'success' ? 'green' : rec.type === 'warning' ? 'yellow' : 'blue'}>
                {rec.message}
              </Alert>
            ))}
          </Stack>
        )}
      </Card>

      {(snowballResult.schedule.length > 0 || avalancheResult.schedule.length > 0) && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Tabs defaultValue="comparison" className="w-full">
            <Tabs.List>
              <Tabs.Tab value="comparison" leftSection={<Calculator size={16} />}>
                Comparison
              </Tabs.Tab>
              <Tabs.Tab value="timeline" leftSection={<TrendingDown size={16} />}>
                Timeline
              </Tabs.Tab>
              <Tabs.Tab value="breakdown" leftSection={<Wallet size={16} />}>
                Breakdown
              </Tabs.Tab>
              <Tabs.Tab value="payments" leftSection={<DollarSign size={16} />}>
                Monthly Payments
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="comparison" pt="md">
              <Title order={4} mb="md">Strategy Comparison</Title>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="metric" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => {
                        if (comparisonData.find(d => d.metric === 'Payoff Time')) {
                          return `${(value / 12).toFixed(1)} years`;
                        }
                        return `$${value.toLocaleString()}`;
                      }}
                    />
                    <Bar dataKey="snowball" fill={chartColors.primary} name="Snowball" />
                    <Bar dataKey="avalanche" fill={chartColors.secondary} name="Avalanche" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="timeline" pt="md">
              <Title order={4} mb="md">Debt Payoff Timeline</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      labelFormatter={(value) => `Month ${value}`}
                    />
                    <Area type="monotone" dataKey="snowball" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} name="Snowball Method" />
                    <Area type="monotone" dataKey="avalanche" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.3} name="Avalanche Method" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="breakdown" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Title order={4} mb="md">Debt Distribution</Title>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={debtPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {debtPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Title order={4} mb="md">Payoff Order ({strategy === 'snowball' ? 'Snowball' : 'Avalanche'})</Title>
                  <Stack gap="sm">
                    {(strategy === 'snowball' ? payoffOrder.snowball : payoffOrder.avalanche).map((debt, index) => (
                      <Card key={debt.id} withBorder p="sm">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <Badge size="lg" variant="light" color={index === 0 ? 'green' : 'gray'}>
                              {index + 1}
                            </Badge>
                            <Text fw={600}>{debt.name}</Text>
                          </Group>
                          {index === 0 && <Badge color="green" size="sm">Pay First</Badge>}
                        </Group>
                        <Group justify="space-between" mt="xs">
                          <Text size="sm" c="dimmed">Balance:</Text>
                          <Text fw={600}>${debt.balance.toLocaleString()}</Text>
                        </Group>
                        {strategy === 'avalanche' && (
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">Rate:</Text>
                            <Text fw={600}>{debt.interestRate}%</Text>
                          </Group>
                        )}
                      </Card>
                    ))}
                  </Stack>
                </Grid.Col>
              </Grid>
              <Divider my="md" />
              <Title order={4} mb="md">Individual Debt Details</Title>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                {debts.map((debt) => {
                  const totalPaid = strategy === 'snowball' 
                    ? snowballResult.schedule.reduce((sum, s) => sum + (s.debts.find(d => d.id === debt.id)?.paid || 0), 0)
                    : avalancheResult.schedule.reduce((sum, s) => sum + (s.debts.find(d => d.id === debt.id)?.paid || 0), 0);
                  const totalInterest = strategy === 'snowball'
                    ? snowballResult.schedule.reduce((sum, s) => sum + (s.debts.find(d => d.id === debt.id)?.interest || 0), 0)
                    : avalancheResult.schedule.reduce((sum, s) => sum + (s.debts.find(d => d.id === debt.id)?.interest || 0), 0);
                  
                  return (
                    <Card key={debt.id} withBorder p="md">
                      <Text fw={600} mb="xs">{debt.name}</Text>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Original Balance:</Text>
                        <Text fw={600}>${debt.balance.toLocaleString()}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Total Paid:</Text>
                        <Text fw={600}>${totalPaid.toLocaleString()}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Interest Paid:</Text>
                        <Text fw={600} c="red">${totalInterest.toLocaleString()}</Text>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="payments" pt="md">
              <Title order={4} mb="md">Monthly Payment Breakdown</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <AreaChart data={timelineData.map((_, index) => ({
                    month: index,
                    snowball: snowballResult.monthlyPayments[index] || 0,
                    avalanche: avalancheResult.monthlyPayments[index] || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      labelFormatter={(value) => `Month ${value}`}
                    />
                    <Area type="monotone" dataKey="snowball" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} name="Snowball Monthly Payment" />
                    <Area type="monotone" dataKey="avalanche" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.3} name="Avalanche Monthly Payment" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Text size="sm" c="dimmed" mt="md" ta="center">
                Payments decrease as debts are paid off. Extra payments are applied to the first active debt.
              </Text>
            </Tabs.Panel>
          </Tabs>
        </Card>
      )}
    </>
  );
};

export default DebtPayoffCalculator;

