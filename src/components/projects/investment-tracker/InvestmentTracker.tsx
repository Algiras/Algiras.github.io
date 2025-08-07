import {
  Badge, Box, Button, Card, Container, Grid, Group, Progress,
  SimpleGrid, Stack, Tabs, Text, ThemeIcon, Title, useMantineColorScheme
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import {
  ArrowUpRight, ArrowDownRight, 
  PieChart, BarChart3, Shield, DollarSign,
  Plus, Edit, Eye, Trash2
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import InvestmentForm from './InvestmentForm';
import ConfigPanel from './ConfigPanel';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
         ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { notifications } from '@mantine/notifications';
import { PLATFORMS, Platform } from './types';

import { 
  Investment, 
  PortfolioSummary, 
  InvestmentType,
  INVESTMENT_CATEGORIES
} from './types';
import { 
  calculatePortfolioSummary, 
  formatCurrency, 
  formatPercentage,
  generateSampleInvestments
} from './calculations';

const InvestmentTracker: React.FC = () => {
  const [investments, setInvestments] = useLocalStorage<Investment[]>({
    key: 'investment-tracker-data',
    defaultValue: generateSampleInvestments(),
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [formOpened, setFormOpened] = useState(false);

  // Configurable platforms store (seed from defaults)
  const [platforms, setPlatforms] = useLocalStorage<Platform[]>({ key: 'config-platforms', defaultValue: PLATFORMS });

  const portfolio = useMemo(() => calculatePortfolioSummary(investments), [investments]);

  const handleAddInvestment = () => {
    setSelectedInvestment(null);
    setFormMode('add');
    setFormOpened(true);
  };

  const handleViewInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormMode('view');
    setFormOpened(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormMode('edit');
    setFormOpened(true);
  };

  const handleSaveInvestment = (investmentData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (formMode === 'add') {
      const newInvestment: Investment = {
        ...investmentData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setInvestments(prev => [...prev, newInvestment]);
    } else if (formMode === 'edit' && selectedInvestment) {
      setInvestments(prev => prev.map(inv => 
        inv.id === selectedInvestment.id 
          ? { ...investmentData, id: inv.id, createdAt: inv.createdAt, updatedAt: new Date() }
          : inv
      ));
    }
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  const handleCloseForm = () => {
    setFormOpened(false);
    setSelectedInvestment(null);
  };

  // Export/Import handlers
  const handleExportInvestments = () => {
    try {
      const investmentPayload = investments.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : inv.createdAt,
        updatedAt: inv.updatedAt instanceof Date ? inv.updatedAt.toISOString() : inv.updatedAt,
        purchaseDate: inv.purchaseDate instanceof Date ? inv.purchaseDate.toISOString() : inv.purchaseDate,
      }));
      
      const payload = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        investments: investmentPayload,
        platforms: platforms
      };
      
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `investment-portfolio-${today}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notifications.show({ 
        title: 'Exported', 
        message: `Exported ${investments.length} investments and ${platforms.length} platforms`, 
        color: 'green' 
      });
    } catch {
      notifications.show({ title: 'Export failed', message: 'Could not export portfolio data', color: 'red' });
    }
  };

  const handleImportInvestments = (data: any) => {
    try {
      let investmentsData: any[] = [];
      let platformsData: Platform[] = [];
      
      // Handle both old format (array of investments) and new format (object with investments + platforms)
      if (Array.isArray(data)) {
        // Legacy format: just investments
        investmentsData = data;
        platformsData = []; // Keep existing platforms
      } else if (data && typeof data === 'object') {
        // New format: object with investments and platforms
        investmentsData = data.investments || [];
        platformsData = data.platforms || [];
      } else {
        throw new Error('Invalid file format');
      }

      // Normalize investments
      const normalizedInvestments = investmentsData.map((raw: any) => {
        let platform: Platform;
        
        if (typeof raw.platform === 'string') {
          // Try to find in imported platforms first, then existing platforms
          platform = [...platformsData, ...platforms].find(p => p.id === raw.platform) as Platform;
          if (!platform) {
            throw new Error(`Platform "${raw.platform}" not found`);
          }
        } else {
          platform = raw.platform;
        }
        
        return {
          ...raw,
          platform,
          purchaseDate: raw.purchaseDate ? new Date(raw.purchaseDate) : new Date(),
          createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
          updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
        } as Investment;
      });

      const confirmMessage = platformsData.length > 0 
        ? `Import will replace current data with ${normalizedInvestments.length} investments and ${platformsData.length} platforms. Continue?`
        : `Import will replace current investments with ${normalizedInvestments.length} investments. Continue?`;
      
      const replace = window.confirm(confirmMessage);
      if (!replace) return;

      // Update investments
      setInvestments(normalizedInvestments);
      
      // Update platforms if provided
      if (platformsData.length > 0) {
        setPlatforms(platformsData);
      }

      const successMessage = platformsData.length > 0
        ? `Imported ${normalizedInvestments.length} investments and ${platformsData.length} platforms`
        : `Imported ${normalizedInvestments.length} investments`;
      
      notifications.show({ 
        title: 'Imported', 
        message: successMessage, 
        color: 'green' 
      });
    } catch (e: any) {
      notifications.show({ 
        title: 'Import failed', 
        message: e?.message || 'Invalid file format', 
        color: 'red' 
      });
    }
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={1} size="h2" mb="sm">
            Investment Portfolio Tracker
          </Title>
          <Text c="dimmed">
            Track your investments across platforms with comprehensive analytics and insights.
          </Text>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'dashboard')}>
          <Tabs.List>
            <Tabs.Tab value="dashboard" leftSection={<BarChart3 size={16} />}>
              Dashboard
            </Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<Shield size={16} />}>
              Configuration
            </Tabs.Tab>
            {/* Investments tab removed - now integrated into Dashboard */}
            {/* Analytics tab removed per request */}
            {/* Lessons removed per request */}
          </Tabs.List>

      {/* Dashboard Tab */}
          <Tabs.Panel value="dashboard">
            <DashboardView 
              portfolio={portfolio} 
              investments={investments}
              onAddInvestment={handleAddInvestment}
              onViewInvestment={handleViewInvestment}
              onEditInvestment={handleEditInvestment}
              onDeleteInvestment={handleDeleteInvestment}
              onExportInvestments={handleExportInvestments}
              onImportInvestments={handleImportInvestments}
            />
          </Tabs.Panel>

          {/* Investments tab removed - now integrated into Dashboard */}

          {/* Analytics panel removed */}

          {/* Lessons tab removed */}

          {/* Config Tab */}
          <Tabs.Panel value="config">
            <ConfigPanel
              platforms={platforms}
              onChangePlatforms={setPlatforms}
              usedPlatformIds={investments.map(i => i.platform.id)}
            />
          </Tabs.Panel>
        </Tabs>

        {/* Investment Form Modal */}
        <InvestmentForm
          investment={selectedInvestment}
          opened={formOpened}
          onClose={handleCloseForm}
          onSave={handleSaveInvestment}
          mode={formMode}
          platforms={platforms}
        />
      </Stack>
    </Container>
  );
};

// Dashboard View Component
const DashboardView: React.FC<{ 
  portfolio: PortfolioSummary; 
  investments: Investment[];
  onAddInvestment: () => void;
  onViewInvestment: (investment: Investment) => void;
  onEditInvestment: (investment: Investment) => void;
  onDeleteInvestment: (id: string) => void;
  onNavigateToAnalytics?: () => void;
  onExportInvestments?: () => void;
  onImportInvestments?: (data: any) => void;
}> = ({ 
  portfolio, 
  investments,
  onAddInvestment,
  onViewInvestment,
  onEditInvestment,
  onDeleteInvestment,
  onNavigateToAnalytics,
  onExportInvestments,
  onImportInvestments
}) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];
  const [timeframe, setTimeframe] = React.useState<'1M' | '3M' | '1Y' | 'ALL'>('1Y');
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { colorScheme } = useMantineColorScheme();
  
  // Theme-aware chart styling
  const chartTheme = {
    grid: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: colorScheme === 'dark' ? '#ffffff' : '#000000',
    axis: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    background: 'transparent'
  };

  // Prepare data for charts
  const typeData = Object.entries(portfolio.byType).map(([type, data]) => ({
    name: INVESTMENT_CATEGORIES[type as InvestmentType]?.label || type,
    value: data.currentValue,
    return: data.returnPercentage,
    color: INVESTMENT_CATEGORIES[type as InvestmentType]?.color || 'blue',
  }));

  const platformData = Object.entries(portfolio.byPlatform).map(([, data]) => ({
    name: data.platform.name,
    value: data.currentValue,
    return: data.returnPercentage,
    invested: data.totalInvested,
  }));

  const performanceData = React.useMemo(() => {
    if (timeframe === 'ALL') return portfolio.monthlyPerformance;
    const months = timeframe === '1M' ? 1 : timeframe === '3M' ? 3 : 12;
    return portfolio.monthlyPerformance.slice(-months);
  }, [portfolio.monthlyPerformance, timeframe]);

  return (
    <Stack gap="xl" mt="md">
      {/* Hidden file input for import */}
      <input 
        ref={fileRef} 
        type="file" 
        accept="application/json" 
        style={{ display: 'none' }} 
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (!file || !onImportInvestments) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(String(reader.result));
              onImportInvestments(data);
            } catch {
              notifications.show({ title: 'Import failed', message: 'Invalid JSON', color: 'red' });
            }
          };
          reader.readAsText(file);
          e.currentTarget.value = '';
        }} 
      />

      <Group justify="space-between">
        <Title order={2} size="h2">Portfolio Overview</Title>
        <Group gap="xs">
          {onExportInvestments && (
            <Button size="xs" variant="light" onClick={onExportInvestments}>Export JSON</Button>
          )}
          {onImportInvestments && (
            <Button size="xs" variant="light" onClick={() => fileRef.current?.click()}>Import JSON</Button>
          )}
          {onNavigateToAnalytics && (
            <Button size="xs" variant="gradient" gradient={{ from: 'corporate', to: 'accent' }} onClick={onNavigateToAnalytics}>
              Open Analytics
            </Button>
          )}
        </Group>
      </Group>
      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <Card withBorder p="md" className="glass-effect">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Total Portfolio Value
              </Text>
              <Text size="xl" fw={700}>
                {formatCurrency(portfolio.currentValue)}
              </Text>
            </div>
            <ThemeIcon color="blue" variant="light" size="lg">
              <DollarSign size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="md" className="glass-effect">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Total Return
              </Text>
              <Text size="xl" fw={700} c={portfolio.totalReturn >= 0 ? 'green' : 'red'}>
                {formatCurrency(portfolio.totalReturn)}
              </Text>
              <Text size="sm" c={portfolio.returnPercentage >= 0 ? 'green' : 'red'}>
                {formatPercentage(portfolio.returnPercentage)}
              </Text>
            </div>
            <ThemeIcon 
              color={portfolio.totalReturn >= 0 ? 'green' : 'red'} 
              variant="light" 
              size="lg"
            >
              {portfolio.totalReturn >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="md" className="glass-effect">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Diversification Score
              </Text>
              <Group align="baseline" gap="xs">
                <Text size="xl" fw={700}>
                  {portfolio.diversificationScore.toFixed(0)}
                </Text>
                <Text size="sm" c="dimmed">/100</Text>
              </Group>
              <Text size="xs" c="dimmed" mt={2}>
                {portfolio.diversificationScore >= 80 ? 'Excellent diversification' : 
                 portfolio.diversificationScore >= 60 ? 'Good diversification' : 
                 portfolio.diversificationScore >= 40 ? 'Fair diversification' : 'Needs more diversification'}
              </Text>
              <Progress value={portfolio.diversificationScore} color="cyan" size="sm" mt="xs" />
            </div>
            <ThemeIcon color="cyan" variant="light" size="lg">
              <PieChart size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="md" className="glass-effect">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Risk Level
              </Text>
              <Group align="baseline" gap="xs">
                <Text size="xl" fw={700}>
                  {portfolio.riskScore.toFixed(0)}
                </Text>
                <Text size="sm" c="dimmed">/100</Text>
              </Group>
              <Text size="xs" c="dimmed" mt={2}>
                {portfolio.riskScore >= 80 ? 'Very high risk portfolio' : 
                 portfolio.riskScore >= 60 ? 'High risk portfolio' : 
                 portfolio.riskScore >= 40 ? 'Medium risk portfolio' : 
                 portfolio.riskScore >= 20 ? 'Low risk portfolio' : 'Very low risk portfolio'}
              </Text>
              <Progress 
                value={portfolio.riskScore} 
                color={portfolio.riskScore > 70 ? 'red' : portfolio.riskScore > 40 ? 'orange' : 'green'} 
                size="sm" 
                mt="xs" 
              />
            </div>
            <ThemeIcon 
              color={portfolio.riskScore > 70 ? 'red' : portfolio.riskScore > 40 ? 'orange' : 'green'} 
              variant="light" 
              size="lg"
            >
              <Shield size={20} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder p="md" h={400} className="glass-effect">
            <Group justify="space-between" mb="md">
              <Title order={3} size="h4" className="animate-gradient-text">Performance Over Time</Title>
              <Group gap="xs">
                <Button size="xs" variant={timeframe === '1M' ? 'filled' : 'light'} onClick={() => setTimeframe('1M')}>1M</Button>
                <Button size="xs" variant={timeframe === '3M' ? 'filled' : 'light'} onClick={() => setTimeframe('3M')}>3M</Button>
                <Button size="xs" variant={timeframe === '1Y' ? 'filled' : 'light'} onClick={() => setTimeframe('1Y')}>1Y</Button>
                <Button size="xs" variant={timeframe === 'ALL' ? 'filled' : 'light'} onClick={() => setTimeframe('ALL')}>ALL</Button>
              </Group>
            </Group>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: chartTheme.text, fontSize: 11 }}
                  axisLine={{ stroke: chartTheme.axis }}
                  tickLine={{ stroke: chartTheme.axis }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
                  }}
                />
                <YAxis 
                  tick={{ fill: chartTheme.text, fontSize: 11 }}
                  axisLine={{ stroke: chartTheme.axis }}
                  tickLine={{ stroke: chartTheme.axis }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip 
                  formatter={(value: any, name: string) => {
                    const dataPoint = performanceData.find(d => d.totalValue === value);
                    const profit = dataPoint ? dataPoint.totalValue - dataPoint.invested : 0;
                    return [
                      formatCurrency(value as number), 
                      name === 'totalValue' ? `Portfolio Value ${dataPoint ? `(${profit >= 0 ? '+' : ''}${formatCurrency(profit)})` : ''}` : name
                    ];
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric',
                      day: 'numeric'
                    });
                  }}
                  contentStyle={{
                    backgroundColor: colorScheme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${chartTheme.grid}`,
                    borderRadius: '8px',
                    color: chartTheme.text,
                    boxShadow: colorScheme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: chartTheme.text, paddingTop: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalValue" 
                  stroke={COLORS[0]} 
                  strokeWidth={3}
                  name="Portfolio Value"
                  dot={{ fill: COLORS[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: COLORS[0], strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="invested" 
                  stroke={COLORS[1]} 
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  name="Total Invested"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder p="md" h={400} className="glass-effect">
            <Group justify="space-between" mb="md">
              <Title order={3} size="h4" className="animate-gradient-text">Allocation by Type</Title>
            </Group>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => 
                    percent > 0.05 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''
                  }
                  labelLine={false}
                  fontSize={11}
                >
                  {typeData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>

                {/* Center text showing total */}
                <text 
                  x="50%" 
                  y="48%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    fill: chartTheme.text 
                  }}
                >
                  Total
                </text>
                <text 
                  x="50%" 
                  y="52%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  style={{ 
                    fontSize: '12px', 
                    fill: chartTheme.axis 
                  }}
                >
                  {formatCurrency(typeData.reduce((sum, item) => sum + item.value, 0))}
                </text>
              </RechartsPieChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Platform Performance */}
      <Card withBorder p="md" className="glass-effect">
        <Group justify="space-between" mb="md">
          <Title order={3} size="h4" className="animate-gradient-text">Platform Performance</Title>
        </Group>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <rect id="backgroundRect" width="100%" height="100%" fill="transparent" />
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: chartTheme.text, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.axis }}
              tickLine={{ stroke: chartTheme.axis }}
            />
            <YAxis 
              tick={{ fill: chartTheme.text, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.axis }}
              tickLine={{ stroke: chartTheme.axis }}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <RechartsTooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? 
                  (name === 'return' ? formatPercentage(value) : formatCurrency(value)) : value,
                name === 'return' ? 'Return %' : name
              ]}
              contentStyle={{
                backgroundColor: colorScheme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${chartTheme.grid}`,
                borderRadius: '8px',
                color: chartTheme.text,
                boxShadow: colorScheme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ color: chartTheme.text, paddingTop: '10px' }}
            />
            <Bar dataKey="value" fill={COLORS[0]} name="Current Value" />
            <Bar dataKey="invested" fill={COLORS[1]} name="Invested" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* All Investments */}
      <Card withBorder p="md" className="glass-effect">
        <Group justify="space-between" mb="md">
          <Title order={3} size="h4" className="animate-gradient-text">
            All Investments ({investments.length})
          </Title>
          <Button size="sm" variant="gradient" gradient={{ from: 'corporate', to: 'accent' }} leftSection={<Plus size={16} />} onClick={onAddInvestment}>
            Add New
          </Button>
        </Group>
        
        {investments.length === 0 ? (
          <Group justify="center" p="xl">
            <Stack align="center" gap="sm">
              <Text c="dimmed">No investments yet</Text>
              <Text size="sm" c="dimmed">Add your first investment to get started</Text>
            </Stack>
          </Group>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
            {investments.map((investment) => (
              <Card key={investment.id} withBorder p="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Badge color={INVESTMENT_CATEGORIES[investment.type]?.color || 'blue'} variant="light">
                      {investment.type}
                    </Badge>
                    <Group gap="xs">
                      <Button 
                        size="xs" 
                        variant="light" 
                        leftSection={<Eye size={12} />}
                        onClick={() => onViewInvestment(investment)}
                      >
                        View
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light" 
                        leftSection={<Edit size={12} />}
                        onClick={() => onEditInvestment(investment)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light" 
                        color="red"
                        leftSection={<Trash2 size={12} />}
                        onClick={() => onDeleteInvestment(investment.id)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Group>
                  
                  <div>
                    <Text fw={500} size="lg">{investment.assetName}</Text>
                    <Text size="sm" c="dimmed">{investment.platform.name}</Text>
                  </div>
                  
                  <Group justify="space-between">
                    <div>
                      <Text size="xs" c="dimmed">Current Value</Text>
                      <Text fw={500}>{formatCurrency(investment.currentValue)}</Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text size="xs" c="dimmed">Return</Text>
                      <Text fw={500} c={investment.actualReturn >= 0 ? 'green' : 'red'}>
                        {formatPercentage(investment.actualReturn)}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Card>
    </Stack>
  );
};

// InvestmentsView component removed - functionality integrated into Dashboard

// Analytics view removed per request

// Lessons types removed per request

// Lessons removed per request

export default InvestmentTracker;