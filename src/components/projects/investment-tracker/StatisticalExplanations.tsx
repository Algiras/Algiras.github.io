import React, { useState } from 'react';
import { 
  Card, Stack, Text, Title, Button, Collapse, Group, 
  ThemeIcon, Badge, Divider, Alert, useMantineColorScheme
} from '@mantine/core';
import { 
  ChevronDown, ChevronUp, BookOpen, Calculator, 
  TrendingUp, Shield, Target, Activity 
} from 'lucide-react';

import MathJax from '../../ui/MathJax';

interface StatisticalExplanationsProps {
  portfolioStats: any; // We'll use the actual type from calculations
}

const StatisticalExplanations: React.FC<StatisticalExplanationsProps> = ({ portfolioStats }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';





  const explanations = [
    {
      id: 'volatility',
      title: 'Portfolio Volatility (Standard Deviation)',
      icon: <Activity size={18} />,
      color: 'blue',
      value: `${(portfolioStats.volatility * 100).toFixed(2)}%`,
      formula: '\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(R_i - \\bar{R})^2} \\times \\sqrt{12}',
      explanation: `
        <strong>What it measures:</strong> The degree of variation in portfolio returns over time.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • σ (sigma) = portfolio volatility<br/>
        • R_i = return in period i<br/>
        • R̄ = average return across all periods<br/>
        • n = number of periods<br/>
        • √12 = annualization factor (for monthly data)<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>Low (< 15%):</strong> Conservative, stable returns<br/>
        • <strong>Medium (15-25%):</strong> Moderate risk, balanced approach<br/>
        • <strong>High (> 25%):</strong> Aggressive, high-risk strategy<br/><br/>
        
        <strong>Why it matters:</strong> Volatility indicates how much your portfolio value fluctuates. 
        Higher volatility means higher potential returns but also higher risk of losses.
      `,
      example: `
        If your portfolio has monthly returns of [2%, -1%, 3%, 1%], the calculation would be:<br/>
        1. Average return = (2 - 1 + 3 + 1) / 4 = 1.25%<br/>
        2. Variance = [(2-1.25)² + (-1-1.25)² + (3-1.25)² + (1-1.25)²] / 4<br/>
        3. Standard deviation = √variance × √12 (annualized)
      `
    },
    {
      id: 'sharpe',
      title: 'Sharpe Ratio',
      icon: <Target size={18} />,
      color: 'green',
      value: portfolioStats.sharpeRatio.toFixed(2),
      formula: 'S = \\frac{R_p - R_f}{\\sigma_p}',
      explanation: `
        <strong>What it measures:</strong> Risk-adjusted return - how much excess return you receive for the extra volatility you endure.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • S = Sharpe ratio<br/>
        • R_p = portfolio return<br/>
        • R_f = risk-free rate (typically 2-3% annually)<br/>
        • σ_p = portfolio standard deviation (volatility)<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>Excellent (> 1.5):</strong> Outstanding risk-adjusted performance<br/>
        • <strong>Good (1.0-1.5):</strong> Strong risk-adjusted returns<br/>
        • <strong>Fair (0.5-1.0):</strong> Acceptable but could be improved<br/>
        • <strong>Poor (< 0.5):</strong> Poor risk-adjusted performance<br/><br/>
        
        <strong>Why it matters:</strong> A higher Sharpe ratio indicates better risk-adjusted performance. 
        It helps compare investments with different risk levels on an equal basis.
      `,
      example: `
        If your portfolio returns 12% annually with 18% volatility, and risk-free rate is 2%:<br/>
        Sharpe Ratio = (12% - 2%) / 18% = 0.56<br/>
        This means you get 0.56 units of excess return for each unit of risk taken.
      `
    },
    {
      id: 'maxdrawdown',
      title: 'Maximum Drawdown',
      icon: <TrendingUp size={18} />,
      color: 'red',
      value: `${portfolioStats.maxDrawdown.maxDrawdown.toFixed(1)}%`,
      formula: 'MDD = \\frac{\\text{Peak Value} - \\text{Trough Value}}{\\text{Peak Value}} \\times 100\\%',
      explanation: `
        <strong>What it measures:</strong> The largest peak-to-trough decline in portfolio value during a specific period.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • MDD = Maximum Drawdown percentage<br/>
        • Peak Value = highest portfolio value reached<br/>
        • Trough Value = lowest portfolio value after the peak<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>Low (< 10%):</strong> Conservative, low-risk portfolio<br/>
        • <strong>Medium (10-20%):</strong> Moderate risk exposure<br/>
        • <strong>High (> 20%):</strong> Aggressive, high-risk strategy<br/><br/>
        
        <strong>Duration:</strong> Your portfolio took ${portfolioStats.maxDrawdown.duration} months to recover.<br/><br/>
        
        <strong>Why it matters:</strong> Shows the worst-case scenario you've experienced. 
        Helps assess your risk tolerance and emotional ability to handle losses.
      `,
      example: `
        If your portfolio peaked at $100,000 and then dropped to $85,000:<br/>
        Maximum Drawdown = ($100,000 - $85,000) / $100,000 = 15%<br/>
        This means you experienced a 15% decline from your peak value.
      `
    },
    {
      id: 'var',
      title: 'Value at Risk (VaR)',
      icon: <Shield size={18} />,
      color: 'orange',
      value: `${portfolioStats.valueAtRisk.toFixed(1)}%`,
      formula: 'VaR_{95\\%} = \\text{5th percentile of historical returns}',
      explanation: `
        <strong>What it measures:</strong> The potential loss in portfolio value over a specific time period at a given confidence level.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • VaR₉₅% = Value at Risk at 95% confidence<br/>
        • Uses historical simulation method<br/>
        • Ranks all historical returns from worst to best<br/>
        • Takes the 5th percentile (95% confidence means 5% chance of worse outcome)<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • There's a 5% chance your portfolio could lose more than ${portfolioStats.valueAtRisk.toFixed(1)}% in any given month<br/>
        • 95% of the time, monthly losses should be less than this amount<br/><br/>
        
        <strong>Why it matters:</strong> Helps quantify downside risk and prepare for potential losses. 
        Useful for risk management and position sizing decisions.
      `,
      example: `
        If your VaR is 8.5% monthly:<br/>
        • On a $100,000 portfolio, you have a 5% chance of losing more than $8,500 in any month<br/>
        • 95% of months should see losses smaller than $8,500 (or gains)
      `
    },
    {
      id: 'beta',
      title: 'Portfolio Beta',
      icon: <TrendingUp size={18} />,
      color: 'purple',
      value: portfolioStats.beta.toFixed(2),
      formula: '\\beta = \\rho_{p,m} \\times \\frac{\\sigma_p}{\\sigma_m}',
      explanation: `
        <strong>What it measures:</strong> How much your portfolio moves relative to the overall market.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • β = portfolio beta<br/>
        • ρ_{p,m} = correlation between portfolio and market<br/>
        • σ_p = portfolio volatility<br/>
        • σ_m = market volatility<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>β < 1:</strong> Less volatile than market (defensive)<br/>
        • <strong>β = 1:</strong> Moves with the market<br/>
        • <strong>β > 1:</strong> More volatile than market (aggressive)<br/><br/>
        
        <strong>Your beta of ${portfolioStats.beta.toFixed(2)} means:</strong><br/>
        ${portfolioStats.beta > 1 
          ? `Your portfolio is ${((portfolioStats.beta - 1) * 100).toFixed(0)}% more volatile than the market`
          : portfolioStats.beta < 1 
          ? `Your portfolio is ${((1 - portfolioStats.beta) * 100).toFixed(0)}% less volatile than the market`
          : 'Your portfolio moves in line with the market'
        }<br/><br/>
        
        <strong>Why it matters:</strong> Helps understand systematic risk and how your portfolio 
        behaves relative to market movements.
      `,
      example: `
        If market goes up 10% and your portfolio has β = 1.2:<br/>
        Expected portfolio return = 1.2 × 10% = 12%<br/>
        If market goes down 10%:<br/>
        Expected portfolio return = 1.2 × (-10%) = -12%
      `
    },
    {
      id: 'correlation',
      title: 'Market Correlation',
      icon: <Activity size={18} />,
      color: 'cyan',
      value: portfolioStats.correlation.toFixed(2),
      formula: '\\rho = \\frac{\\sum(R_p - \\bar{R_p})(R_m - \\bar{R_m})}{\\sqrt{\\sum(R_p - \\bar{R_p})^2 \\sum(R_m - \\bar{R_m})^2}}',
      explanation: `
        <strong>What it measures:</strong> The degree to which your portfolio moves in relation to the market.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • ρ (rho) = correlation coefficient<br/>
        • R_p = portfolio returns<br/>
        • R_m = market returns<br/>
        • R̄_p, R̄_m = average returns<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>+1.0:</strong> Perfect positive correlation (moves exactly with market)<br/>
        • <strong>0.0:</strong> No correlation (independent of market)<br/>
        • <strong>-1.0:</strong> Perfect negative correlation (moves opposite to market)<br/><br/>
        
        <strong>Your correlation of ${portfolioStats.correlation.toFixed(2)} means:</strong><br/>
        ${Math.abs(portfolioStats.correlation) > 0.7 
          ? 'Strong correlation - your portfolio closely follows market movements'
          : Math.abs(portfolioStats.correlation) > 0.3
          ? 'Moderate correlation - some independence from market movements'
          : 'Weak correlation - largely independent of market movements'
        }<br/><br/>
        
        <strong>Why it matters:</strong> Lower correlation can provide diversification benefits 
        and reduce overall portfolio risk.
      `,
      example: `
        Correlation of 0.65 means:<br/>
        • When market goes up, your portfolio tends to go up too (65% of the variation explained)<br/>
        • But you have some independence (35% of movement is unique to your portfolio)
      `
    },
    {
      id: 'concentration',
      title: 'Concentration Risk (HHI)',
      icon: <Target size={18} />,
      color: 'yellow',
      value: `${(portfolioStats.concentration * 100).toFixed(1)}%`,
      formula: 'HHI = \\sum_{i=1}^{n} w_i^2',
      explanation: `
        <strong>What it measures:</strong> How concentrated your portfolio is using the Herfindahl-Hirschman Index.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • HHI = Herfindahl-Hirschman Index<br/>
        • w_i = weight (percentage) of investment i<br/>
        • n = number of investments<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>Perfect diversification:</strong> ${(100 / portfolioStats.investments?.length || 1).toFixed(1)}% (equal weights)<br/>
        • <strong>Low concentration (< 20%):</strong> Well diversified<br/>
        • <strong>Medium concentration (20-40%):</strong> Moderately concentrated<br/>
        • <strong>High concentration (> 40%):</strong> Poorly diversified<br/><br/>
        
        <strong>Why it matters:</strong> Lower concentration reduces idiosyncratic risk. 
        High concentration means your portfolio's performance depends heavily on a few investments.
      `,
      example: `
        With 5 equal investments: HHI = 5 × (20%)² = 20%<br/>
        With one 60% position and four 10% positions: HHI = (60%)² + 4×(10%)² = 40%<br/>
        The second portfolio is more concentrated and riskier.
      `
    },
    {
      id: 'information',
      title: 'Information Ratio',
      icon: <Calculator size={18} />,
      color: 'indigo',
      value: portfolioStats.informationRatio.toFixed(2),
      formula: 'IR = \\frac{R_p - R_b}{\\sigma_{tracking}}',
      explanation: `
        <strong>What it measures:</strong> Risk-adjusted active return relative to a benchmark.<br/><br/>
        
        <strong>Formula breakdown:</strong><br/>
        • IR = Information Ratio<br/>
        • R_p = portfolio return<br/>
        • R_b = benchmark return (assumed 8% annually)<br/>
        • σ_{tracking} = tracking error (standard deviation of active returns)<br/><br/>
        
        <strong>Interpretation:</strong><br/>
        • <strong>Excellent (> 0.5):</strong> Strong active management<br/>
        • <strong>Good (0.25-0.5):</strong> Decent outperformance<br/>
        • <strong>Poor (< 0.25):</strong> Weak active returns<br/>
        • <strong>Negative:</strong> Underperforming benchmark<br/><br/>
        
        <strong>Why it matters:</strong> Shows if active management (stock picking, timing) 
        is adding value after adjusting for the additional risk taken.
      `,
      example: `
        If your portfolio returns 12%, benchmark returns 8%, and tracking error is 6%:<br/>
        Information Ratio = (12% - 8%) / 6% = 0.67<br/>
        This indicates good active management skill.
      `
    }
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light" size="lg">
            <BookOpen size={20} />
          </ThemeIcon>
          <Title order={3} size="h4">Mathematical Explanations</Title>
        </Group>
        <Badge variant="light" color="blue" size="lg">
          {explanations.length} Metrics Explained
        </Badge>
      </Group>

      <Alert color="blue" variant="light">
        <Text size="sm">
          <strong>📚 Educational Note:</strong> Click on any metric below to see the mathematical formula, 
          interpretation guidelines, and practical examples. These calculations follow industry-standard 
          financial mathematics used by professional portfolio managers.
        </Text>
      </Alert>

      {explanations.map((item) => (
        <Card key={item.id} withBorder p="md">
          <Button
            variant="subtle"
            fullWidth
            justify="space-between"
            leftSection={
              <Group gap="sm">
                <ThemeIcon color={item.color} variant="light" size="sm">
                  {item.icon}
                </ThemeIcon>
                <Text fw={500}>{item.title}</Text>
                <Badge color={item.color} variant="light" size="sm">
                  {item.value}
                </Badge>
              </Group>
            }
            rightSection={
              openSections[item.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            }
            onClick={() => toggleSection(item.id)}
          >
          </Button>

          <Collapse in={openSections[item.id]}>
            <Stack gap="md" mt="md">
              <Divider />
              
              {/* Mathematical Formula */}
              <Card bg={isDark ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-0)"} p="md">
                <Text fw={600} mb="sm" c="blue">📐 Mathematical Formula:</Text>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '10px', 
                  backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'white', 
                  borderRadius: '4px',
                  border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : '#e9ecef'}`
                }}>
                  <MathJax display={true}>{item.formula}</MathJax>
                </div>
              </Card>



              {/* Detailed Explanation */}
              <Card bg={isDark ? "var(--mantine-color-dark-6)" : "var(--mantine-color-blue-0)"} p="md">
                <Text fw={600} mb="sm" c="blue">📖 Detailed Explanation:</Text>
                <Text 
                  size="sm" 
                  dangerouslySetInnerHTML={{ __html: item.explanation }}
                />
              </Card>

              {/* Practical Example */}
              <Card bg={isDark ? "var(--mantine-color-dark-6)" : "var(--mantine-color-green-0)"} p="md">
                <Text fw={600} mb="sm" c="green">💡 Practical Example:</Text>
                <Text 
                  size="sm" 
                  dangerouslySetInnerHTML={{ __html: item.example }}
                />
              </Card>
            </Stack>
          </Collapse>
        </Card>
      ))}

      <Alert color="orange" variant="light">
        <Text size="sm">
          <strong>⚠️ Important Disclaimer:</strong> These calculations are based on historical data and 
          mathematical models. Past performance does not guarantee future results. Always consult with 
          a qualified financial advisor before making investment decisions.
        </Text>
      </Alert>
    </Stack>
  );
};

export default StatisticalExplanations;