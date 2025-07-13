import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Base interface for calculator data
interface BaseCalculatorData {
  lastUpdated: string;
  version: string;
}

// Specific calculator data types
export interface LoanCalculatorData extends BaseCalculatorData {
  principal: number;
  interestRate: number;
  termYears: number;
  extraPayment: number;
}

export interface ROICalculatorData extends BaseCalculatorData {
  initialInvestment: number;
  finalValue: number;
  additionalInvestments: number;
  timeframe: number;
  timeframeUnit: 'days' | 'months' | 'years';
}

export interface InvestmentCalculatorData extends BaseCalculatorData {
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  compoundingFrequency: number;
  investmentTimeframe: number;
  inflationRate: number;
}

export interface MortgageCalculatorData extends BaseCalculatorData {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFees: number;
  extraPayment: number;
}

export interface RetirementCalculatorData extends BaseCalculatorData {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  employerMatch: number;
  annualReturn: number;
  inflationRate: number;
  retirementIncome: number;
}

export interface MarkdownDocumentData extends BaseCalculatorData {
  content: string;
  template: string;
  settings: {
    fontSize: number;
    lineHeight: number;
    includePageNumbers: boolean;
    includeHeader: boolean;
    includeFooter: boolean;
    headerText: string;
    footerText: string;
    pageSize: 'a4' | 'letter';
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
  };
}

// Calculator types
export type CalculatorType = 
  | 'loan' 
  | 'roi' 
  | 'investment' 
  | 'mortgage' 
  | 'retirement' 
  | 'markdown-document';

// Generic calculator persistence hook
export function useCalculatorPersistence<T extends BaseCalculatorData>(
  calculatorType: CalculatorType,
  initialData: Omit<T, 'lastUpdated' | 'version'>
) {
  const storageKey = `calculator-${calculatorType}`;
  
  // Default data with metadata
  const defaultData: T = {
    ...initialData,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  } as T;

  const [data, setData, clearData] = useLocalStorage(storageKey, defaultData);

  // Auto-save function with debouncing
  const saveData = useCallback(
    (newData: Partial<Omit<T, 'lastUpdated' | 'version'>>) => {
      const updatedData: T = {
        ...data,
        ...newData,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      } as T;
      
      setData(updatedData);
    },
    [data, setData]
  );

  // Load data on mount (already handled by useLocalStorage)
  const loadData = useCallback(() => {
    return data;
  }, [data]);

  // Clear all data
  const clearAllData = useCallback(() => {
    clearData();
  }, [clearData]);

  // Check if data exists
  const hasData = useCallback(() => {
    return data !== defaultData;
  }, [data, defaultData]);

  // Get last updated timestamp
  const getLastUpdated = useCallback(() => {
    return data?.lastUpdated ? new Date(data.lastUpdated) : null;
  }, [data]);

  return {
    data,
    saveData,
    loadData,
    clearAllData,
    hasData,
    getLastUpdated,
  };
}

// Specific calculator hooks
export function useLoanCalculatorPersistence() {
  return useCalculatorPersistence<LoanCalculatorData>('loan', {
    principal: 100000,
    interestRate: 5,
    termYears: 30,
    extraPayment: 0,
  });
}

export function useROICalculatorPersistence() {
  return useCalculatorPersistence<ROICalculatorData>('roi', {
    initialInvestment: 10000,
    finalValue: 12000,
    additionalInvestments: 0,
    timeframe: 1,
    timeframeUnit: 'years',
  });
}

export function useInvestmentCalculatorPersistence() {
  return useCalculatorPersistence<InvestmentCalculatorData>('investment', {
    initialAmount: 1000,
    monthlyContribution: 500,
    annualInterestRate: 7,
    compoundingFrequency: 12,
    investmentTimeframe: 30,
    inflationRate: 2.5,
  });
}

export function useMortgageCalculatorPersistence() {
  return useCalculatorPersistence<MortgageCalculatorData>('mortgage', {
    homePrice: 300000,
    downPayment: 20,
    loanTerm: 30,
    interestRate: 6.5,
    propertyTax: 1.2,
    homeInsurance: 0.5,
    pmi: 0.5,
    hoaFees: 0,
    extraPayment: 0,
  });
}

export function useRetirementCalculatorPersistence() {
  return useCalculatorPersistence<RetirementCalculatorData>('retirement', {
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 10000,
    monthlyContribution: 1000,
    employerMatch: 50,
    annualReturn: 7,
    inflationRate: 2.5,
    retirementIncome: 70,
  });
}

export function useMarkdownDocumentPersistence() {
  return useCalculatorPersistence<MarkdownDocumentData>('markdown-document', {
    content: '',
    template: 'professional',
    settings: {
      fontSize: 12,
      lineHeight: 1.6,
      includePageNumbers: true,
      includeHeader: false,
      includeFooter: false,
      headerText: '',
      footerText: '',
      pageSize: 'a4',
      marginTop: 25,
      marginRight: 25,
      marginBottom: 25,
      marginLeft: 25,
    },
  });
}

// Utility functions
export function clearAllCalculatorData() {
  const calculatorTypes: CalculatorType[] = [
    'loan',
    'roi', 
    'investment',
    'mortgage',
    'retirement',
    'markdown-document'
  ];

  calculatorTypes.forEach(type => {
    localStorage.removeItem(`calculator-${type}`);
  });
}

export function exportCalculatorData() {
  const calculatorTypes: CalculatorType[] = [
    'loan',
    'roi',
    'investment', 
    'mortgage',
    'retirement',
    'markdown-document'
  ];

  const exportData: Record<string, any> = {};

  calculatorTypes.forEach(type => {
    const data = localStorage.getItem(`calculator-${type}`);
    if (data) {
      try {
        exportData[type] = JSON.parse(data);
      } catch (error) {
        console.warn(`Error exporting ${type} calculator data:`, error);
      }
    }
  });

  return exportData;
}

export function importCalculatorData(data: Record<string, any>) {
  Object.entries(data).forEach(([type, value]) => {
    try {
      localStorage.setItem(`calculator-${type}`, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error importing ${type} calculator data:`, error);
    }
  });
} 