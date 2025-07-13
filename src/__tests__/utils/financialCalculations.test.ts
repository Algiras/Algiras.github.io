import {
  calculateLoanPayment,
  calculateROI,
  calculateInvestmentGrowth,
  calculateMortgagePayment,
  calculateRetirementSavings,
  type LoanCalculationInput,
  type ROICalculationInput,
  type InvestmentCalculationInput,
  type MortgageCalculationInput,
  type RetirementCalculationInput
} from '../../utils/financialCalculations';

describe('Financial Calculations', () => {
  describe('calculateLoanPayment', () => {
    it('should calculate basic loan payment correctly', () => {
      const input: LoanCalculationInput = {
        principal: 100000,
        interestRate: 5,
        termYears: 30
      };

      const result = calculateLoanPayment(input);

      expect(result.monthlyPayment).toBeCloseTo(536.82, 2);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 360, 0);
      expect(result.payoffTime).toBe(30);
      expect(result.amortizationSchedule).toHaveLength(360);
    });

    it('should handle extra payments correctly', () => {
      const input: LoanCalculationInput = {
        principal: 100000,
        interestRate: 5,
        termYears: 30,
        extraPayment: 100
      };

      const result = calculateLoanPayment(input);
      const baseResult = calculateLoanPayment({
        principal: 100000,
        interestRate: 5,
        termYears: 30
      });

      expect(result.payoffTime).toBeLessThan(baseResult.payoffTime);
      expect(result.totalInterest).toBeLessThan(baseResult.totalInterest);
    });

    it('should handle zero interest rate', () => {
      const input: LoanCalculationInput = {
        principal: 100000,
        interestRate: 0,
        termYears: 30
      };

      const result = calculateLoanPayment(input);

      expect(result.monthlyPayment).toBeCloseTo(100000 / 360, 2);
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayment).toBe(100000);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateLoanPayment({
        principal: 0,
        interestRate: 5,
        termYears: 30
      })).toThrow('Invalid input parameters');

      expect(() => calculateLoanPayment({
        principal: 100000,
        interestRate: -1,
        termYears: 30
      })).toThrow('Invalid input parameters');

      expect(() => calculateLoanPayment({
        principal: 100000,
        interestRate: 5,
        termYears: 0
      })).toThrow('Invalid input parameters');
    });
  });

  describe('calculateROI', () => {
    it('should calculate simple ROI correctly', () => {
      const input: ROICalculationInput = {
        initialInvestment: 10000,
        finalValue: 15000,
        additionalInvestments: 2000,
        timeframe: 2,
        timeframeUnit: 'years'
      };

      const result = calculateROI(input);

      expect(result.totalInvested).toBe(12000);
      expect(result.netProfit).toBe(3000);
      expect(result.simpleROI).toBeCloseTo(25, 2);
      expect(result.annualizedROI).toBeGreaterThan(0);
      expect(result.totalReturn).toBe(15000);
    });

    it('should handle different timeframe units', () => {
      const yearInput: ROICalculationInput = {
        initialInvestment: 10000,
        finalValue: 12000,
        additionalInvestments: 0,
        timeframe: 1,
        timeframeUnit: 'years'
      };

      const monthInput: ROICalculationInput = {
        initialInvestment: 10000,
        finalValue: 12000,
        additionalInvestments: 0,
        timeframe: 12,
        timeframeUnit: 'months'
      };

      const yearResult = calculateROI(yearInput);
      const monthResult = calculateROI(monthInput);

      expect(yearResult.annualizedROI).toBeCloseTo(monthResult.annualizedROI, 1);
    });

    it('should handle negative returns', () => {
      const input: ROICalculationInput = {
        initialInvestment: 10000,
        finalValue: 8000,
        additionalInvestments: 0,
        timeframe: 1,
        timeframeUnit: 'years'
      };

      const result = calculateROI(input);

      expect(result.simpleROI).toBe(-20);
      expect(result.netProfit).toBe(-2000);
      expect(result.annualizedROI).toBeLessThan(0);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateROI({
        initialInvestment: 0,
        finalValue: 15000,
        additionalInvestments: 0,
        timeframe: 1,
        timeframeUnit: 'years'
      })).toThrow('Invalid input parameters');

      expect(() => calculateROI({
        initialInvestment: 10000,
        finalValue: 0,
        additionalInvestments: 0,
        timeframe: 1,
        timeframeUnit: 'years'
      })).toThrow('Invalid input parameters');
    });
  });

  describe('calculateInvestmentGrowth', () => {
    it('should calculate compound growth correctly', () => {
      const input: InvestmentCalculationInput = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualInterestRate: 7,
        investmentPeriod: 10,
        inflationRate: 2.5,
        taxRate: 15
      };

      const result = calculateInvestmentGrowth(input);

      expect(result.futureValue).toBeGreaterThan(result.totalContributions);
      expect(result.totalContributions).toBe(10000 + (500 * 10 * 12));
      expect(result.totalInterest).toBe(result.futureValue - result.totalContributions);
      expect(result.realValue).toBeLessThan(result.futureValue);
      expect(result.afterTaxValue).toBeLessThan(result.futureValue);
    });

    it('should handle zero interest rate', () => {
      const input: InvestmentCalculationInput = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualInterestRate: 0,
        investmentPeriod: 10,
        inflationRate: 0,
        taxRate: 0
      };

      const result = calculateInvestmentGrowth(input);

      expect(result.futureValue).toBe(result.totalContributions);
      expect(result.totalInterest).toBe(0);
      expect(result.realValue).toBe(result.futureValue);
      expect(result.afterTaxValue).toBe(result.futureValue);
    });

    it('should handle no monthly contributions', () => {
      const input: InvestmentCalculationInput = {
        initialAmount: 10000,
        monthlyContribution: 0,
        annualInterestRate: 7,
        investmentPeriod: 10,
        inflationRate: 2.5,
        taxRate: 15
      };

      const result = calculateInvestmentGrowth(input);

      expect(result.totalContributions).toBe(10000);
      expect(result.futureValue).toBeGreaterThan(10000);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateInvestmentGrowth({
        initialAmount: -1000,
        monthlyContribution: 500,
        annualInterestRate: 7,
        investmentPeriod: 10,
        inflationRate: 2.5,
        taxRate: 15
      })).toThrow('Invalid input parameters');

      expect(() => calculateInvestmentGrowth({
        initialAmount: 10000,
        monthlyContribution: -500,
        annualInterestRate: 7,
        investmentPeriod: 10,
        inflationRate: 2.5,
        taxRate: 15
      })).toThrow('Invalid input parameters');
    });
  });

  describe('calculateMortgagePayment', () => {
    it('should calculate mortgage payment correctly', () => {
      const input: MortgageCalculationInput = {
        homePrice: 400000,
        downPayment: 80000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 6000,
        homeInsurance: 1200,
        pmiRate: 0.5,
        hoaFees: 100
      };

      const result = calculateMortgagePayment(input);

      expect(result.loanAmount).toBe(320000);
      expect(result.monthlyPrincipalInterest).toBeGreaterThan(0);
      expect(result.monthlyPropertyTax).toBe(500);
      expect(result.monthlyInsurance).toBe(100);
      expect(result.monthlyPMI).toBe(0); // 20% down payment, no PMI
      expect(result.totalMonthlyPayment).toBeGreaterThan(result.monthlyPrincipalInterest);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it('should calculate PMI for less than 20% down payment', () => {
      const input: MortgageCalculationInput = {
        homePrice: 400000,
        downPayment: 40000, // 10% down payment
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 6000,
        homeInsurance: 1200,
        pmiRate: 0.5,
        hoaFees: 0
      };

      const result = calculateMortgagePayment(input);

      expect(result.monthlyPMI).toBeGreaterThan(0);
      expect(result.monthlyPMI).toBeCloseTo((360000 * 0.5 / 100) / 12, 2);
    });

    it('should handle zero down payment', () => {
      const input: MortgageCalculationInput = {
        homePrice: 400000,
        downPayment: 0,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 6000,
        homeInsurance: 1200,
        pmiRate: 0.5,
        hoaFees: 0
      };

      const result = calculateMortgagePayment(input);

      expect(result.loanAmount).toBe(400000);
      expect(result.monthlyPMI).toBeGreaterThan(0);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateMortgagePayment({
        homePrice: 0,
        downPayment: 80000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 6000,
        homeInsurance: 1200,
        pmiRate: 0.5,
        hoaFees: 0
      })).toThrow('Invalid input parameters');

      expect(() => calculateMortgagePayment({
        homePrice: 400000,
        downPayment: -1000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 6000,
        homeInsurance: 1200,
        pmiRate: 0.5,
        hoaFees: 0
      })).toThrow('Invalid input parameters');
    });
  });

  describe('calculateRetirementSavings', () => {
    it('should calculate retirement savings correctly', () => {
      const input: RetirementCalculationInput = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        employerMatch: 500,
        annualReturn: 7,
        inflationRate: 2.5,
        withdrawalRate: 4,
        lifeExpectancy: 85,
        taxRate: 15
      };

      const result = calculateRetirementSavings(input);

      expect(result.projectedSavings).toBeGreaterThan(result.totalContributions);
      expect(result.totalContributions).toBeGreaterThan(50000);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.yearsOfRetirement).toBe(20);
      expect(result.monthlyRetirementIncome).toBeGreaterThan(0);
      expect(result.replacementRatio).toBeGreaterThan(0);
    });

    it('should handle no employer match', () => {
      const input: RetirementCalculationInput = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        employerMatch: 0,
        annualReturn: 7,
        inflationRate: 2.5,
        withdrawalRate: 4,
        lifeExpectancy: 85,
        taxRate: 15
      };

      const result = calculateRetirementSavings(input);

      expect(result.projectedSavings).toBeGreaterThan(0);
      expect(result.totalContributions).toBe(50000 + (1000 * 35 * 12));
    });

    it('should handle zero return rate', () => {
      const input: RetirementCalculationInput = {
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        employerMatch: 500,
        annualReturn: 0,
        inflationRate: 0,
        withdrawalRate: 4,
        lifeExpectancy: 85,
        taxRate: 0
      };

      const result = calculateRetirementSavings(input);

      expect(result.projectedSavings).toBe(result.totalContributions);
      expect(result.totalInterest).toBe(0);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateRetirementSavings({
        currentAge: -5,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: 1000,
        employerMatch: 500,
        annualReturn: 7,
        inflationRate: 2.5,
        withdrawalRate: 4,
        lifeExpectancy: 85,
        taxRate: 15
      })).toThrow('Invalid input parameters');

      expect(() => calculateRetirementSavings({
        currentAge: 65,
        retirementAge: 60,
        currentSavings: 50000,
        monthlyContribution: 1000,
        employerMatch: 500,
        annualReturn: 7,
        inflationRate: 2.5,
        withdrawalRate: 4,
        lifeExpectancy: 85,
        taxRate: 15
      })).toThrow('Invalid input parameters');

      expect(() => calculateRetirementSavings({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 50000,
        monthlyContribution: -1000,
        employerMatch: 500,
        annualReturn: 7,
        inflationRate: 2.5,
        withdrawalRate: 4,
        lifeExpectancy: 85,
        taxRate: 15
      })).toThrow('Invalid input parameters');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle very small amounts', () => {
      const loanResult = calculateLoanPayment({
        principal: 1,
        interestRate: 5,
        termYears: 1
      });

      expect(loanResult.monthlyPayment).toBeGreaterThan(0);
      expect(loanResult.totalInterest).toBeGreaterThan(0);
    });

    it('should handle very large amounts', () => {
      const investmentResult = calculateInvestmentGrowth({
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualInterestRate: 7,
        investmentPeriod: 30,
        inflationRate: 2.5,
        taxRate: 15
      });

      expect(investmentResult.futureValue).toBeGreaterThan(1000000);
      expect(investmentResult.totalContributions).toBeGreaterThan(1000000);
    });

    it('should handle very high interest rates', () => {
      const roiResult = calculateROI({
        initialInvestment: 10000,
        finalValue: 50000,
        additionalInvestments: 0,
        timeframe: 1,
        timeframeUnit: 'years'
      });

      expect(roiResult.simpleROI).toBe(400);
      expect(roiResult.annualizedROI).toBe(400);
    });

    it('should handle very long time periods', () => {
      const retirementResult = calculateRetirementSavings({
        currentAge: 20,
        retirementAge: 70,
        currentSavings: 10000,
        monthlyContribution: 500,
        employerMatch: 250,
        annualReturn: 7,
        inflationRate: 2.5,
        withdrawalRate: 4,
        lifeExpectancy: 90,
        taxRate: 15
      });

      expect(retirementResult.projectedSavings).toBeGreaterThan(10000);
      expect(retirementResult.yearsOfRetirement).toBe(20);
    });
  });
}); 