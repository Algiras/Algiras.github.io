import { Badge, Card, Grid, Group, NumberInput, Select, Stack, Tabs, Text, Title, useMantineColorScheme } from '@mantine/core';
import { Calculator, DollarSign, Percent, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ROIInput {
  initialInvestment: number;
  finalValue: number;
  additionalInvestments: number;
  timeframe: number;
  timeframeUnit: 'days' | 'months' | 'years';
  calculationType: 'simple' | 'annualized' | 'compound';
}

/*
interface _ROIResult {
  simpleROI: number;
  annualizedROI: number;
  totalReturn: number;
  totalInvested: number;
  netProfit: number;
  breakEvenPoint: number;
  riskAdjustedReturn: number;
}
*/

const ROICalculator: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [inputs, setInputs] = useState<ROIInput>({
    initialInvestment: 10000,
    finalValue: 15000,
    additionalInvestments: 2000,
    timeframe: 2,
    timeframeUnit: 'years',
    calculationType: 'simple'
  });

  const results = useMemo(() => {
    const { initialInvestment, finalValue, additionalInvestments, timeframe, timeframeUnit } = inputs;
    
    if (initialInvestment <= 0 || finalValue <= 0 || timeframe <= 0) {
      return null;
    }

    const totalInvested = initialInvestment + additionalInvestments;
    const netProfit = finalValue - totalInvested;
    const simpleROI = (netProfit / totalInvested) * 100;
    
    // Convert timeframe to years for annualized calculation
    let timeInYears = timeframe;
    if (timeframeUnit === 'months') timeInYears = timeframe / 12;
    if (timeframeUnit === 'days') timeInYears = timeframe / 365;
    
    const annualizedROI = ((Math.pow(finalValue / totalInvested, 1 / timeInYears) - 1) * 100);
    const breakEvenPoint = totalInvested;
    const riskAdjustedReturn = simpleROI * 0.85; // Simple risk adjustment

    return {
      simpleROI,
      annualizedROI,
      totalReturn: finalValue,
      totalInvested,
      netProfit,
      breakEvenPoint,
      riskAdjustedReturn
    };
  }, [inputs]);

  const chartData = useMemo(() => {
    if (!results) return [];
    
    const { totalReturn, netProfit } = results;
    return [
      { name: 'Initial Investment', value: inputs.initialInvestment, color: '#8884d8' },
      { name: 'Additional Investments', value: inputs.additionalInvestments, color: '#82ca9d' },
      { name: 'Net Profit', value: Math.max(0, netProfit), color: '#ffc658' },
      { name: 'Total Return', value: totalReturn, color: '#ff7300' }
    ];
  }, [results, inputs]);

  const timeSeriesData = useMemo(() => {
    if (!results) return [];
    
    const periods = 12;
    const data = [];
    const monthlyGrowth = Math.pow(results.totalReturn / results.totalInvested, 1 / periods);
    
    for (let i = 0; i <= periods; i++) {
      const value = results.totalInvested * Math.pow(monthlyGrowth, i);
      data.push({
        period: i,
        value: Math.round(value),
        invested: results.totalInvested,
        profit: Math.round(value - results.totalInvested)
      });
    }
    
    return data;
  }, [results]);

  const recommendations = useMemo(() => {
    if (!results) return [];
    
    const recs = [];
    
    if (results.simpleROI > 20) {
      recs.push({ type: 'success', text: 'Excellent ROI! This investment is performing very well.' });
    } else if (results.simpleROI > 10) {
      recs.push({ type: 'good', text: 'Good ROI. This investment is above average market returns.' });
    } else if (results.simpleROI > 0) {
      recs.push({ type: 'warning', text: 'Moderate ROI. Consider if this meets your investment goals.' });
    } else {
      recs.push({ type: 'danger', text: 'Negative ROI. This investment is losing money.' });
    }
    
    if (results.annualizedROI > 15) {
      recs.push({ type: 'success', text: 'Strong annualized returns suggest consistent performance.' });
    }
    
    if (results.netProfit > results.totalInvested * 0.5) {
      recs.push({ type: 'success', text: 'Profit exceeds 50% of investment - consider taking some profits.' });
    }
    
    return recs;
  }, [results]);

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
            <TrendingUp size={24} />
            ROI Calculator
          </Title>
          <Badge variant="light" color="blue">Return on Investment</Badge>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <NumberInput
                label="Initial Investment ($)"
                value={inputs.initialInvestment}
                onChange={(value) => setInputs(prev => ({ ...prev, initialInvestment: Number(value) || 0 }))}
                min={0}
                step={100}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <NumberInput
                label="Final Value ($)"
                value={inputs.finalValue}
                onChange={(value) => setInputs(prev => ({ ...prev, finalValue: Number(value) || 0 }))}
                min={0}
                step={100}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <NumberInput
                label="Additional Investments ($)"
                value={inputs.additionalInvestments}
                onChange={(value) => setInputs(prev => ({ ...prev, additionalInvestments: Number(value) || 0 }))}
                min={0}
                step={100}
                thousandSeparator=","
                leftSection={<DollarSign size={16} />}
              />

              <Group grow>
                <NumberInput
                  label="Timeframe"
                  value={inputs.timeframe}
                  onChange={(value) => setInputs(prev => ({ ...prev, timeframe: Number(value) || 0 }))}
                  min={1}
                />
                <Select
                  label="Unit"
                  value={inputs.timeframeUnit}
                  onChange={(value) => setInputs(prev => ({ ...prev, timeframeUnit: value as any }))}
                  data={[
                    { value: 'days', label: 'Days' },
                    { value: 'months', label: 'Months' },
                    { value: 'years', label: 'Years' }
                  ]}
                />
              </Group>

              <Select
                label="Calculation Type"
                value={inputs.calculationType}
                onChange={(value) => setInputs(prev => ({ ...prev, calculationType: value as any }))}
                data={[
                  { value: 'simple', label: 'Simple ROI' },
                  { value: 'annualized', label: 'Annualized ROI' },
                  { value: 'compound', label: 'Compound ROI' }
                ]}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            {results && (
              <Stack gap="md">
                <Card withBorder p="md" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Simple ROI</Text>
                    <Text size="xl" fw={700} c={results.simpleROI >= 0 ? 'green' : 'red'}>
                      {results.simpleROI.toFixed(2)}%
                    </Text>
                  </Group>
                </Card>

                <Card withBorder p="md" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Annualized ROI</Text>
                    <Text size="xl" fw={700} c={results.annualizedROI >= 0 ? 'green' : 'red'}>
                      {results.annualizedROI.toFixed(2)}%
                    </Text>
                  </Group>
                </Card>

                <Card withBorder p="md" className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Net Profit</Text>
                    <Text size="lg" fw={600} c={results.netProfit >= 0 ? 'green' : 'red'}>
                      ${results.netProfit.toLocaleString()}
                    </Text>
                  </Group>
                </Card>

                <Card withBorder p="md" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Total Return</Text>
                    <Text size="lg" fw={600}>
                      ${results.totalReturn.toLocaleString()}
                    </Text>
                  </Group>
                </Card>
              </Stack>
            )}
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
              <Tabs.Tab value="breakdown" leftSection={<BarChart style={{ width: 16, height: 16 }} />}>
                Breakdown
              </Tabs.Tab>
              <Tabs.Tab value="timeline" leftSection={<TrendingUp size={16} />}>
                Timeline
              </Tabs.Tab>
              <Tabs.Tab value="recommendations" leftSection={<Percent size={16} />}>
                Analysis
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Title order={4} mb="md">ROI Comparison</Title>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Title order={4} mb="md">Investment Breakdown</Title>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
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
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="breakdown" pt="md">
              <Title order={4} mb="md">Detailed Breakdown</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text>Initial Investment:</Text>
                      <Text fw={600}>${inputs.initialInvestment.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Additional Investments:</Text>
                      <Text fw={600}>${inputs.additionalInvestments.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Total Invested:</Text>
                      <Text fw={600}>${results.totalInvested.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Final Value:</Text>
                      <Text fw={600}>${results.totalReturn.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Net Profit/Loss:</Text>
                      <Text fw={600} c={results.netProfit >= 0 ? 'green' : 'red'}>
                        ${results.netProfit.toLocaleString()}
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text>Simple ROI:</Text>
                      <Text fw={600} c={results.simpleROI >= 0 ? 'green' : 'red'}>
                        {results.simpleROI.toFixed(2)}%
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Annualized ROI:</Text>
                      <Text fw={600} c={results.annualizedROI >= 0 ? 'green' : 'red'}>
                        {results.annualizedROI.toFixed(2)}%
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Break-even Point:</Text>
                      <Text fw={600}>${results.breakEvenPoint.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Risk-adjusted Return:</Text>
                      <Text fw={600} c={results.riskAdjustedReturn >= 0 ? 'green' : 'red'}>
                        {results.riskAdjustedReturn.toFixed(2)}%
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="timeline" pt="md">
              <Title order={4} mb="md">Investment Growth Timeline</Title>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="period" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="value" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="invested" stackId="2" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="recommendations" pt="md">
              <Title order={4} mb="md">Investment Analysis</Title>
              <Stack gap="md">
                {recommendations.map((rec, index) => (
                  <Card key={index} withBorder p="md" className={`
                    ${rec.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}
                    ${rec.type === 'good' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}
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

export default ROICalculator; 