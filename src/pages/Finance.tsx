import {
    Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, ThemeIcon, Title
} from '@mantine/core';
import { Calculator, Clock, Home, PiggyBank, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import InvestmentCalculator from '../components/projects/InvestmentCalculator';
import LoanComparison from '../components/projects/LoanComparison';
import MortgageCalculator from '../components/projects/MortgageCalculator';
import RetirementPlanner from '../components/projects/RetirementPlanner';
import ROICalculator from '../components/projects/ROICalculator';

const Finance: React.FC = () => {
  const [activeProject, setActiveProject] = React.useState<string | null>(null);

  const projects = [
    {
      id: 'loan-comparison',
      title: 'Loan Comparison Tool',
      description: 'Compare different loan structures with interactive visualizations and smart recommendations',
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
      title: 'ROI Calculator',
      description: 'Calculate return on investment with multiple scenarios and detailed analysis',
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
      title: 'Investment Calculator',
      description: 'Plan your investments with compound interest and scenario analysis',
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
      title: 'Mortgage Calculator',
      description: 'Calculate mortgage payments, analyze affordability, and visualize amortization schedules',
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
      title: 'Retirement Planner',
      description: 'Plan your retirement savings, withdrawal strategies, and analyze different scenarios',
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
  ];

  if (activeProject === 'loan-comparison') {
    return <LoanComparison onBack={() => setActiveProject(null)} />;
  }

  if (activeProject === 'roi-calculator') {
    return (
      <Container size="xl" py="xl">
        <Button onClick={() => setActiveProject(null)} mb="md" variant="light">
          ← Back to Finance
        </Button>
        <ROICalculator />
      </Container>
    );
  }

  if (activeProject === 'investment-calculator') {
    return (
      <Container size="xl" py="xl">
        <Button onClick={() => setActiveProject(null)} mb="md" variant="light">
          ← Back to Finance
        </Button>
        <InvestmentCalculator />
      </Container>
    );
  }

  if (activeProject === 'mortgage-calculator') {
    return (
      <Container size="xl" py="xl">
        <Button onClick={() => setActiveProject(null)} mb="md" variant="light">
          ← Back to Finance
        </Button>
        <MortgageCalculator />
      </Container>
    );
  }

  if (activeProject === 'retirement-planner') {
    return (
      <Container size="xl" py="xl">
        <Button onClick={() => setActiveProject(null)} mb="md" variant="light">
          ← Back to Finance
        </Button>
        <RetirementPlanner />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box ta="center">
          <Title order={1} size="h1" mb="md">
            Financial Tools
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Comprehensive financial calculators designed to help with real-world money decisions.
            Each tool combines powerful calculations with beautiful visualizations.
          </Text>
        </Box>

        {/* Projects Grid */}
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
          {projects.map((project) => {
            const IconComponent = project.icon;
            return (
              <Card
                key={project.id}
                padding="xl"
                radius="md"
                withBorder
                className="animate-card-glow"
                style={{ height: '100%' }}
              >
                <Stack gap="md" h="100%">
                  <Group gap="md">
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color={project.color}
                    >
                      <IconComponent size={24} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Title order={3} size="h4">
                        {project.title}
                      </Title>
                    </Box>
                  </Group>

                  <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                    {project.description}
                  </Text>

                  <Group gap="xs" mb="md">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        size="sm"
                        variant="light"
                        color={project.color}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Stack gap="xs" mb="md">
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
                    onClick={() => setActiveProject(project.id)}
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