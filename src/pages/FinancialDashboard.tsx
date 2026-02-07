import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  CreditCard,
  DollarSign,
  Home,
  Info,
  PieChart,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../utils/documentUtils';

interface SavedCalculation {
  type: string;
  name: string;
  storageKey: string;
  icon: React.ElementType;
  color: string;
  route: string;
}

const CALCULATORS: SavedCalculation[] = [
  {
    type: 'Mortgage',
    name: 'Mortgage Calculator',
    storageKey: 'mortgage-calculator-inputs',
    icon: Home,
    color: 'blue',
    route: '/finance/mortgage-calculator',
  },
  {
    type: 'Investment',
    name: 'Investment Calculator',
    storageKey: 'investment-calculator-inputs',
    icon: TrendingUp,
    color: 'teal',
    route: '/finance/investment-calculator',
  },
  {
    type: 'Retirement',
    name: 'Retirement Planner',
    storageKey: 'retirement-planner-inputs',
    icon: PiggyBank,
    color: 'orange',
    route: '/finance/retirement-planner',
  },
  {
    type: 'Debt',
    name: 'Debt Payoff',
    storageKey: 'debt-payoff-debts',
    icon: CreditCard,
    color: 'red',
    route: '/finance/debt-payoff',
  },
  {
    type: 'ROI',
    name: 'ROI Calculator',
    storageKey: 'roi-calculator-inputs',
    icon: Calculator,
    color: 'cyan',
    route: '/finance/roi-calculator',
  },
  {
    type: 'Refinance',
    name: 'Refinance Calculator',
    storageKey: 'refinance-calculator-inputs',
    icon: Home,
    color: 'green',
    route: '/finance/refinance',
  },
  {
    type: 'Loan Comparison',
    name: 'Loan Comparison',
    storageKey: 'loan-comparison-loan1',
    icon: PieChart,
    color: 'violet',
    route: '/finance/loan-comparison',
  },
  {
    type: 'Investment Tracker',
    name: 'Investment Tracker',
    storageKey: 'investment-tracker-data',
    icon: Wallet,
    color: 'indigo',
    route: '/finance/investment-tracker',
  },
];

const FinancialDashboard: React.FC = () => {
  useDocumentTitle('Financial Dashboard - Your Complete Financial Overview');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Check which calculators have saved data
  const savedCalculations = useMemo(() => {
    return CALCULATORS.map(calc => {
      const hasData = localStorage.getItem(calc.storageKey) !== null;
      let lastUpdated = null;

      if (hasData) {
        try {
          const data = localStorage.getItem(calc.storageKey);
          if (data) {
            const parsed = JSON.parse(data);
            lastUpdated = parsed.timestamp || parsed.updatedAt || null;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      return {
        ...calc,
        hasData,
        lastUpdated,
      };
    });
  }, []);

  const activeCalculations = savedCalculations.filter(c => c.hasData);
  const unusedCalculators = savedCalculations.filter(c => !c.hasData);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="md" mb="xs">
            <ThemeIcon size="xl" radius="md" variant="light" color={isDark ? 'cyan' : 'blue'}>
              <DollarSign size={28} />
            </ThemeIcon>
            <div>
              <Title order={1}>Financial Dashboard</Title>
              <Text c="dimmed">Your complete financial overview in one place</Text>
            </div>
          </Group>
        </div>

        {/* Data Storage Notice */}
        <Alert
          icon={<Info size={18} />}
          title="Your Data Stays Private"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            All calculations are saved in your browser's local storage. Your data is{' '}
            <strong>completely private</strong> and never sent to any server. However, saved
            calculations <strong>will not sync between different browsers or devices</strong>.
            Clear your browser data or use a different browser/device? Your calculations won't be
            there. Use the <strong>Share Link</strong> feature in each calculator to transfer
            calculations between devices.
          </Text>
        </Alert>

        {/* Overview Stats */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          <Card withBorder p="lg" className="calculator-entrance">
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
                Active Calculators
              </Text>
              <Text size="2rem" fw={700} c={isDark ? 'cyan' : 'blue'}>
                {activeCalculations.length}
              </Text>
              <Progress
                value={(activeCalculations.length / CALCULATORS.length) * 100}
                color={isDark ? 'cyan' : 'blue'}
                size="sm"
              />
              <Text size="xs" c="dimmed">
                of {CALCULATORS.length} tools
              </Text>
            </Stack>
          </Card>

          <Card withBorder p="lg" className="calculator-entrance" style={{ animationDelay: '0.1s' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
                Calculations Saved
              </Text>
              <Text size="2rem" fw={700} c="teal">
                {activeCalculations.length}
              </Text>
              <Group gap="xs">
                <CheckCircle size={16} color="var(--mantine-color-teal-6)" />
                <Text size="xs" c="dimmed">
                  Data persisted locally
                </Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder p="lg" className="calculator-entrance" style={{ animationDelay: '0.2s' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
                Available Tools
              </Text>
              <Text size="2rem" fw={700} c="orange">
                {CALCULATORS.length}
              </Text>
              <Text size="xs" c="dimmed">
                Free financial calculators
              </Text>
            </Stack>
          </Card>

          <Card withBorder p="lg" className="calculator-entrance" style={{ animationDelay: '0.3s' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
                New Features
              </Text>
              <Badge size="lg" variant="light" color="green">
                Enhanced ✨
              </Badge>
              <Text size="xs" c="dimmed">
                Animations, insights, export
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Active Calculations */}
        {activeCalculations.length > 0 && (
          <div>
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">Your Active Calculations</Title>
              <Badge size="lg" variant="dot" color="green">
                {activeCalculations.length} saved
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {activeCalculations.map((calc, index) => {
                const Icon = calc.icon;
                return (
                  <Card
                    key={calc.type}
                    component={Link}
                    to={calc.route}
                    withBorder
                    p="lg"
                    className="calculator-card-hover calculator-entrance"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      borderTop: `4px solid var(--mantine-color-${calc.color}-6)`,
                      animationDelay: `${0.4 + index * 0.05}s`,
                    }}
                  >
                    <Stack gap="md">
                      <Group justify="space-between">
                        <ThemeIcon size="lg" radius="md" variant="light" color={calc.color}>
                          <Icon size={24} />
                        </ThemeIcon>
                        <Badge size="sm" variant="light" color={calc.color}>
                          Saved
                        </Badge>
                      </Group>

                      <div>
                        <Text fw={600} size="lg" mb={4}>
                          {calc.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {calc.lastUpdated
                            ? `Updated ${new Date(calc.lastUpdated).toLocaleDateString()}`
                            : 'Data saved locally'}
                        </Text>
                      </div>

                      <Button
                        variant="light"
                        color={calc.color}
                        fullWidth
                        rightSection={<ArrowRight size={16} />}
                        component="div"
                      >
                        View Calculation
                      </Button>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </div>
        )}

        {/* Available Tools */}
        {unusedCalculators.length > 0 && (
          <div>
            <Title order={2} size="h3" mb="md">
              Explore More Tools
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
              {unusedCalculators.map((calc, index) => {
                const Icon = calc.icon;
                return (
                  <Card
                    key={calc.type}
                    component={Link}
                    to={calc.route}
                    withBorder
                    p="md"
                    className="calculator-entrance"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      borderLeft: `3px solid var(--mantine-color-${calc.color}-6)`,
                      animationDelay: `${0.6 + index * 0.05}s`,
                    }}
                  >
                    <Group gap="sm">
                      <ThemeIcon size="md" radius="md" variant="light" color={calc.color}>
                        <Icon size={18} />
                      </ThemeIcon>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={600}>
                          {calc.name}
                        </Text>
                      </div>
                      <ArrowRight size={14} color="var(--mantine-color-dimmed)" />
                    </Group>
                  </Card>
                );
              })}
            </SimpleGrid>
          </div>
        )}

        {/* Quick Actions */}
        <Card withBorder p="xl" className="calculator-entrance" style={{ animationDelay: '0.8s' }}>
          <Stack gap="lg">
            <Title order={3} size="h4">Quick Actions</Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Button
                component={Link}
                to="/calculator-demo"
                variant="light"
                size="md"
                leftSection={<Calculator size={18} />}
                rightSection={<ArrowRight size={16} />}
                color={isDark ? 'cyan' : 'blue'}
              >
                Try Enhancement Demo
              </Button>

              <Button
                component={Link}
                to="/finance"
                variant="light"
                size="md"
                leftSection={<TrendingUp size={18} />}
                rightSection={<ArrowRight size={16} />}
                color="teal"
              >
                Browse All Calculators
              </Button>
            </SimpleGrid>

            {activeCalculations.length > 0 && (
              <Group justify="center">
                <Button
                  variant="subtle"
                  size="xs"
                  color="red"
                  onClick={() => {
                    if (confirm('Clear all saved calculations? This cannot be undone.')) {
                      CALCULATORS.forEach(calc => {
                        localStorage.removeItem(calc.storageKey);
                      });
                      window.location.reload();
                    }
                  }}
                >
                  Clear All Saved Data
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Feature Callout */}
        <Card
          withBorder
          p="lg"
          className="calculator-entrance"
          style={{
            animationDelay: '0.9s',
            background: isDark
              ? 'linear-gradient(135deg, rgba(56, 190, 201, 0.05), rgba(59, 130, 246, 0.05))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.02), rgba(56, 190, 201, 0.02))',
          }}
        >
          <Stack gap="md">
            <Group gap="sm">
              <Badge size="lg" variant="light" color="green">
                ✨ New
              </Badge>
              <Title order={3} size="h4">Enhanced Calculator Features</Title>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
                  <TrendingUp size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Animated Results</Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" variant="light" color="orange">
                  💡
                </ThemeIcon>
                <Text size="sm" fw={500}>Smart Insights</Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" variant="light" color="teal">
                  📤
                </ThemeIcon>
                <Text size="sm" fw={500}>Export & Share</Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" variant="light" color="violet">
                  ❓
                </ThemeIcon>
                <Text size="sm" fw={500}>Input Helpers</Text>
              </Group>
            </SimpleGrid>

            <Text size="sm" c="dimmed">
              All calculators now feature smooth animations, AI-generated insights, contextual help,
              and the ability to export to PDF or share via link.
            </Text>

            <Group>
              <Button
                component={Link}
                to="/calculator-demo"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                rightSection={<ArrowRight size={16} />}
              >
                See Demo
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Get Started */}
        {activeCalculations.length === 0 && (
          <Card withBorder p="xl" ta="center">
            <Stack gap="lg" align="center">
              <ThemeIcon size={80} radius="xl" variant="light" color={isDark ? 'cyan' : 'blue'}>
                <Calculator size={40} />
              </ThemeIcon>

              <div>
                <Title order={2} mb="sm">Get Started</Title>
                <Text c="dimmed" maw={500} mx="auto">
                  Choose a calculator to begin your financial planning journey.
                  All calculations are saved automatically in your browser.
                </Text>
              </div>

              <Button
                component={Link}
                to="/finance"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                size="lg"
                rightSection={<ArrowRight size={18} />}
              >
                Browse Calculators
              </Button>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
};

export default FinancialDashboard;
