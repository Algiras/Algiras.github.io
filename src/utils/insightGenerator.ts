/**
 * Insight Generator
 * Rules-based insight generation for financial calculators
 */

import type { Insight } from '../components/calculator';
import { formatCurrency, formatPercentage } from './calculatorExport';

// ============================================================================
// MORTGAGE CALCULATOR INSIGHTS
// ============================================================================

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  propertyTax: number;
  homeInsurance: number;
  pmiRate: number;
  hoaFees: number;
  extraPayment: number;
}

export interface MortgageResults {
  loanAmount: number;
  monthlyPrincipalInterest: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  monthlyPMI: number;
  timeSaved?: string;
  interestSaved?: number;
}

export function generateMortgageInsights(
  inputs: MortgageInputs,
  results: MortgageResults
): Insight[] {
  const insights: Insight[] = [];

  // 1. PMI Warning (down payment < 20%)
  if (inputs.downPaymentPercent < 20) {
    const annualPMI = results.monthlyPMI * 12;
    insights.push({
      type: 'warning',
      title: 'PMI Required',
      description: `Your down payment is ${inputs.downPaymentPercent}%. You'll pay ${formatCurrency(results.monthlyPMI)}/month (${formatCurrency(annualPMI)}/year) in PMI until you reach 20% equity.`,
    });
  }

  // 2. Extra Payment Benefits
  if (inputs.extraPayment > 0 && results.interestSaved && results.timeSaved) {
    insights.push({
      type: 'success',
      title: 'Extra Payments Accelerate Payoff',
      description: `By paying ${formatCurrency(inputs.extraPayment)} extra monthly, you'll save ${formatCurrency(results.interestSaved)} in interest and pay off your mortgage ${results.timeSaved} early!`,
    });
  } else if (inputs.extraPayment === 0) {
    // Suggest extra payments
    const testExtraPayment = 200;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    const newPayment = results.monthlyPrincipalInterest + testExtraPayment;

    // Calculate new payoff time
    const newNumPayments = Math.log(newPayment / (newPayment - results.loanAmount * monthlyRate)) / Math.log(1 + monthlyRate);
    const monthsSaved = Math.floor(numPayments - newNumPayments);
    const yearsSaved = Math.floor(monthsSaved / 12);
    const monthsRemainder = monthsSaved % 12;

    if (monthsSaved > 12) {
      const timeSavedStr = yearsSaved > 0
        ? `${yearsSaved} year${yearsSaved > 1 ? 's' : ''} ${monthsRemainder} month${monthsRemainder > 1 ? 's' : ''}`
        : `${monthsRemainder} month${monthsRemainder > 1 ? 's' : ''}`;

      insights.push({
        type: 'tip',
        title: 'Consider Extra Payments',
        description: `Paying just ${formatCurrency(testExtraPayment)} extra monthly could save you ${timeSavedStr} and thousands in interest!`,
      });
    }
  }

  // 3. Interest Rate Comparison
  const avgRate = 6.8; // Current average (update periodically)
  if (inputs.interestRate > avgRate + 0.5) {
    insights.push({
      type: 'warning',
      title: 'Higher Than Average Rate',
      description: `Your rate of ${formatPercentage(inputs.interestRate)} is above the current average of ${formatPercentage(avgRate)}. Consider shopping for better rates or improving your credit score.`,
    });
  } else if (inputs.interestRate < avgRate - 0.5) {
    insights.push({
      type: 'success',
      title: 'Excellent Interest Rate',
      description: `Your rate of ${formatPercentage(inputs.interestRate)} is below the current average of ${formatPercentage(avgRate)}. Great job securing a competitive rate!`,
    });
  }

  // 4. Interest vs Principal
  const interestPercent = (results.totalInterest / results.totalCost) * 100;
  if (interestPercent > 50) {
    insights.push({
      type: 'info',
      title: 'Interest Represents Over Half of Total Cost',
      description: `You'll pay ${formatCurrency(results.totalInterest)} in interest (${interestPercent.toFixed(0)}% of total cost). Consider a 15-year term to reduce interest significantly.`,
    });
  }

  // 5. 15-year vs 30-year suggestion
  if (inputs.loanTerm === 30) {
    // Estimate 15-year payment
    const rate15 = inputs.interestRate - 0.5; // 15-year rates typically 0.5% lower
    const monthlyRate15 = rate15 / 100 / 12;
    const numPayments15 = 15 * 12;
    const payment15 = (results.loanAmount * monthlyRate15 * Math.pow(1 + monthlyRate15, numPayments15)) / (Math.pow(1 + monthlyRate15, numPayments15) - 1);
    const totalInterest15 = payment15 * numPayments15 - results.loanAmount;
    const savings = results.totalInterest - totalInterest15;

    if (savings > 50000) {
      insights.push({
        type: 'tip',
        title: '15-Year Mortgage Could Save Significantly',
        description: `A 15-year mortgage could save you approximately ${formatCurrency(savings)} in interest, though monthly payments would increase to around ${formatCurrency(payment15)}.`,
      });
    }
  }

  // 6. Debt-to-Income warning (if monthly income provided)
  // This would require monthly income input, placeholder for now
  // insights.push({
  //   type: 'warning',
  //   title: 'High Debt-to-Income Ratio',
  //   description: 'Lenders prefer DTI under 36%. Your current ratio may affect loan approval.',
  // });

  return insights;
}

// ============================================================================
// INVESTMENT CALCULATOR INSIGHTS
// ============================================================================

export interface InvestmentInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  inflationRate?: number;
}

export interface InvestmentResults {
  finalValue: number;
  totalContributions: number;
  totalInterest: number;
  inflationAdjustedValue?: number;
}

export function generateInvestmentInsights(
  inputs: InvestmentInputs,
  results: InvestmentResults
): Insight[] {
  const insights: Insight[] = [];

  // 1. Power of compound interest
  const returnMultiple = results.finalValue / results.totalContributions;
  if (returnMultiple > 2) {
    insights.push({
      type: 'success',
      title: 'Compound Interest Working For You',
      description: `Your ${formatCurrency(results.totalContributions)} in contributions will grow to ${formatCurrency(results.finalValue)} - that's ${returnMultiple.toFixed(1)}x your investment!`,
    });
  }

  // 2. Return rate comparison
  const sp500Avg = 10;
  if (inputs.annualReturn > sp500Avg + 2) {
    insights.push({
      type: 'warning',
      title: 'Aggressive Return Assumption',
      description: `Your ${formatPercentage(inputs.annualReturn)} expected return is above the S&P 500 historical average of ${formatPercentage(sp500Avg)}. Consider using more conservative estimates.`,
    });
  } else if (inputs.annualReturn < 5) {
    insights.push({
      type: 'info',
      title: 'Conservative Return Rate',
      description: `Your ${formatPercentage(inputs.annualReturn)} return is quite conservative. Historical stock market returns average around ${formatPercentage(sp500Avg)}%.`,
    });
  }

  // 3. Inflation impact
  if (results.inflationAdjustedValue && inputs.inflationRate) {
    const realReturn = results.inflationAdjustedValue;
    const inflationLoss = results.finalValue - realReturn;
    const lossPercent = (inflationLoss / results.finalValue) * 100;

    if (lossPercent > 20) {
      insights.push({
        type: 'warning',
        title: 'Significant Inflation Impact',
        description: `Inflation at ${formatPercentage(inputs.inflationRate)} will erode ${formatPercentage(lossPercent)} of your gains. Real purchasing power: ${formatCurrency(realReturn)}.`,
      });
    }
  }

  // 4. Time in market
  if (inputs.years < 5) {
    insights.push({
      type: 'warning',
      title: 'Short Investment Horizon',
      description: 'Investing for less than 5 years increases volatility risk. Consider keeping short-term funds in safer assets like high-yield savings.',
    });
  } else if (inputs.years >= 30) {
    insights.push({
      type: 'success',
      title: 'Long-Term Investment Advantage',
      description: 'Your 30+ year timeline allows compound interest to work its magic and smooths out market volatility!',
    });
  }

  // 5. Monthly contribution impact
  if (inputs.monthlyContribution === 0 && inputs.initialInvestment > 0) {
    // Calculate what $500/month would do
    const testContribution = 500;
    const monthlyRate = inputs.annualReturn / 100 / 12;
    const months = inputs.years * 12;
    const futureValueContributions = testContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    insights.push({
      type: 'tip',
      title: 'Regular Contributions Multiply Growth',
      description: `Adding just ${formatCurrency(testContribution)}/month could grow to an additional ${formatCurrency(futureValueContributions)} over ${inputs.years} years through dollar-cost averaging!`,
    });
  }

  // 6. Goal milestone
  const goalMilestones = [100000, 500000, 1000000];
  const nextMilestone = goalMilestones.find(m => m > results.finalValue);
  if (nextMilestone) {
    const yearsToMilestone = inputs.years * (nextMilestone / results.finalValue);
    const additionalYears = yearsToMilestone - inputs.years;

    if (additionalYears < inputs.years) {
      insights.push({
        type: 'info',
        title: `Path to ${formatCurrency(nextMilestone, 0)}`,
        description: `You're on track to reach ${formatCurrency(nextMilestone, 0)} in approximately ${Math.ceil(yearsToMilestone)} years (just ${Math.ceil(additionalYears)} more years)!`,
      });
    }
  }

  return insights;
}

// ============================================================================
// DEBT PAYOFF CALCULATOR INSIGHTS
// ============================================================================

export interface DebtPayoffInputs {
  debts: Array<{
    name: string;
    balance: number;
    interestRate: number;
    minPayment: number;
  }>;
  extraPayment: number;
}

export interface DebtPayoffResults {
  snowball: {
    timeToPayoff: number; // months
    totalInterest: number;
    totalPaid: number;
  };
  avalanche: {
    timeToPayoff: number; // months
    totalInterest: number;
    totalPaid: number;
  };
}

export function generateDebtPayoffInsights(
  inputs: DebtPayoffInputs,
  results: DebtPayoffResults
): Insight[] {
  const insights: Insight[] = [];

  // 1. Method comparison
  const interestSavings = results.snowball.totalInterest - results.avalanche.totalInterest;
  const timeSavings = results.snowball.timeToPayoff - results.avalanche.timeToPayoff;

  if (Math.abs(interestSavings) < 100) {
    insights.push({
      type: 'info',
      title: 'Both Methods Similar',
      description: 'Snowball and avalanche methods have similar costs. Choose snowball for psychological wins (paying off debts faster) or avalanche to minimize interest.',
    });
  } else if (interestSavings > 0) {
    insights.push({
      type: 'success',
      title: 'Avalanche Method Saves Money',
      description: `The avalanche method (highest interest first) will save you ${formatCurrency(interestSavings)} compared to snowball and pay off debt ${timeSavings} months faster!`,
    });
  }

  // 2. Extra payment impact
  if (inputs.extraPayment > 0) {
    const percentFaster = (timeSavings / results.snowball.timeToPayoff) * 100;
    insights.push({
      type: 'success',
      title: 'Extra Payments Accelerate Payoff',
      description: `Your ${formatCurrency(inputs.extraPayment)} extra monthly payment reduces payoff time by ${Math.abs(percentFaster).toFixed(0)}%!`,
    });
  }

  // 3. High interest debt warning
  const highInterestDebt = inputs.debts.find(d => d.interestRate > 18);
  if (highInterestDebt) {
    insights.push({
      type: 'warning',
      title: 'High Interest Debt Detected',
      description: `"${highInterestDebt.name}" at ${formatPercentage(highInterestDebt.interestRate)} is costing you heavily. Prioritize paying this off or consider a balance transfer to a lower rate.`,
    });
  }

  // 4. Total debt amount
  const totalDebt = inputs.debts.reduce((sum, d) => sum + d.balance, 0);
  if (totalDebt > 50000) {
    insights.push({
      type: 'warning',
      title: 'Substantial Debt Load',
      description: `Total debt of ${formatCurrency(totalDebt)} requires a focused strategy. Consider debt consolidation or speaking with a financial advisor.`,
    });
  }

  // 5. Payoff timeline
  const yearsToPayoff = results.avalanche.timeToPayoff / 12;
  if (yearsToPayoff > 5) {
    insights.push({
      type: 'tip',
      title: 'Long Payoff Timeline',
      description: `Debt freedom in ${yearsToPayoff.toFixed(1)} years. Consider increasing your extra payment to accelerate this timeline.`,
    });
  } else if (yearsToPayoff <= 2) {
    insights.push({
      type: 'success',
      title: 'Debt Freedom Within Reach',
      description: `You're on track to be debt-free in just ${yearsToPayoff.toFixed(1)} years! Stay focused on your plan.`,
    });
  }

  // 6. Minimum payment warning
  const totalMinPayment = inputs.debts.reduce((sum, d) => sum + d.minPayment, 0);
  if (inputs.extraPayment === 0 && totalMinPayment > 0) {
    insights.push({
      type: 'warning',
      title: 'Making Only Minimum Payments',
      description: 'Minimum payments extend debt for years. Even an extra $50/month can make a significant difference!',
    });
  }

  return insights;
}

// ============================================================================
// RETIREMENT PLANNER INSIGHTS
// ============================================================================

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  desiredMonthlyIncome: number;
}

export interface RetirementResults {
  savingsAtRetirement: number;
  totalNeeded: number;
  surplus?: number;
  shortfall?: number;
  monthlyIncomeGenerated: number;
}

export function generateRetirementInsights(
  inputs: RetirementInputs,
  results: RetirementResults
): Insight[] {
  const insights: Insight[] = [];

  // 1. On track or shortfall
  if (results.shortfall && results.shortfall > 0) {
    const increaseNeeded = results.shortfall / ((inputs.retirementAge - inputs.currentAge) * 12);
    insights.push({
      type: 'warning',
      title: 'Retirement Savings Shortfall',
      description: `You may fall short by ${formatCurrency(results.shortfall)}. Consider increasing monthly contributions by ${formatCurrency(increaseNeeded)} or adjusting retirement expectations.`,
    });
  } else if (results.surplus && results.surplus > 0) {
    insights.push({
      type: 'success',
      title: 'On Track for Retirement!',
      description: `Your plan projects a surplus of ${formatCurrency(results.surplus)}. You're well-positioned for a comfortable retirement!`,
    });
  }

  // 2. Early retirement opportunity
  if (results.surplus && results.surplus > 500000 && inputs.retirementAge > 60) {
    const yearsEarly = Math.floor(results.surplus / (inputs.desiredMonthlyIncome * 12 * 2));
    if (yearsEarly > 0) {
      insights.push({
        type: 'success',
        title: 'Early Retirement Possible',
        description: `With your surplus, you could potentially retire ${yearsEarly} year${yearsEarly > 1 ? 's' : ''} earlier than planned!`,
      });
    }
  }

  // 3. Contribution rate
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const annualContributions = inputs.monthlyContribution * 12;
  if (annualContributions < 10000 && yearsToRetirement < 20) {
    insights.push({
      type: 'warning',
      title: 'Low Contribution Rate',
      description: `Contributing only ${formatCurrency(inputs.monthlyContribution)}/month may not be sufficient. Financial experts recommend saving 15-20% of income for retirement.`,
    });
  }

  // 4. Return rate expectations
  if (inputs.expectedReturn > 10) {
    insights.push({
      type: 'warning',
      title: 'Aggressive Return Assumption',
      description: `Expected returns of ${formatPercentage(inputs.expectedReturn)} are optimistic. Consider planning with 7-8% for a more conservative estimate.`,
    });
  }

  // 5. Inflation impact
  const realReturn = inputs.expectedReturn - inputs.inflationRate;
  if (realReturn < 4) {
    insights.push({
      type: 'info',
      title: 'Inflation Reduces Real Returns',
      description: `After ${formatPercentage(inputs.inflationRate)} inflation, your real return is only ${formatPercentage(realReturn)}. Plan accordingly for purchasing power.`,
    });
  }

  // 6. Withdrawal rate
  const withdrawalRate = (inputs.desiredMonthlyIncome * 12) / results.savingsAtRetirement;
  if (withdrawalRate > 0.04) {
    insights.push({
      type: 'warning',
      title: 'High Withdrawal Rate',
      description: `Your ${formatPercentage(withdrawalRate * 100)} withdrawal rate exceeds the safe 4% rule. Consider reducing expenses or increasing savings to avoid depleting funds early.`,
    });
  } else if (withdrawalRate < 0.03) {
    insights.push({
      type: 'success',
      title: 'Conservative Withdrawal Rate',
      description: `Your ${formatPercentage(withdrawalRate * 100)} withdrawal rate is below the 4% safe withdrawal rule. Your retirement funds should last comfortably!`,
    });
  }

  return insights;
}

// ============================================================================
// ROI CALCULATOR INSIGHTS
// ============================================================================

export interface ROIInputs {
  initialInvestment: number;
  finalValue: number;
  timeHorizon: number; // years
  additionalCosts?: number;
}

export interface ROIResults {
  totalReturn: number;
  roi: number; // percentage
  annualizedReturn: number;
}

export function generateROIInsights(
  inputs: ROIInputs,
  results: ROIResults
): Insight[] {
  const insights: Insight[] = [];

  // 1. ROI evaluation
  if (results.roi < 0) {
    insights.push({
      type: 'warning',
      title: 'Negative Return',
      description: `Your investment lost ${formatPercentage(Math.abs(results.roi))}. Review your strategy and consider cutting losses if prospects remain poor.`,
    });
  } else if (results.roi > 100) {
    insights.push({
      type: 'success',
      title: 'Exceptional Returns',
      description: `Your ${formatPercentage(results.roi)} return is outstanding! You've more than doubled your investment.`,
    });
  } else if (results.roi > 20) {
    insights.push({
      type: 'success',
      title: 'Strong Returns',
      description: `Your ${formatPercentage(results.roi)} return is well above average. Great investment!`,
    });
  }

  // 2. Annualized return comparison
  const sp500Benchmark = 10;
  if (results.annualizedReturn > sp500Benchmark + 3) {
    insights.push({
      type: 'success',
      title: 'Beating the Market',
      description: `Your ${formatPercentage(results.annualizedReturn)} annualized return beats the S&P 500 average of ${formatPercentage(sp500Benchmark)}!`,
    });
  } else if (results.annualizedReturn < sp500Benchmark - 3) {
    insights.push({
      type: 'warning',
      title: 'Underperforming Market',
      description: `Your ${formatPercentage(results.annualizedReturn)} annualized return trails the S&P 500. Consider whether this investment is worth maintaining.`,
    });
  }

  // 3. Time horizon
  if (inputs.timeHorizon < 1) {
    insights.push({
      type: 'info',
      title: 'Short Investment Period',
      description: 'Returns under 1 year are subject to high volatility. Long-term investments typically yield more stable returns.',
    });
  }

  // 4. Additional costs impact
  if (inputs.additionalCosts && inputs.additionalCosts > 0) {
    const costPercent = (inputs.additionalCosts / inputs.initialInvestment) * 100;
    if (costPercent > 5) {
      insights.push({
        type: 'warning',
        title: 'High Additional Costs',
        description: `Additional costs of ${formatCurrency(inputs.additionalCosts)} represent ${formatPercent(costPercent)} of your investment. Minimize fees when possible.`,
      });
    }
  }

  return insights;
}

// Helper function
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
