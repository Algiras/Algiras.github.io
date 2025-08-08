import { 
  Investment, 
  PortfolioSummary, 
  TypeSummary, 
  PlatformSummary, 
  PerformancePoint,
  InvestmentType,
  Currency
} from './types';

/**
 * Calculate portfolio summary from investments
 */
export const calculatePortfolioSummary = (investments: Investment[]): PortfolioSummary => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity + inv.fees, 0);
  const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturn = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Calculate by type
  const byType: Record<InvestmentType, TypeSummary> = {} as Record<InvestmentType, TypeSummary>;
  const typeGroups = groupBy(investments, 'type');
  
  Object.entries(typeGroups).forEach(([type, invs]) => {
    const typeInvested = invs.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity + inv.fees, 0);
    const typeValue = invs.reduce((sum, inv) => sum + inv.currentValue, 0);
    const typeReturn = typeValue - typeInvested;
    
    byType[type as InvestmentType] = {
      totalInvested: typeInvested,
      currentValue: typeValue,
      return: typeReturn,
      returnPercentage: typeInvested > 0 ? (typeReturn / typeInvested) * 100 : 0,
      count: invs.length,
    };
  });

  // Calculate by platform
  const byPlatform: Record<string, PlatformSummary> = {};
  const platformGroups = groupBy(investments, inv => inv.platform.id);
  
  Object.entries(platformGroups).forEach(([platformId, invs]) => {
    const platformInvested = invs.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity + inv.fees, 0);
    const platformValue = invs.reduce((sum, inv) => sum + inv.currentValue, 0);
    const platformReturn = platformValue - platformInvested;
    
    byPlatform[platformId] = {
      platform: invs[0].platform,
      totalInvested: platformInvested,
      currentValue: platformValue,
      return: platformReturn,
      returnPercentage: platformInvested > 0 ? (platformReturn / platformInvested) * 100 : 0,
      count: invs.length,
    };
  });

  // Calculate by currency
  const byCurrency: Record<Currency, number> = {} as Record<Currency, number>;
  investments.forEach(inv => {
    if (!byCurrency[inv.currency]) {
      byCurrency[inv.currency] = 0;
    }
    byCurrency[inv.currency] += inv.currentValue;
  });

  // Generate monthly performance (simplified - would be more complex with real data)
  const monthlyPerformance = generateMonthlyPerformance(investments);

  // Calculate risk and diversification scores
  const riskScore = calculateRiskScore(investments);
  const diversificationScore = calculateDiversificationScore(byType, byPlatform);

  return {
    totalInvested,
    currentValue,
    totalReturn,
    returnPercentage,
    byType,
    byPlatform,
    byCurrency,
    monthlyPerformance,
    riskScore,
    diversificationScore,
  };
};

/**
 * Calculate investment return percentage
 */
export const calculateReturn = (investment: Investment): number => {
  const totalCost = investment.purchasePrice * investment.quantity + investment.fees;
  const totalValue = investment.currentValue + investment.dividends;
  return totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
};

/**
 * Calculate annualized return
 */
export const calculateAnnualizedReturn = (investment: Investment): number => {
  const totalReturn = calculateReturn(investment);
  const daysDiff = Math.abs(new Date().getTime() - investment.purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
  const years = daysDiff / 365.25;
  
  if (years < 0.1) return totalReturn; // Less than a month, return simple return
  
  return Math.pow(1 + totalReturn / 100, 1 / years) * 100 - 100;
};

/**
 * Group array by key or function
 */
export const groupBy = <T, K extends keyof T>(
  array: T[], 
  key: K | ((item: T) => string)
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Generate monthly performance data (simplified version)
 */
const generateMonthlyPerformance = (investments: Investment[]): PerformancePoint[] => {
  const months = 12; // Last 12 months
  const performance: PerformancePoint[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Simplified calculation - in real app, you'd track historical values
    const monthInvestments = investments.filter(inv => 
      new Date(inv.purchaseDate) <= date
    );
    
    const invested = monthInvestments.reduce((sum, inv) => 
      sum + inv.purchasePrice * inv.quantity + inv.fees, 0
    );
    
    const value = monthInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const returnAmount = value - invested;
    const returnPercentage = invested > 0 ? (returnAmount / invested) * 100 : 0;
    
    performance.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      totalValue: value,
      invested,
      return: returnAmount,
      returnPercentage,
    });
  }
  
  return performance;
};

/**
 * Calculate risk score (0-100, higher = riskier)
 */
const calculateRiskScore = (investments: Investment[]): number => {
  if (investments.length === 0) return 0;
  
  let riskScore = 0;
  const weights = {
    'P2P': 60,
    'Stock': 50,
    'Fund': 30,
    'Crypto': 90,
    'RealEstate': 40,
    'Alternative': 70,
    'CFD': 95,
    'Lending': 55,
  };
  
  investments.forEach(inv => {
    const typeWeight = weights[inv.type as keyof typeof weights] || 50;
    const platformWeight = inv.platform.status === 'Avoiding' ? 20 : 0;
    riskScore += (typeWeight + platformWeight) * (inv.currentValue / 100);
  });
  
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  return totalValue > 0 ? Math.min(100, riskScore / totalValue) : 0;
};

/**
 * Calculate diversification score (0-100, higher = better diversified)
 */
const calculateDiversificationScore = (
  byType: Record<InvestmentType, TypeSummary>,
  byPlatform: Record<string, PlatformSummary>
): number => {
  const typeCount = Object.keys(byType).length;
  const platformCount = Object.keys(byPlatform).length;
  
  // Calculate concentration (lower is better for diversification)
  const typeValues = Object.values(byType).map(t => t.currentValue);
  const platformValues = Object.values(byPlatform).map(p => p.currentValue);
  
  const totalValue = typeValues.reduce((sum, val) => sum + val, 0);
  
  if (totalValue === 0) return 0;
  
  // Calculate Herfindahl-Hirschman Index for concentration
  const typeHHI = typeValues.reduce((sum, val) => {
    const share = val / totalValue;
    return sum + share * share;
  }, 0);
  
  const platformHHI = platformValues.reduce((sum, val) => {
    const share = val / totalValue;
    return sum + share * share;
  }, 0);
  
  // Convert to diversification score (inverse of concentration)
  const typeDiversification = (1 - typeHHI) * 100;
  const platformDiversification = (1 - platformHHI) * 100;
  
  // Bonus for having multiple types and platforms
  const typeBonus = Math.min(20, typeCount * 4);
  const platformBonus = Math.min(20, platformCount * 2);
  
  return Math.min(100, (typeDiversification + platformDiversification) / 2 + typeBonus + platformBonus);
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency: Currency = 'EUR'): string => {
  const symbols = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    BTC: '₿',
    ETH: 'Ξ',
  };
  
  if (Math.abs(value) >= 1000000) {
    return `${symbols[currency as keyof typeof symbols]}${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${symbols[currency as keyof typeof symbols]}${(value / 1000).toFixed(1)}K`;
  } else {
    return `${symbols[currency as keyof typeof symbols]}${value.toFixed(2)}`;
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Generate sample data for demo
 */
export const generateSampleInvestments = (): Investment[] => {
  const now = new Date();
  const platforms = [
    { id: 'finbee', name: 'Finbee' },
    { id: 'swedbank', name: 'Swedbank' },
    { id: 'revolut', name: 'Revolut' },
  ];
  
  return [
    {
      id: '1',
      type: 'P2P',
      platform: platforms[0] as any,
      assetName: 'Business Loan Portfolio',
      purchaseDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      purchasePrice: 100,
      currentValue: 1150,
      quantity: 10,
      currency: 'EUR',
      status: 'Active',
      expectedReturn: 15,
      actualReturn: 15,
      fees: 10,
      dividends: 50,
      tags: ['P2P', 'Business'],
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: '2',
      type: 'Fund',
      platform: platforms[1] as any,
      assetName: 'SWED Technology Fund',
      purchaseDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      purchasePrice: 50,
      currentValue: 2340,
      quantity: 30,
      currency: 'EUR',
      status: 'Active',
      expectedReturn: 12,
      actualReturn: 56,
      fees: 15,
      dividends: 0,
      tags: ['Fund', 'Technology'],
      createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: '3',
      type: 'Stock',
      platform: platforms[2] as any,
      assetName: 'Apple Inc.',
      purchaseDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      purchasePrice: 150,
      currentValue: 780,
      quantity: 5,
      currency: 'USD',
      status: 'Active',
      expectedReturn: 10,
      actualReturn: 4,
      fees: 5,
      dividends: 15,
      tags: ['Stock', 'Technology', 'Blue Chip'],
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
  ];
};

/**
 * Advanced Statistical Analysis Functions
 */

// Calculate portfolio volatility (standard deviation of returns)
export const calculateVolatility = (performanceData: PerformancePoint[]): number => {
  if (performanceData.length < 2) return 0;
  
  const returns = performanceData.map((point, index) => {
    if (index === 0) return 0;
    const prevValue = performanceData[index - 1].totalValue;
    return prevValue > 0 ? (point.totalValue - prevValue) / prevValue : 0;
  }).slice(1); // Remove first element (always 0)
  
  if (returns.length === 0) return 0;
  
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * Math.sqrt(12); // Annualized volatility
};

// Calculate Sharpe Ratio (risk-adjusted return)
export const calculateSharpeRatio = (
  portfolioReturn: number, 
  volatility: number, 
  riskFreeRate: number = 0.02 // 2% default risk-free rate
): number => {
  if (volatility === 0) return 0;
  return (portfolioReturn / 100 - riskFreeRate) / volatility;
};

// Calculate maximum drawdown
export const calculateMaxDrawdown = (performanceData: PerformancePoint[]): { maxDrawdown: number; duration: number } => {
  if (performanceData.length < 2) return { maxDrawdown: 0, duration: 0 };
  
  let peak = performanceData[0].totalValue;
  let maxDrawdown = 0;
  let drawdownDuration = 0;
  let currentDrawdownDuration = 0;
  let inDrawdown = false;
  
  performanceData.forEach(point => {
    if (point.totalValue > peak) {
      peak = point.totalValue;
      if (inDrawdown) {
        drawdownDuration = Math.max(drawdownDuration, currentDrawdownDuration);
        currentDrawdownDuration = 0;
        inDrawdown = false;
      }
    } else {
      const drawdown = (peak - point.totalValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      currentDrawdownDuration++;
      inDrawdown = true;
    }
  });
  
  if (inDrawdown) {
    drawdownDuration = Math.max(drawdownDuration, currentDrawdownDuration);
  }
  
  return { maxDrawdown: maxDrawdown * 100, duration: drawdownDuration };
};

// Calculate Value at Risk (VaR) using historical simulation
export const calculateVaR = (performanceData: PerformancePoint[], confidenceLevel: number = 0.05): number => {
  if (performanceData.length < 2) return 0;
  
  const returns = performanceData.map((point, index) => {
    if (index === 0) return 0;
    const prevValue = performanceData[index - 1].totalValue;
    return prevValue > 0 ? (point.totalValue - prevValue) / prevValue : 0;
  }).slice(1);
  
  if (returns.length === 0) return 0;
  
  const sortedReturns = returns.sort((a, b) => a - b);
  const index = Math.floor(confidenceLevel * sortedReturns.length);
  
  return Math.abs(sortedReturns[index] * 100); // Return as positive percentage
};

// Calculate portfolio correlation with market (using a simple proxy)
export const calculatePortfolioCorrelation = (performanceData: PerformancePoint[]): number => {
  if (performanceData.length < 2) return 0;
  
  // Simulate market returns (in real app, this would be actual market data)
  const marketReturns = performanceData.map((_, index) => {
    return Math.sin(index * 0.1) * 0.02 + 0.005; // Simulated market pattern
  });
  
  const portfolioReturns = performanceData.map((point, index) => {
    if (index === 0) return 0;
    const prevValue = performanceData[index - 1].totalValue;
    return prevValue > 0 ? (point.totalValue - prevValue) / prevValue : 0;
  }).slice(1);
  
  if (portfolioReturns.length === 0) return 0;
  
  const n = Math.min(portfolioReturns.length, marketReturns.length);
  const portfolioSlice = portfolioReturns.slice(0, n);
  const marketSlice = marketReturns.slice(0, n);
  
  const portfolioMean = portfolioSlice.reduce((sum, ret) => sum + ret, 0) / n;
  const marketMean = marketSlice.reduce((sum, ret) => sum + ret, 0) / n;
  
  let numerator = 0;
  let portfolioSumSquares = 0;
  let marketSumSquares = 0;
  
  for (let i = 0; i < n; i++) {
    const portfolioDiff = portfolioSlice[i] - portfolioMean;
    const marketDiff = marketSlice[i] - marketMean;
    
    numerator += portfolioDiff * marketDiff;
    portfolioSumSquares += portfolioDiff * portfolioDiff;
    marketSumSquares += marketDiff * marketDiff;
  }
  
  const denominator = Math.sqrt(portfolioSumSquares * marketSumSquares);
  return denominator === 0 ? 0 : numerator / denominator;
};

// Calculate portfolio beta (systematic risk)
export const calculateBeta = (performanceData: PerformancePoint[]): number => {
  if (performanceData.length < 2) return 1;
  
  const correlation = calculatePortfolioCorrelation(performanceData);
  const portfolioVolatility = calculateVolatility(performanceData);
  const marketVolatility = 0.15; // Assumed market volatility (15%)
  
  return correlation * (portfolioVolatility / marketVolatility);
};

// Calculate information ratio (active return vs tracking error)
export const calculateInformationRatio = (performanceData: PerformancePoint[], benchmarkReturn: number = 0.08): number => {
  if (performanceData.length < 2) return 0;
  
  const returns = performanceData.map((point, index) => {
    if (index === 0) return 0;
    const prevValue = performanceData[index - 1].totalValue;
    return prevValue > 0 ? (point.totalValue - prevValue) / prevValue : 0;
  }).slice(1);
  
  if (returns.length === 0) return 0;
  
  const portfolioReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const activeReturn = portfolioReturn - benchmarkReturn / 12; // Monthly benchmark
  
  const trackingError = Math.sqrt(
    returns.reduce((sum, ret) => sum + Math.pow(ret - benchmarkReturn / 12, 2), 0) / returns.length
  );
  
  return trackingError === 0 ? 0 : activeReturn / trackingError;
};

// Calculate portfolio concentration (Herfindahl-Hirschman Index)
export const calculateConcentration = (investments: Investment[]): number => {
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  if (totalValue === 0) return 0;
  
  const weights = investments.map(inv => inv.currentValue / totalValue);
  const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
  
  return hhi;
};

// Calculate diversification ratio
export const calculateDiversificationRatio = (investments: Investment[]): number => {
  const concentration = calculateConcentration(investments);
  const numberOfInvestments = investments.length;
  
  if (numberOfInvestments === 0) return 0;
  
  // Perfect diversification would have HHI = 1/n
  const perfectDiversification = 1 / numberOfInvestments;
  
  // Diversification ratio: how close we are to perfect diversification
  return concentration === 0 ? 1 : perfectDiversification / concentration;
};

// Calculate portfolio statistics summary
export interface PortfolioStatistics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: { maxDrawdown: number; duration: number };
  valueAtRisk: number;
  beta: number;
  correlation: number;
  informationRatio: number;
  concentration: number;
  diversificationRatio: number;
  totalReturn: number;
  annualizedReturn: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
}

export const calculatePortfolioStatistics = (
  investments: Investment[], 
  performanceData: PerformancePoint[]
): PortfolioStatistics => {
  const portfolio = calculatePortfolioSummary(investments);
  const volatility = calculateVolatility(performanceData);
  
  // Calculate win/loss statistics
  const returns = performanceData.map((point, index) => {
    if (index === 0) return 0;
    const prevValue = performanceData[index - 1].totalValue;
    return prevValue > 0 ? (point.totalValue - prevValue) / prevValue : 0;
  }).slice(1);
  
  const wins = returns.filter(ret => ret > 0);
  const losses = returns.filter(ret => ret < 0);
  
  const winRate = returns.length > 0 ? (wins.length / returns.length) * 100 : 0;
  const averageWin = wins.length > 0 ? wins.reduce((sum, win) => sum + win, 0) / wins.length * 100 : 0;
  const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, loss) => sum + loss, 0) / losses.length) * 100 : 0;
  const profitFactor = averageLoss > 0 ? (averageWin * wins.length) / (averageLoss * losses.length) : 0;
  
  // Annualized return calculation
  const monthsOfData = performanceData.length;
  const annualizedReturn = monthsOfData > 0 ? 
    (Math.pow(1 + portfolio.returnPercentage / 100, 12 / monthsOfData) - 1) * 100 : 0;
  
  return {
    volatility,
    sharpeRatio: calculateSharpeRatio(portfolio.returnPercentage, volatility),
    maxDrawdown: calculateMaxDrawdown(performanceData),
    valueAtRisk: calculateVaR(performanceData),
    beta: calculateBeta(performanceData),
    correlation: calculatePortfolioCorrelation(performanceData),
    informationRatio: calculateInformationRatio(performanceData),
    concentration: calculateConcentration(investments),
    diversificationRatio: calculateDiversificationRatio(investments),
    totalReturn: portfolio.returnPercentage,
    annualizedReturn,
    winRate,
    averageWin,
    averageLoss,
    profitFactor
  };
};