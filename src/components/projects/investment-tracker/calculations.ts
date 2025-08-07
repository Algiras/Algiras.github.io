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