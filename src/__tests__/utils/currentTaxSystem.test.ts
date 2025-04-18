import { CalculatorFormData } from 'src/components/calculator/CalculatorForm';
import { calculateCurrentTax } from 'src/utils/taxCalculator';

// Test constants based on the Lithuanian tax law
const CURRENT_STANDARD_THRESHOLD = 150000;
const CURRENT_FAMILY_THRESHOLD = 200000;

// Helper function to create form data for testing
const createFormData = (props: Partial<CalculatorFormData> = {}): CalculatorFormData => ({
  primaryResidenceValue: 0,
  otherPropertiesValue: 0,
  abandonedValue: 0,
  municipalRate: 1,
  numOwners: 1,
  isFamilyAdjusted: false,
  isLowIncome: false,
  ...props
});

describe('Tax Calculator - Current System (2023-2025)', () => {
  // Test group for threshold calculations
  describe('Threshold Calculations', () => {
    test('should apply standard threshold of €150,000', () => {
      const formData = createFormData({
        primaryResidenceValue: 200000,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      expect(result.threshold).toBe(CURRENT_STANDARD_THRESHOLD);
      expect(result.taxableBase).toBe(50000); // 200000 - 150000
    });
    
    test('should apply family threshold of €200,000 when family adjusted', () => {
      const formData = createFormData({
        primaryResidenceValue: 250000,
        numOwners: 1,
        isFamilyAdjusted: true
      });
      
      const result = calculateCurrentTax(formData);
      
      // Verify the threshold is correctly applied
      expect(result.threshold).toBe(CURRENT_FAMILY_THRESHOLD);
    });
    
    test('should multiply threshold by number of owners', () => {
      const formData = createFormData({
        primaryResidenceValue: 400000,
        numOwners: 2,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      expect(result.threshold).toBe(CURRENT_STANDARD_THRESHOLD * 2);
      expect(result.taxableBase).toBe(100000); // 400000 - (150000 * 2)
    });
  });
  
  // Test group for progressive rate calculations
  describe('Progressive Rate Calculations', () => {
    test('should apply 0.5% rate to value between threshold and €300,000', () => {
      const formData = createFormData({
        primaryResidenceValue: 250000,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      // Taxable base: 250000 - 150000 = 100000
      // Tax: 100000 * 0.5% = 500
      expect(result.initialTax).toBe(500);
    });
    
    test('should apply 1% rate to value between €300,001 and €500,000', () => {
      const formData = createFormData({
        primaryResidenceValue: 400000,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      // Taxable base: 400000 - 150000 = 250000
      // First bracket: (300000 - 150000) * 0.5% = 750
      // Second bracket: (400000 - 300000) * 1% = 1000
      // Total tax: 750 + 1000 = 1750
      expect(result.initialTax).toBe(1750);
    });
    
    test('should apply 2% rate to value exceeding €500,000', () => {
      const formData = createFormData({
        primaryResidenceValue: 600000,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      // Taxable base: 600000 - 150000 = 450000
      // First bracket: (300000 - 150000) * 0.5% = 750
      // Second bracket: (500000 - 300000) * 1% = 2000
      // Third bracket: (600000 - 500000) * 2% = 2000
      // Total tax: 750 + 2000 + 2000 = 4750
      expect(result.initialTax).toBe(4750);
    });
  });
  
  // Test group for family adjustment
  describe('Family Adjustment Calculations', () => {
    test('should apply different bracket limits for family-adjusted properties', () => {
      const formData = createFormData({
        primaryResidenceValue: 500000,
        numOwners: 1,
        isFamilyAdjusted: true
      });
      
      const result = calculateCurrentTax(formData);
      
      // Taxable base: 500000 - 200000 = 300000
      // First bracket: (390000 - 200000) * 0.5% = 950
      // Second bracket: (500000 - 390000) * 1% = 1100
      // Total tax: 950 + 1100 = 2050
      expect(result.initialTax).toBe(2050);
    });
    
    test('should apply all three brackets for high-value family-adjusted properties', () => {
      const formData = createFormData({
        primaryResidenceValue: 800000,
        numOwners: 1,
        isFamilyAdjusted: true
      });
      
      const result = calculateCurrentTax(formData);
      
      // Taxable base: 800000 - 200000 = 600000
      // First bracket: (390000 - 200000) * 0.5% = 950
      // Second bracket: (650000 - 390000) * 1% = 2600
      // Third bracket: (800000 - 650000) * 2% = 3000
      // Total tax: 950 + 2600 + 3000 = 6550
      expect(result.initialTax).toBe(6550);
    });
  });
  
  // Test group for minimum tax rule
  describe('Minimum Tax Rule', () => {
    test('should apply minimum tax rule when calculated tax is below €5', () => {
      const formData = createFormData({
        primaryResidenceValue: 152000,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      // Taxable base: 152000 - 150000 = 2000
      // Tax: 2000 * 0.5% = 10
      // This is above the minimum, so no adjustment
      expect(result.initialTax).toBe(10);
      expect(result.minimumTaxRuleApplied).toBe(false);
      expect(result.finalTax).toBe(10);
      
      // Now test with a value that would result in tax below €5
      const formData2 = createFormData({
        primaryResidenceValue: 150900,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result2 = calculateCurrentTax(formData2);
      
      // Taxable base: 150900 - 150000 = 900
      // Tax: 900 * 0.5% = 4.5
      // This is below the minimum, so should be adjusted to €5
      expect(result2.initialTax).toBe(4.5);
      expect(result2.minimumTaxRuleApplied).toBe(true);
      expect(result2.finalTax).toBe(5);
    });
  });
  
  // Test group for low income exemption
  describe('Low Income Exemption', () => {
    test('should fully exempt low income individuals from tax', () => {
      const formData = createFormData({
        primaryResidenceValue: 300000,
        numOwners: 1,
        isFamilyAdjusted: false,
        isLowIncome: true
      });
      
      const result = calculateCurrentTax(formData);
      
      expect(result.lowIncomeExemption).toBe(true);
      expect(result.initialTax).toBe(0);
      expect(result.finalTax).toBe(0);
    });
  });
  
  // Test group for abandoned property tax
  describe('Abandoned Property Tax', () => {
    test('should calculate abandoned property tax based on municipal rate', () => {
      const formData = createFormData({
        primaryResidenceValue: 0,
        otherPropertiesValue: 0,
        abandonedValue: 100000,
        municipalRate: 2.5,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      // Abandoned tax: 100000 * 2.5% = 2500
      expect(result.abandonedTax).toBe(2500);
      expect(result.finalTax).toBe(2500);
    });
    
    test('should combine abandoned property tax with standard property tax', () => {
      const formData = createFormData({
        primaryResidenceValue: 200000,
        otherPropertiesValue: 0,
        abandonedValue: 50000,
        municipalRate: 2,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateCurrentTax(formData);
      
      // Standard tax: (200000 - 150000) * 0.5% = 250
      // Abandoned tax: 50000 * 2% = 1000
      // Total tax: 250 + 1000 = 1250
      expect(result.abandonedTax).toBe(1000);
      expect(result.initialTax).toBe(1250);
      expect(result.finalTax).toBe(1250);
    });
  });
});