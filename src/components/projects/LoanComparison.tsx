import {
    Alert, Badge,
    Box, Card, Container, Group, NumberInput,
    Select, SimpleGrid, Stack, Tabs, Text, Title, useMantineColorScheme
} from '@mantine/core';
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis,
    YAxis
} from 'recharts';

interface LoanData {
  principal: number;
  interestRate: number;
  termYears: number;
  loanType: string;
  extraPayment: number;
}

interface LoanCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    cumulativeInterest: number;
    cumulativeCost: number;
  }>;
}

const LoanComparison: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [loan1, setLoan1] = useState<LoanData>({
    principal: 300000,
    interestRate: 4.5,
    termYears: 30,
    loanType: 'fixed',
    extraPayment: 0,
  });

  const [loan2, setLoan2] = useState<LoanData>({
    principal: 300000,
    interestRate: 3.8,
    termYears: 15,
    loanType: 'fixed',
    extraPayment: 0,
  });

  // Loan calculation function
  const calculateLoan = (loan: LoanData): LoanCalculation => {
    const { principal, interestRate, termYears, extraPayment } = loan;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = termYears * 12;
    
    // Calculate monthly payment (PMT formula)
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    // Generate amortization schedule
    const schedule = [];
    let balance = principal;
    let totalInterest = 0;
    let month = 0;
    
    while (balance > 0.01 && month < totalMonths) {
      month++;
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      // Add extra payment to principal
      if (extraPayment > 0) {
        principalPayment += extraPayment;
      }
      
      // Don't pay more than remaining balance
      if (principalPayment > balance) {
        principalPayment = balance;
      }
      
      balance -= principalPayment;
      totalInterest += interestPayment;
      
      schedule.push({
        month,
        payment: monthlyPayment + extraPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        cumulativeInterest: totalInterest,
        cumulativeCost: totalInterest + (principal - balance),
      });
      
      if (balance <= 0) break;
    }
    
    return {
      monthlyPayment: monthlyPayment + extraPayment,
      totalInterest,
      totalCost: principal + totalInterest,
      payoffMonths: month,
      schedule,
    };
  };

  const loan1Calc = useMemo(() => calculateLoan(loan1), [loan1]);
  const loan2Calc = useMemo(() => calculateLoan(loan2), [loan2]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    const costDifference = Math.abs(loan1Calc.totalCost - loan2Calc.totalCost);
    const paymentDifference = Math.abs(loan1Calc.monthlyPayment - loan2Calc.monthlyPayment);
    const timeDifference = Math.abs(loan1Calc.payoffMonths - loan2Calc.payoffMonths);
    
    // Cost analysis
    if (costDifference > loan1Calc.totalCost * 0.1) {
      const cheaper = loan1Calc.totalCost < loan2Calc.totalCost ? 'Loan 1' : 'Loan 2';
      recs.push({
        type: 'success',
        title: 'Significant Cost Savings',
        message: `${cheaper} will save you $${costDifference.toLocaleString()} in total costs.`,
      });
    }
    
    // Payment affordability
    if (paymentDifference > 500) {
      const lower = loan1Calc.monthlyPayment < loan2Calc.monthlyPayment ? 'Loan 1' : 'Loan 2';
      recs.push({
        type: 'info',
        title: 'Payment Difference',
        message: `${lower} has $${paymentDifference.toFixed(0)} lower monthly payments, improving cash flow.`,
      });
    }
    
    // Time to payoff
    if (timeDifference > 24) {
      const faster = loan1Calc.payoffMonths < loan2Calc.payoffMonths ? 'Loan 1' : 'Loan 2';
      const yearsDiff = Math.round(timeDifference / 12);
      recs.push({
        type: 'info',
        title: 'Payoff Timeline',
        message: `${faster} will be paid off ${yearsDiff} years earlier, providing financial freedom sooner.`,
      });
    }
    
    return recs;
  }, [loan1Calc, loan2Calc]);

  // Chart data preparation
  const chartData = useMemo(() => {
    const maxLength = Math.max(loan1Calc.schedule.length, loan2Calc.schedule.length);
    const combinedData = [];
    
    for (let i = 0; i < maxLength; i++) {
      const loan1Data = loan1Calc.schedule[i];
      const loan2Data = loan2Calc.schedule[i];
      
      combinedData.push({
        month: i + 1,
        loan1Balance: loan1Data?.balance || 0,
        loan2Balance: loan2Data?.balance || 0,
        loan1CumCost: loan1Data?.cumulativeCost || loan1Calc.totalCost,
        loan2CumCost: loan2Data?.cumulativeCost || loan2Calc.totalCost,
        loan1Interest: loan1Data?.cumulativeInterest || loan1Calc.totalInterest,
        loan2Interest: loan2Data?.cumulativeInterest || loan2Calc.totalInterest,
      });
    }
    
    return combinedData;
  }, [loan1Calc, loan2Calc]);

  const comparisonData = [
    {
      metric: 'Monthly Payment',
      loan1: loan1Calc.monthlyPayment,
      loan2: loan2Calc.monthlyPayment,
    },
    {
      metric: 'Total Interest',
      loan1: loan1Calc.totalInterest,
      loan2: loan2Calc.totalInterest,
    },
    {
      metric: 'Total Cost',
      loan1: loan1Calc.totalCost,
      loan2: loan2Calc.totalCost,
    },
  ];

  const pieData1 = [
    { name: 'Principal', value: loan1.principal, color: '#3b82f6' },
    { name: 'Interest', value: loan1Calc.totalInterest, color: '#ef4444' },
  ];

  const pieData2 = [
    { name: 'Principal', value: loan2.principal, color: '#10b981' },
    { name: 'Interest', value: loan2Calc.totalInterest, color: '#f59e0b' },
  ];

  const chartTheme = {
    background: isDark ? '#1a1b1e' : '#ffffff',
    text: isDark ? '#c1c2c5' : '#495057',
    grid: isDark ? '#373a40' : '#e9ecef',
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group gap="md">
          <Box>
            <Title order={1} size="h1">
              Loan Comparison Tool
            </Title>
            <Text size="md" c="dimmed">
              Compare two loan structures side-by-side with detailed analysis
            </Text>
          </Box>
        </Group>

        {/* Loan Input Forms */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Loan 1 */}
          <Card padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="md">
                <Badge size="lg" variant="light" color="blue">
                  Loan 1
                </Badge>
                <Title order={3} size="h4">
                  Primary Option
                </Title>
              </Group>
              
              <NumberInput
                label="Loan Amount"
                placeholder="Enter loan amount"
                value={loan1.principal}
                onChange={(value) => setLoan1({ ...loan1, principal: Number(value) || 0 })}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />
              
              <NumberInput
                label="Interest Rate (%)"
                placeholder="Enter annual interest rate"
                value={loan1.interestRate}
                onChange={(value) => setLoan1({ ...loan1, interestRate: Number(value) || 0 })}
                decimalScale={2}
                step={0.1}
              />
              
              <NumberInput
                label="Loan Term (Years)"
                placeholder="Enter loan term"
                value={loan1.termYears}
                onChange={(value) => setLoan1({ ...loan1, termYears: Number(value) || 0 })}
              />
              
              <Select
                label="Loan Type"
                value={loan1.loanType}
                onChange={(value) => setLoan1({ ...loan1, loanType: value || 'fixed' })}
                data={[
                  { value: 'fixed', label: 'Fixed Rate' },
                  { value: 'variable', label: 'Variable Rate' },
                ]}
              />
              
              <NumberInput
                label="Extra Monthly Payment"
                placeholder="Optional extra payment"
                value={loan1.extraPayment}
                onChange={(value) => setLoan1({ ...loan1, extraPayment: Number(value) || 0 })}
                leftSection={<DollarSign size={16} />}
              />
            </Stack>
          </Card>

          {/* Loan 2 */}
          <Card padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="md">
                <Badge size="lg" variant="light" color="green">
                  Loan 2
                </Badge>
                <Title order={3} size="h4">
                  Alternative Option
                </Title>
              </Group>
              
              <NumberInput
                label="Loan Amount"
                placeholder="Enter loan amount"
                value={loan2.principal}
                onChange={(value) => setLoan2({ ...loan2, principal: Number(value) || 0 })}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />
              
              <NumberInput
                label="Interest Rate (%)"
                placeholder="Enter annual interest rate"
                value={loan2.interestRate}
                onChange={(value) => setLoan2({ ...loan2, interestRate: Number(value) || 0 })}
                decimalScale={2}
                step={0.1}
              />
              
              <NumberInput
                label="Loan Term (Years)"
                placeholder="Enter loan term"
                value={loan2.termYears}
                onChange={(value) => setLoan2({ ...loan2, termYears: Number(value) || 0 })}
              />
              
              <Select
                label="Loan Type"
                value={loan2.loanType}
                onChange={(value) => setLoan2({ ...loan2, loanType: value || 'fixed' })}
                data={[
                  { value: 'fixed', label: 'Fixed Rate' },
                  { value: 'variable', label: 'Variable Rate' },
                ]}
              />
              
              <NumberInput
                label="Extra Monthly Payment"
                placeholder="Optional extra payment"
                value={loan2.extraPayment}
                onChange={(value) => setLoan2({ ...loan2, extraPayment: Number(value) || 0 })}
                leftSection={<DollarSign size={16} />}
              />
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Quick Comparison */}
        <Card padding="xl" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">
            Quick Comparison
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Box ta="center">
              <Text size="sm" c="dimmed" mb="xs">
                Monthly Payment
              </Text>
              <Group justify="center" gap="md">
                <Stack gap={0} ta="center">
                  <Badge size="lg" variant="light" color="blue">
                    ${loan1Calc.monthlyPayment.toLocaleString()}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Loan 1
                  </Text>
                </Stack>
                <Text size="lg" c="dimmed">
                  vs
                </Text>
                <Stack gap={0} ta="center">
                  <Badge size="lg" variant="light" color="green">
                    ${loan2Calc.monthlyPayment.toLocaleString()}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Loan 2
                  </Text>
                </Stack>
              </Group>
            </Box>

            <Box ta="center">
              <Text size="sm" c="dimmed" mb="xs">
                Total Interest
              </Text>
              <Group justify="center" gap="md">
                <Stack gap={0} ta="center">
                  <Badge size="lg" variant="light" color="blue">
                    ${loan1Calc.totalInterest.toLocaleString()}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Loan 1
                  </Text>
                </Stack>
                <Text size="lg" c="dimmed">
                  vs
                </Text>
                <Stack gap={0} ta="center">
                  <Badge size="lg" variant="light" color="green">
                    ${loan2Calc.totalInterest.toLocaleString()}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Loan 2
                  </Text>
                </Stack>
              </Group>
            </Box>

            <Box ta="center">
              <Text size="sm" c="dimmed" mb="xs">
                Payoff Time
              </Text>
              <Group justify="center" gap="md">
                <Stack gap={0} ta="center">
                  <Badge size="lg" variant="light" color="blue">
                    {Math.round(loan1Calc.payoffMonths / 12)} years
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Loan 1
                  </Text>
                </Stack>
                <Text size="lg" c="dimmed">
                  vs
                </Text>
                <Stack gap={0} ta="center">
                  <Badge size="lg" variant="light" color="green">
                    {Math.round(loan2Calc.payoffMonths / 12)} years
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Loan 2
                  </Text>
                </Stack>
              </Group>
            </Box>
          </SimpleGrid>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card padding="xl" radius="md" withBorder>
            <Title order={2} size="h3" mb="md">
              Smart Recommendations
            </Title>
            <Stack gap="md">
              {recommendations.map((rec, index) => (
                <Alert
                  key={index}
                  icon={rec.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  title={rec.title}
                  color={rec.type === 'success' ? 'green' : 'blue'}
                  variant="light"
                >
                  {rec.message}
                </Alert>
              ))}
            </Stack>
          </Card>
        )}

        {/* Charts */}
        <Card padding="xl" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">
            Visual Analysis
          </Title>
          
          <Tabs defaultValue="comparison" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="comparison">Comparison Chart</Tabs.Tab>
              <Tabs.Tab value="balance">Balance Over Time</Tabs.Tab>
              <Tabs.Tab value="cost">Cost Breakdown</Tabs.Tab>
              <Tabs.Tab value="cumulative">Cumulative Cost</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="comparison" pt="md">
              <Box h={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis dataKey="metric" stroke={chartTheme.text} />
                    <YAxis stroke={chartTheme.text} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.background,
                        border: `1px solid ${chartTheme.grid}`,
                        borderRadius: '8px',
                        color: chartTheme.text,
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="loan1" fill="#3b82f6" name="Loan 1" />
                    <Bar dataKey="loan2" fill="#10b981" name="Loan 2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="balance" pt="md">
              <Box h={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis dataKey="month" stroke={chartTheme.text} />
                    <YAxis stroke={chartTheme.text} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.background,
                        border: `1px solid ${chartTheme.grid}`,
                        borderRadius: '8px',
                        color: chartTheme.text,
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Line
                      type="monotone"
                      dataKey="loan1Balance"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Loan 1 Balance"
                    />
                    <Line
                      type="monotone"
                      dataKey="loan2Balance"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Loan 2 Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="cost" pt="md">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                <Box>
                  <Title order={4} size="h5" mb="md" ta="center">
                    Loan 1 Cost Breakdown
                  </Title>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                                                 <Pie
                           data={pieData1}
                           cx="50%"
                           cy="50%"
                           outerRadius={80}
                           dataKey="value"
                           label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                         >
                          {pieData1.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box>
                  <Title order={4} size="h5" mb="md" ta="center">
                    Loan 2 Cost Breakdown
                  </Title>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                                                 <Pie
                           data={pieData2}
                           cx="50%"
                           cy="50%"
                           outerRadius={80}
                           dataKey="value"
                           label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                         >
                          {pieData2.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="cumulative" pt="md">
              <Box h={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis dataKey="month" stroke={chartTheme.text} />
                    <YAxis stroke={chartTheme.text} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.background,
                        border: `1px solid ${chartTheme.grid}`,
                        borderRadius: '8px',
                        color: chartTheme.text,
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="loan1CumCost"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Loan 1 Cumulative Cost"
                    />
                    <Area
                      type="monotone"
                      dataKey="loan2CumCost"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Loan 2 Cumulative Cost"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
};

export default LoanComparison; 