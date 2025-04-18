import { CalculatorFormData } from '../../components/calculator/CalculatorForm';
import { calculateCurrentTax, calculateProposedTax } from '../../utils/taxCalculator';

// Test constants based on the Lithuanian tax law
const CURRENT_STANDARD_THRESHOLD = 150000;
const CURRENT_FAMILY_THRESHOLD = 200000;
const PROPOSED_STANDARD_THRESHOLD_PER_PERSON = 40000;
const PROPOSED_FAMILY_THRESHOLD_PER_PERSON = 50000;

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
  
  // More test groups will be added in subsequent implementations
});

describe('Tax Calculator - Proposed System (2026+)', () => {
  // Test group for threshold calculations
  describe('Threshold Calculations', () => {
    test('should apply standard threshold of €40,000 per person', () => {
      const formData = createFormData({
        primaryResidenceValue: 60000,
        numOwners: 1,
        isFamilyAdjusted: false
      });
      
      const result = calculateProposedTax(formData);
      
      expect(result.threshold).toBe(PROPOSED_STANDARD_THRESHOLD_PER_PERSON);
      expect(result.taxableBase).toBe(20000); // 60000 - 40000
    });
    
    test('should apply family threshold of €50,000 per person when family adjusted', () => {
      const formData = createFormData({
        primaryResidenceValue: 70000,
        numOwners: 1,
        isFamilyAdjusted: true
      });
      
      const result = calculateProposedTax(formData);
      
      expect(result.threshold).toBe(PROPOSED_FAMILY_THRESHOLD_PER_PERSON);
      expect(result.taxableBase).toBe(20000); // 70000 - 50000
    });
    
    test('should multiply threshold by number of owners', () => {
      const formData = createFormData({
        primaryResidenceValue: 100000,
        numOwners: 2,
        isFamilyAdjusted: false
      });
      
      const result = calculateProposedTax(formData);
      
      expect(result.threshold).toBe(PROPOSED_STANDARD_THRESHOLD_PER_PERSON * 2);
      expect(result.taxableBase).toBe(20000); // 100000 - (40000 * 2)
    });
  });
  
  // More test groups will be added in subsequent implementations
});
