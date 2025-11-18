// Financial calculation utilities for testing
// Extracted from calculator components for better testability

export interface LoanCalculationInput {
  principal: number;
  interestRate: number;
  termYears: number;
  extraPayment?: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  payoffTime: number;
  amortizationSchedule: Array<{
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export interface ROICalculationInput {
  initialInvestment: number;
  finalValue: number;
  additionalInvestments: number;
  timeframe: number;
  timeframeUnit: 'days' | 'months' | 'years';
}

export interface ROICalculationResult {
  simpleROI: number;
  annualizedROI: number;
  totalReturn: number;
  totalInvested: number;
  netProfit: number;
}

export interface InvestmentCalculationInput {
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  investmentPeriod: number;
  inflationRate: number;
  taxRate?: number;
}

export interface InvestmentCalculationResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  realValue: number;
  afterTaxValue: number;
}

export interface MortgageCalculationInput {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  homeInsurance: number;
  pmiRate: number;
  hoaFees: number;
  extraPayment?: number;
}

export interface MortgageCalculationResult {
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  loanAmount: number;
}

export interface RetirementCalculationInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  employerMatch: number;
  annualReturn: number;
  inflationRate: number;
  withdrawalRate: number;
  lifeExpectancy: number;
  taxRate?: number;
}

export interface RetirementCalculationResult {
  projectedSavings: number;
  monthlyRetirementIncome: number;
  totalContributions: number;
  totalInterest: number;
  yearsOfRetirement: number;
  replacementRatio: number;
}

/**
 * Calculate loan payment details
 */
export const calculateLoanPayment = (
  input: LoanCalculationInput
): LoanCalculationResult => {
  const { principal, interestRate, termYears, extraPayment = 0 } = input;

  if (principal <= 0 || interestRate < 0 || termYears <= 0) {
    throw new Error('Invalid input parameters');
  }

  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;

  // Calculate monthly payment using amortization formula
  // Handle zero interest rate case
  const monthlyPayment =
    monthlyRate === 0
      ? principal / totalPayments
      : (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);

  // Generate amortization schedule
  const amortizationSchedule = [];
  let remainingBalance = principal;
  let totalInterest = 0;
  let paymentNumber = 0;

  while (remainingBalance > 0.01 && paymentNumber < totalPayments * 2) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(
      monthlyPayment - interestPayment + extraPayment,
      remainingBalance
    );

    remainingBalance -= principalPayment;
    totalInterest += interestPayment;
    paymentNumber++;

    amortizationSchedule.push({
      payment: paymentNumber,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, remainingBalance),
    });
  }

  return {
    monthlyPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
    payoffTime: paymentNumber / 12,
    amortizationSchedule,
  };
};

/**
 * Calculate ROI metrics
 */
export const calculateROI = (
  input: ROICalculationInput
): ROICalculationResult => {
  const {
    initialInvestment,
    finalValue,
    additionalInvestments,
    timeframe,
    timeframeUnit,
  } = input;

  if (initialInvestment <= 0 || finalValue <= 0 || timeframe <= 0) {
    throw new Error('Invalid input parameters');
  }

  const totalInvested = initialInvestment + additionalInvestments;
  const netProfit = finalValue - totalInvested;
  const simpleROI = (netProfit / totalInvested) * 100;

  // Convert timeframe to years for annualized calculation
  let timeInYears = timeframe;
  if (timeframeUnit === 'months') timeInYears = timeframe / 12;
  if (timeframeUnit === 'days') timeInYears = timeframe / 365;

  const annualizedROI =
    (Math.pow(finalValue / totalInvested, 1 / timeInYears) - 1) * 100;

  return {
    simpleROI,
    annualizedROI,
    totalReturn: finalValue,
    totalInvested,
    netProfit,
  };
};

/**
 * Calculate investment growth with compound interest
 */
export const calculateInvestmentGrowth = (
  input: InvestmentCalculationInput
): InvestmentCalculationResult => {
  const {
    initialAmount,
    monthlyContribution,
    annualInterestRate,
    investmentPeriod,
  } = input;

  if (
    initialAmount < 0 ||
    monthlyContribution < 0 ||
    annualInterestRate < 0 ||
    investmentPeriod <= 0
  ) {
    throw new Error('Invalid input parameters');
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const totalMonths = investmentPeriod * 12;

  let futureValue = initialAmount;
  let totalContributions = initialAmount;

  // Calculate compound growth with monthly contributions
  for (let month = 1; month <= totalMonths; month++) {
    futureValue = futureValue * (1 + monthlyRate) + monthlyContribution;
    totalContributions += monthlyContribution;
  }

  const totalInterest = futureValue - totalContributions;
  const realValue =
    futureValue /
    Math.pow(1 + (input.inflationRate || 0) / 100, investmentPeriod);
  const afterTaxValue =
    futureValue - (totalInterest * (input.taxRate || 0)) / 100;

  return {
    futureValue: Math.round(futureValue),
    totalContributions: Math.round(totalContributions),
    totalInterest: Math.round(totalInterest),
    realValue: Math.round(realValue),
    afterTaxValue: Math.round(afterTaxValue),
  };
};

/**
 * Calculate mortgage payment details
 */
export const calculateMortgagePayment = (
  input: MortgageCalculationInput
): MortgageCalculationResult => {
  const {
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    propertyTax,
    homeInsurance,
    pmiRate,
    hoaFees,
  } = input;

  if (homePrice <= 0 || downPayment < 0 || loanTerm <= 0 || interestRate < 0) {
    throw new Error('Invalid input parameters');
  }

  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;

  // Calculate monthly principal and interest
  const monthlyPrincipalInterest =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  // Calculate other monthly costs
  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyPMI =
    downPayment / homePrice < 0.2 ? (loanAmount * pmiRate) / 100 / 12 : 0;

  const totalMonthlyPayment =
    monthlyPrincipalInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyPMI +
    hoaFees;

  // Calculate total interest over loan term
  const totalInterest = monthlyPrincipalInterest * totalPayments - loanAmount;

  return {
    monthlyPrincipalInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    totalMonthlyPayment,
    totalInterest,
    loanAmount,
  };
};

/**
 * Calculate retirement savings projection
 */
export const calculateRetirementSavings = (
  input: RetirementCalculationInput
): RetirementCalculationResult => {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    employerMatch,
    annualReturn,
    withdrawalRate,
    lifeExpectancy,
  } = input;

  if (
    currentAge < 0 ||
    retirementAge <= currentAge ||
    annualReturn < 0 ||
    monthlyContribution < 0
  ) {
    throw new Error('Invalid input parameters');
  }

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = annualReturn / 100 / 12;
  const totalMonths = yearsToRetirement * 12;

  let projectedSavings = currentSavings;
  let totalContributions = currentSavings;
  const totalMonthlyContribution = monthlyContribution + employerMatch;

  // Calculate growth with contributions
  for (let month = 1; month <= totalMonths; month++) {
    projectedSavings =
      projectedSavings * (1 + monthlyRate) + totalMonthlyContribution;
    totalContributions += totalMonthlyContribution;
  }

  const totalInterest = projectedSavings - totalContributions;
  const yearsOfRetirement = lifeExpectancy - retirementAge;
  const monthlyRetirementIncome =
    (projectedSavings * withdrawalRate) / 100 / 12;

  // Calculate replacement ratio (simplified)
  const preRetirementIncome = monthlyContribution * 4; // Rough estimate
  const replacementRatio =
    (monthlyRetirementIncome / preRetirementIncome) * 100;

  return {
    projectedSavings: Math.round(projectedSavings),
    monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
    totalContributions: Math.round(totalContributions),
    totalInterest: Math.round(totalInterest),
    yearsOfRetirement,
    replacementRatio: Math.round(replacementRatio),
  };
};
