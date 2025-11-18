// Investment Tracker Types
export type InvestmentType =
  | 'P2P'
  | 'Stock'
  | 'Fund'
  | 'Crypto'
  | 'RealEstate'
  | 'Alternative'
  | 'CFD'
  | 'Lending';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'BTC' | 'ETH';

export type InvestmentStatus = 'Active' | 'Sold' | 'Closed' | 'Paused';

export type PlatformStatus = 'Active' | 'Closed' | 'Avoiding';

export interface PlatformFees {
  management?: number;
  transaction?: number;
  withdrawal?: number;
}

export interface Platform {
  id: string;
  name: string;
  type: InvestmentType[];
  country: string;
  fees: PlatformFees;
  status: PlatformStatus;
  website?: string;
  notes?: string;
}

export interface Investment {
  id: string;
  type: InvestmentType;
  platform: Platform;
  assetName: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  currency: Currency;
  status: InvestmentStatus;
  notes?: string;
  expectedReturn: number;
  actualReturn: number;
  fees: number;
  dividends: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TypeSummary {
  totalInvested: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
  count: number;
}

export interface PlatformSummary extends TypeSummary {
  platform: Platform;
}

export interface PerformancePoint {
  date: string;
  totalValue: number;
  invested: number;
  return: number;
  returnPercentage: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  byType: Record<InvestmentType, TypeSummary>;
  byPlatform: Record<string, PlatformSummary>;
  byCurrency: Record<Currency, number>;
  monthlyPerformance: PerformancePoint[];
  riskScore: number;
  diversificationScore: number;
}

export interface InvestmentFilters {
  type?: InvestmentType;
  platform?: string;
  status?: InvestmentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minReturn?: number;
  maxReturn?: number;
}

// Predefined platforms based on your experience
export const PLATFORMS: Platform[] = [
  // P2P Platforms - Success Stories
  {
    id: 'finbee',
    name: 'Finbee',
    type: ['P2P'],
    country: 'LT',
    status: 'Active',
    fees: { management: 1, transaction: 0 },
  },
  {
    id: 'iuventus',
    name: 'Iuventus',
    type: ['P2P'],
    country: 'LT',
    status: 'Active',
    fees: { management: 1, transaction: 0 },
  },
  {
    id: 'finomark',
    name: 'Finomark',
    type: ['P2P'],
    country: 'LT',
    status: 'Active',
    fees: { management: 1, transaction: 0 },
  },
  {
    id: 'letsinvest',
    name: 'LetsInvest',
    type: ['P2P'],
    country: 'LV',
    status: 'Active',
    fees: { management: 1, transaction: 0 },
  },
  {
    id: 'estateguru',
    name: 'EstateGuru',
    type: ['P2P'],
    country: 'EE',
    status: 'Active',
    fees: { management: 1, transaction: 0 },
  },

  // P2P Platforms - Lessons Learned
  {
    id: 'heavyfinance',
    name: 'Heavy Finance',
    type: ['P2P'],
    country: 'LT',
    status: 'Avoiding',
    fees: { management: 2, transaction: 0 },
    notes: 'Farmer bankruptcies - avoid agricultural loans',
  },
  {
    id: 'nordstreet',
    name: 'Nordstreet',
    type: ['P2P'],
    country: 'LT',
    status: 'Closed',
    fees: { management: 1.5, transaction: 0 },
    notes: 'Closed due to illiquid loans',
  },
  {
    id: 'debitum',
    name: 'Debitum',
    type: ['P2P'],
    country: 'LT',
    status: 'Closed',
    fees: { management: 2, transaction: 0 },
    notes: 'Platform closed',
  },

  // Stock/Fund Platforms
  {
    id: 'siauliu_bankas',
    name: 'Šiaulių Bankas',
    type: ['Stock', 'Fund'],
    country: 'LT',
    status: 'Active',
    fees: { management: 0.5, transaction: 5 },
  },
  {
    id: 'swedbank',
    name: 'Swedbank',
    type: ['Stock', 'Fund'],
    country: 'LT',
    status: 'Active',
    fees: { management: 0.5, transaction: 8 },
  },
  {
    id: 'revolut',
    name: 'Revolut',
    type: ['Stock', 'Fund', 'Crypto', 'CFD'],
    country: 'UK',
    status: 'Active',
    fees: { management: 0, transaction: 1 },
  },
  {
    id: 'seb',
    name: 'SEB',
    type: ['Stock', 'Fund'],
    country: 'LT',
    status: 'Active',
    fees: { management: 0.5, transaction: 10 },
  },

  // Avoiding
  {
    id: 'etoro',
    name: 'eToro',
    type: ['Stock', 'CFD'],
    country: 'CY',
    status: 'Avoiding',
    fees: { management: 0, transaction: 0, withdrawal: 5 },
    notes: 'Day trading not suitable for long-term strategy',
  },
];

// Investment categories for better organization
export const INVESTMENT_CATEGORIES = {
  P2P: { color: 'blue', label: 'P2P Lending' },
  Stock: { color: 'green', label: 'Stocks' },
  Fund: { color: 'purple', label: 'Funds' },
  Crypto: { color: 'orange', label: 'Cryptocurrency' },
  RealEstate: { color: 'teal', label: 'Real Estate' },
  Alternative: { color: 'pink', label: 'Alternative' },
  CFD: { color: 'red', label: 'CFDs' },
  Lending: { color: 'cyan', label: 'Direct Lending' },
} as const;

// Success stories and lessons learned
export const INVESTMENT_LESSONS = {
  successes: [
    {
      name: 'INVL Real Estate',
      return: 100,
      period: '3 years',
      note: 'Real estate funds work well',
    },
    {
      name: 'SWED Tech Fund',
      return: 56,
      period: '1 year',
      note: 'Technology sector growth',
    },
    {
      name: 'Grigeo',
      return: 25,
      period: '6 months',
      note: 'Sold before scandal - good timing',
    },
    {
      name: 'Saulės Parkas',
      return: 25,
      period: '25 years expected',
      note: 'Solar energy investment',
    },
  ],
  lessons: [
    {
      name: 'Russian Funds (INVL)',
      loss: 200,
      reason: 'Ukraine conflict - geopolitical risk',
    },
    { name: 'Nordstreet', loss: 300, reason: 'Illiquid loans - platform risk' },
    {
      name: 'Heavy Finance',
      loss: 500,
      reason: 'Farmer bankruptcies - sector risk',
    },
    {
      name: 'Etoro Scalping',
      loss: 150,
      reason: 'Day trading not suitable for strategy',
    },
    {
      name: 'Forex Trading',
      loss: 100,
      reason: 'Currency speculation - avoid',
    },
  ],
  rules: [
    'Diversification is key - never put all eggs in one basket',
    'Understand the business before investing',
    'Set stop losses and know when to exit',
    'Regular portfolio review and rebalancing',
    'Target 10%+ annual return with managed risk',
    'P2P: Max 36 months, A-C ratings, 12-16% target',
    'Avoid high-risk sectors (agriculture, forex)',
    'Consider geopolitical risks in international investments',
  ],
};
