import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  BarChart3,
  Calculator,
  Clock,
  CreditCard,
  Home,
  PiggyBank,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Finance: React.FC = () => {
  const projects = [
    {
      id: 'loan-comparison',
      path: '/finance/loan-comparison',
      title: 'Loan Comparison Tool',
      description:
        'Compare different loan structures with interactive visualizations and smart recommendations',
      icon: Calculator,
      color: 'blue',
      tags: ['Finance', 'Charts', 'Calculator'],
      features: [
        'Side-by-side loan comparison',
        'Interactive payment schedules',
        'Cost breakdown analysis',
        'Smart recommendations',
        'Multiple chart types',
      ],
    },
    {
      id: 'roi-calculator',
      path: '/finance/roi-calculator',
      title: 'ROI Calculator',
      description:
        'Calculate return on investment with multiple scenarios and detailed analysis',
      icon: Target,
      color: 'green',
      tags: ['Finance', 'ROI', 'Analytics'],
      features: [
        'Simple & annualized ROI',
        'Risk-adjusted returns',
        'Timeline projections',
        'Multiple calculation methods',
        'Smart recommendations',
      ],
    },
    {
      id: 'investment-calculator',
      path: '/finance/investment-calculator',
      title: 'Investment Calculator',
      description:
        'Plan your investments with compound interest and scenario analysis',
      icon: PiggyBank,
      color: 'cyan',
      tags: ['Investment', 'Compound Interest', 'Planning'],
      features: [
        'Compound interest calculations',
        'Regular contribution planning',
        'Inflation adjustments',
        'Tax considerations',
        'Multiple scenarios',
      ],
    },
    {
      id: 'mortgage-calculator',
      path: '/finance/mortgage-calculator',
      title: 'Mortgage Calculator',
      description:
        'Calculate mortgage payments, analyze affordability, and visualize amortization schedules',
      icon: Home,
      color: 'orange',
      tags: ['Mortgage', 'Real Estate', 'Affordability'],
      features: [
        'Monthly payment calculations',
        'Affordability analysis',
        'Amortization schedules',
        'PMI and tax calculations',
        'Extra payment scenarios',
      ],
    },
    {
      id: 'retirement-planner',
      path: '/finance/retirement-planner',
      title: 'Retirement Planner',
      description:
        'Plan your retirement savings, withdrawal strategies, and analyze different scenarios',
      icon: Clock,
      color: 'violet',
      tags: ['Retirement', 'Planning', 'Savings'],
      features: [
        'Retirement savings projection',
        'Withdrawal strategy analysis',
        'Social Security integration',
        'Roth IRA calculations',
        'Scenario comparisons',
      ],
    },
    {
      id: 'investment-tracker',
      path: '/finance/investment-tracker',
      title: 'Investment Portfolio Tracker',
      description:
        'Comprehensive investment tracking with advanced analytics, portfolio insights, and performance monitoring',
      icon: BarChart3,
      color: 'indigo',
      tags: ['Portfolio', 'Analytics', 'Tracking'],
      features: [
        'Multi-platform investment tracking',
        'Advanced portfolio analytics',
        'Performance visualization',
        'Risk and diversification scoring',
        'Investment lessons & strategy',
      ],
    },
    {
      id: 'debt-payoff',
      path: '/finance/debt-payoff',
      title: 'Debt Payoff Calculator',
      description:
        'Compare debt snowball vs avalanche strategies with visual timeline and savings analysis',
      icon: CreditCard,
      color: 'red',
      tags: ['Debt', 'Strategy', 'Planning'],
      features: [
        'Snowball vs avalanche comparison',
        'Visual payoff timeline',
        'Interest savings analysis',
        'Multiple debt management',
        'Break-even calculations',
      ],
    },
    {
      id: 'refinance',
      path: '/finance/refinance',
      title: 'Refinance Calculator',
      description:
        'Analyze mortgage refinancing options with break-even analysis and savings projections',
      icon: RefreshCw,
      color: 'teal',
      tags: ['Refinance', 'Mortgage', 'Savings'],
      features: [
        'Current vs new loan comparison',
        'Break-even point calculation',
        'Interest savings analysis',
        'Closing costs consideration',
        'Visual balance comparison',
      ],
    },
  ];

  return (
    <Container size="xl" py={{ base: 'md', sm: 'lg', md: 'xl' }}>
      <Stack gap="xl" className="mobile-stack">
        {/* Header */}
        <Box ta="center">
          <Title order={1} size="h1" mb="md" className="mobile-title">
            Financial Tools
          </Title>
          <Text
            size="lg"
            c="dimmed"
            maw={600}
            mx="auto"
            className="mobile-description"
          >
            Comprehensive financial calculators designed to help with real-world
            money decisions. Each tool combines powerful calculations with
            beautiful visualizations.
          </Text>
        </Box>

        {/* Projects Grid */}
        <SimpleGrid
          cols={{ base: 1, md: 2, lg: 3 }}
          spacing="xl"
          className="finance-tools-grid"
        >
          {projects.map(project => {
            const IconComponent = project.icon;
            return (
              <Card
                key={project.id}
                padding="xl"
                radius="md"
                withBorder
                className="animate-card-glow finance-tool-card"
              >
                <Stack gap="md" className="finance-tool-stack">
                  <Group gap="md" className="finance-tool-header">
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color={project.color}
                      className="finance-tool-icon"
                    >
                      <IconComponent size={24} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Title order={3} size="h4" className="finance-tool-title">
                        {project.title}
                      </Title>
                    </Box>
                  </Group>

                  <Text
                    size="sm"
                    c="dimmed"
                    className="finance-tool-description"
                  >
                    {project.description}
                  </Text>

                  <Group gap="xs" mb="md" className="finance-tool-tags">
                    {project.tags.map(tag => (
                      <Badge
                        key={tag}
                        size="sm"
                        variant="light"
                        color={project.color}
                        className="finance-tool-tag"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Stack gap="xs" mb="md" className="finance-tool-features">
                    <Text size="sm" fw={500}>
                      Key Features:
                    </Text>
                    {project.features.map((feature, index) => (
                      <Text key={index} size="xs" c="dimmed">
                        • {feature}
                      </Text>
                    ))}
                  </Stack>

                  <Button
                    component={Link}
                    to={project.path}
                    variant="light"
                    color={project.color}
                    fullWidth
                    rightSection={<TrendingUp size={16} />}
                    className="custom-button-hover"
                  >
                    Try It Now
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default Finance;
