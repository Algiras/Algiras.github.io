/**
 * Calculator Export Utilities
 * Functions for PDF generation, CSV export, URL encoding, and text summaries
 */

export interface CalculatorState {
  calculatorType: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
}

/**
 * Encode calculator state to URL-safe string
 * Uses base64 encoding for simplicity (no dependencies)
 */
export function encodeStateToURL(state: CalculatorState): string {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch (error) {
    console.error('Failed to encode state:', error);
    return '';
  }
}

/**
 * Decode calculator state from URL parameter
 */
export function decodeStateFromURL(encoded: string): CalculatorState | null {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Generate CSV from array of objects
 */
export function generateCSV(
  data: Record<string, any>[],
  headers: string[],
  filename: string
): { filename: string; data: string } {
  // Create CSV header
  const csvHeaders = headers.join(',');

  // Create CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });

  const csv = [csvHeaders, ...csvRows].join('\n');

  return {
    filename: `${filename}.csv`,
    data: csv,
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Generate formatted text summary
 */
export function generateTextSummary(
  calculatorName: string,
  inputs: Record<string, any>,
  results: Record<string, any>
): string {
  let summary = `${calculatorName}\n`;
  summary += '='.repeat(calculatorName.length) + '\n\n';

  summary += 'INPUTS:\n';
  Object.entries(inputs).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    summary += `  ${label}: ${value}\n`;
  });

  summary += '\nRESULTS:\n';
  Object.entries(results).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    summary += `  ${label}: ${value}\n`;
  });

  summary += `\nGenerated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
  summary += `Visit ${window.location.origin} for more free financial calculators\n`;

  return summary;
}

/**
 * Generate amortization schedule CSV
 */
export function generateAmortizationCSV(
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>
): { filename: string; data: string } {
  return generateCSV(
    schedule.map(s => ({
      Month: s.month,
      'Total Payment': formatCurrency(s.payment),
      'Principal Payment': formatCurrency(s.principal),
      'Interest Payment': formatCurrency(s.interest),
      'Remaining Balance': formatCurrency(s.balance),
    })),
    ['Month', 'Total Payment', 'Principal Payment', 'Interest Payment', 'Remaining Balance'],
    'amortization_schedule'
  );
}

/**
 * Generate markdown report template for mortgage calculator
 */
export function generateMortgageMarkdown(inputs: any, results: any): string {
  return `# Mortgage Calculation Report

## Loan Details

- **Home Price**: ${formatCurrency(inputs.homePrice)}
- **Down Payment**: ${formatCurrency(inputs.downPayment)} (${inputs.downPaymentPercent}%)
- **Loan Amount**: ${formatCurrency(results.loanAmount)}
- **Interest Rate**: ${formatPercentage(inputs.interestRate)}
- **Loan Term**: ${inputs.loanTerm} years

## Monthly Payment Breakdown

- **Principal & Interest**: ${formatCurrency(results.monthlyPrincipalInterest)}
- **Property Tax**: ${formatCurrency(results.monthlyPropertyTax)}
- **Home Insurance**: ${formatCurrency(results.monthlyInsurance)}
- **PMI**: ${formatCurrency(results.monthlyPMI || 0)}
- **HOA Fees**: ${formatCurrency(results.monthlyHOA || 0)}

**Total Monthly Payment: ${formatCurrency(results.totalMonthlyPayment)}**

## Total Cost Over Life of Loan

- **Total Interest Paid**: ${formatCurrency(results.totalInterest)}
- **Total Cost (Principal + Interest)**: ${formatCurrency(results.totalCost)}
- **Payoff Date**: ${results.payoffDate || 'N/A'}

${inputs.extraPayment > 0 ? `
## Extra Payment Benefits

- **Extra Payment Amount**: ${formatCurrency(inputs.extraPayment)}/month
- **Time Saved**: ${results.timeSaved || 'N/A'}
- **Interest Saved**: ${formatCurrency(results.interestSaved || 0)}
` : ''}

---

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

*Created with [Algiras Financial Tools](${window.location.origin})*
`;
}

/**
 * Generate markdown report template for investment calculator
 */
export function generateInvestmentMarkdown(inputs: any, results: any): string {
  return `# Investment Calculation Report

## Investment Parameters

- **Initial Investment**: ${formatCurrency(inputs.initialInvestment)}
- **Monthly Contribution**: ${formatCurrency(inputs.monthlyContribution)}
- **Annual Return Rate**: ${formatPercentage(inputs.annualReturn)}
- **Investment Period**: ${inputs.years} years
- **Inflation Rate**: ${formatPercentage(inputs.inflationRate || 3)}

## Results

- **Total Contributions**: ${formatCurrency(results.totalContributions)}
- **Total Interest Earned**: ${formatCurrency(results.totalInterest)}
- **Final Value**: ${formatCurrency(results.finalValue)}
- **Inflation-Adjusted Value**: ${formatCurrency(results.inflationAdjustedValue || results.finalValue)}

## Summary

Your investment of ${formatCurrency(inputs.initialInvestment)} with ${formatCurrency(inputs.monthlyContribution)}/month contributions over ${inputs.years} years will grow to **${formatCurrency(results.finalValue)}**.

That's a return of **${formatCurrency(results.totalInterest)}** on your contributions of ${formatCurrency(results.totalContributions)}.

---

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

*Created with [Algiras Financial Tools](${window.location.origin})*
`;
}

/**
 * Generate markdown report template for debt payoff calculator
 */
export function generateDebtPayoffMarkdown(inputs: any, results: any): string {
  return `# Debt Payoff Plan

## Current Debts

${inputs.debts.map((debt: any, idx: number) => `
### Debt ${idx + 1}: ${debt.name}
- **Balance**: ${formatCurrency(debt.balance)}
- **Interest Rate**: ${formatPercentage(debt.interestRate)}
- **Minimum Payment**: ${formatCurrency(debt.minimumPayment)}
`).join('\n')}

## Payoff Strategy Comparison

### Snowball Method (Lowest Balance First)
- **Time to Payoff**: ${results.snowball.timeToPayoff} months
- **Total Interest**: ${formatCurrency(results.snowball.totalInterest)}
- **Total Paid**: ${formatCurrency(results.snowball.totalPaid)}

### Avalanche Method (Highest Interest First)
- **Time to Payoff**: ${results.avalanche.timeToPayoff} months
- **Total Interest**: ${formatCurrency(results.avalanche.totalInterest)}
- **Total Paid**: ${formatCurrency(results.avalanche.totalPaid)}

## Recommendation

${results.avalanche.totalInterest < results.snowball.totalInterest
  ? `**Avalanche method** saves you ${formatCurrency(results.snowball.totalInterest - results.avalanche.totalInterest)} in interest!`
  : 'Both methods have similar costs. Choose snowball for psychological wins!'
}

---

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

*Created with [Algiras Financial Tools](${window.location.origin})*
`;
}

/**
 * Generate markdown report template for retirement planner
 */
export function generateRetirementMarkdown(inputs: any, results: any): string {
  return `# Retirement Plan

## Current Situation

- **Current Age**: ${inputs.currentAge} years
- **Retirement Age**: ${inputs.retirementAge} years
- **Current Savings**: ${formatCurrency(inputs.currentSavings)}
- **Monthly Contribution**: ${formatCurrency(inputs.monthlyContribution)}
- **Expected Return**: ${formatPercentage(inputs.expectedReturn)}

## Retirement Goals

- **Years in Retirement**: ${inputs.lifeExpectancy - inputs.retirementAge} years
- **Desired Monthly Income**: ${formatCurrency(inputs.desiredMonthlyIncome)}
- **Inflation Rate**: ${formatPercentage(inputs.inflationRate || 3)}

## Projection

- **Savings at Retirement**: ${formatCurrency(results.savingsAtRetirement)}
- **Total Needed**: ${formatCurrency(results.totalNeeded)}
- **Surplus/Shortfall**: ${formatCurrency(results.surplus || -results.shortfall)}

${results.shortfall ? `
⚠️ **You may fall short by ${formatCurrency(results.shortfall)}**

Consider:
- Increasing monthly contributions
- Delaying retirement
- Reducing expected retirement expenses
` : `
✅ **You're on track!** Your plan projects a surplus of ${formatCurrency(results.surplus)}.
`}

---

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

*Created with [Algiras Financial Tools](${window.location.origin})*
`;
}
