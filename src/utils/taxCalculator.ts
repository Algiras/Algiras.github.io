import { CalculatorFormData } from '../components/calculator/CalculatorForm';

// Result interfaces
export interface TaxCalculationResult {
  abandonedTax: number;
  threshold: number;
  taxableBase: number;
  initialTax: number;
  finalTax: number;
  minimumTaxRuleApplied: boolean;
  lowIncomeExemption: boolean;
}

export interface ProposedTaxCalculationResult extends TaxCalculationResult {
  reliefAmount: number;
}

// Constants for tax calculation
// Current system (2023-2025) constants
const CURRENT_STANDARD_THRESHOLD = 150000;
const CURRENT_FAMILY_THRESHOLD = 200000;
const CURRENT_MINIMUM_TAX = 5; // Minimum tax amount in euros

// Current system tax brackets
const CURRENT_BRACKET_1_RATE = 0.005; // 0.5% for value exceeding threshold up to €300,000 (or €390,000 for family)
const CURRENT_BRACKET_2_RATE = 0.01; // 1% for value between €300,001-€500,000 (or €390,001-€650,000 for family)
const CURRENT_BRACKET_3_RATE = 0.02; // 2% for value exceeding €500,000 (or €650,000 for family)

// Proposed system (2026+) constants

/**
 * Standard threshold per person (non-family adjusted)
 * Every person gets this tax-free threshold for their property portfolio
 */
const PROPOSED_STANDARD_THRESHOLD_PER_PERSON = 40000; // €40,000 per person

/**
 * Family-adjusted threshold per person
 * Eligibility criteria:
 * - Individuals raising three or more children (including adopted) under 18 years
 * - Individuals raising a child (including adopted) with a disability under 18 years
 * - Individuals raising an older disabled child requiring special constant nursing care
 * 
 * Legal basis: Article 7 of the Lithuanian Real Estate Tax Law
 */
const PROPOSED_FAMILY_THRESHOLD_PER_PERSON = 50000; // €50,000 per qualifying owner

/**
 * Minimum tax amount - tax is not collected if calculated amount is below this value
 */
const PROPOSED_MINIMUM_TAX = 5; // €5 minimum tax

/**
 * Primary residence relief for standard cases
 * Provides a 50% reduction on tax calculated for primary residence value up to €450,000
 */
const PROPOSED_PRIMARY_RESIDENCE_RELIEF_STANDARD = 0.5; // 50% relief

/**
 * Enhanced primary residence relief for qualifying families
 * Provides a 75% reduction on tax calculated for primary residence value up to €450,000
 * 
 * Applies to the same family criteria as the increased threshold:
 * - Families with 3+ children under 18
 * - Families with disabled children
 * 
 * Legal basis: Article 7 of the Lithuanian Real Estate Tax Law
 */
const PROPOSED_PRIMARY_RESIDENCE_RELIEF_FAMILY = 0.75; // 75% relief

/**
 * Maximum property value eligible for primary residence relief
 * Relief applies only to the portion of primary residence value up to this amount
 */
const PROPOSED_PRIMARY_RESIDENCE_RELIEF_MAX_VALUE = 450000; // €450,000 cap

// Proposed system tax brackets
const PROPOSED_BRACKET_1_RATE = 0.001; // 0.1% for value from threshold to €200,000 (or €250,000 for family)
const PROPOSED_BRACKET_2_RATE = 0.002; // 0.2% for value from €200,001 to €400,000 (or €250,001 to €500,000 for family)
const PROPOSED_BRACKET_3_RATE = 0.005; // 0.5% for value from €400,001 to €600,000 (or €500,001 to €750,000 for family)
const PROPOSED_BRACKET_4_RATE = 0.01; // 1% for value exceeding €600,000 (or €750,000 for family)

/**
 * Calculate tax under the current system (2023-2025)
 */
export function calculateCurrentTax(formData: CalculatorFormData): TaxCalculationResult {
  const { 
    primaryResidenceValue, 
    otherPropertiesValue, 
    abandonedValue, 
    municipalRate,
    numOwners,
    isFamilyAdjusted,
    isLowIncome
  } = formData;

  /**
   * Low Income Exemption
   * 
   * Eligibility criteria:
   * - Individuals receiving heating cost compensation (šildymo išlaidų kompensacija)
   * - Applies only to declared primary residence
   * 
   * Benefit: Complete exemption (100% tax relief) for primary residence only
   * 
   * Legal basis: Article 7 of the Lithuanian Real Estate Tax Law
   */
  if (isLowIncome) {
    return {
      abandonedTax: 0,
      threshold: CURRENT_STANDARD_THRESHOLD,
      taxableBase: 0,
      initialTax: 0,
      finalTax: 0,
      minimumTaxRuleApplied: false,
      lowIncomeExemption: true
    };
  }

  // Calculate abandoned property tax (if any)
  const abandonedTax = abandonedValue * (municipalRate / 100);

  // Determine the applicable threshold based on family status
  const baseThreshold = isFamilyAdjusted ? CURRENT_FAMILY_THRESHOLD : CURRENT_STANDARD_THRESHOLD;
  
  // Adjust threshold based on number of owners
  const adjustedThreshold = baseThreshold * numOwners;
  
  // Calculate total property value (excluding abandoned property which is taxed separately)
  const totalPropertyValue = primaryResidenceValue + otherPropertiesValue;
  
  // Calculate taxable base (value exceeding threshold)
  const taxableBase = Math.max(0, totalPropertyValue - adjustedThreshold);
  
  // Calculate tax using progressive rates
  let initialTax = 0;
  
  if (taxableBase > 0) {
    // Determine bracket limits based on family status
    const bracket1Limit = isFamilyAdjusted ? 390000 : 300000;
    const bracket2Limit = isFamilyAdjusted ? 650000 : 500000;
    
    // Calculate tax for each bracket
    if (taxableBase <= (bracket1Limit - adjustedThreshold)) {
      // Only bracket 1 applies
      initialTax = taxableBase * CURRENT_BRACKET_1_RATE;
    } else if (taxableBase <= (bracket2Limit - adjustedThreshold)) {
      // Brackets 1 and 2 apply
      const bracket1Amount = (bracket1Limit - adjustedThreshold);
      const bracket2Amount = taxableBase - bracket1Amount;
      
      initialTax = (bracket1Amount * CURRENT_BRACKET_1_RATE) + 
                  (bracket2Amount * CURRENT_BRACKET_2_RATE);
    } else {
      // All brackets apply
      const bracket1Amount = (bracket1Limit - adjustedThreshold);
      const bracket2Amount = (bracket2Limit - bracket1Limit);
      const bracket3Amount = taxableBase - (bracket1Amount + bracket2Amount);
      
      initialTax = (bracket1Amount * CURRENT_BRACKET_1_RATE) + 
                  (bracket2Amount * CURRENT_BRACKET_2_RATE) + 
                  (bracket3Amount * CURRENT_BRACKET_3_RATE);
    }
  }
  
  // Add abandoned property tax
  initialTax += abandonedTax;
  
  // Apply minimum tax rule if applicable
  const hasTaxableProperty = taxableBase > 0 || abandonedValue > 0;
  const minimumTaxRuleApplied = hasTaxableProperty && initialTax < CURRENT_MINIMUM_TAX && initialTax > 0;
  const finalTax = minimumTaxRuleApplied ? CURRENT_MINIMUM_TAX : initialTax;

  return {
    abandonedTax,
    threshold: adjustedThreshold,
    taxableBase,
    initialTax,
    finalTax,
    minimumTaxRuleApplied,
    lowIncomeExemption: false
  };
}

/**
 * Calculate tax under the proposed system (from 2026)
 */
export function calculateProposedTax(formData: CalculatorFormData): ProposedTaxCalculationResult {
  const { 
    primaryResidenceValue, 
    otherPropertiesValue, 
    abandonedValue, 
    municipalRate,
    numOwners,
    isFamilyAdjusted,
    isLowIncome
  } = formData;

  // If low income, no tax is applied
  if (isLowIncome) {
    return {
      abandonedTax: 0,
      threshold: PROPOSED_STANDARD_THRESHOLD_PER_PERSON,
      taxableBase: 0,
      initialTax: 0,
      reliefAmount: 0,
      finalTax: 0,
      minimumTaxRuleApplied: false,
      lowIncomeExemption: true
    };
  }

  // Calculate abandoned property tax (if any)
  const abandonedTax = abandonedValue * (municipalRate / 100);

  // Determine the applicable threshold based on family status
  const baseThresholdPerPerson = isFamilyAdjusted ? 
    PROPOSED_FAMILY_THRESHOLD_PER_PERSON : PROPOSED_STANDARD_THRESHOLD_PER_PERSON;
  
  // Adjust threshold based on number of owners
  const adjustedThreshold = baseThresholdPerPerson * numOwners;
  
  // Calculate total property value (excluding abandoned property which is taxed separately)
  const totalPropertyValue = primaryResidenceValue + otherPropertiesValue;
  
  // Calculate taxable base (value exceeding threshold)
  const taxableBase = Math.max(0, totalPropertyValue - adjustedThreshold);
  
  // Calculate tax using progressive rates
  let initialTax = 0;
  
  if (taxableBase > 0) {
    // Determine bracket limits based on family status
    const bracket1Limit = isFamilyAdjusted ? 250000 : 200000;
    const bracket2Limit = isFamilyAdjusted ? 500000 : 400000;
    const bracket3Limit = isFamilyAdjusted ? 750000 : 600000;
    
    // Calculate tax for each bracket
    if (taxableBase <= bracket1Limit) {
      // Only bracket 1 applies
      initialTax = taxableBase * PROPOSED_BRACKET_1_RATE;
    } else if (taxableBase <= bracket2Limit) {
      // Brackets 1 and 2 apply
      initialTax = (bracket1Limit * PROPOSED_BRACKET_1_RATE) + 
                  ((taxableBase - bracket1Limit) * PROPOSED_BRACKET_2_RATE);
    } else if (taxableBase <= bracket3Limit) {
      // Brackets 1, 2, and 3 apply
      initialTax = (bracket1Limit * PROPOSED_BRACKET_1_RATE) + 
                  ((bracket2Limit - bracket1Limit) * PROPOSED_BRACKET_2_RATE) + 
                  ((taxableBase - bracket2Limit) * PROPOSED_BRACKET_3_RATE);
    } else {
      // All brackets apply
      initialTax = (bracket1Limit * PROPOSED_BRACKET_1_RATE) + 
                  ((bracket2Limit - bracket1Limit) * PROPOSED_BRACKET_2_RATE) + 
                  ((bracket3Limit - bracket2Limit) * PROPOSED_BRACKET_3_RATE) + 
                  ((taxableBase - bracket3Limit) * PROPOSED_BRACKET_4_RATE);
    }
  }
  
  // Add abandoned property tax
  initialTax += abandonedTax;
  
  // Calculate primary residence relief if applicable
  let reliefAmount = 0;
  
  if (primaryResidenceValue > 0 && !isLowIncome) {
    // Determine the relief percentage based on family status
    const reliefPercentage = isFamilyAdjusted ? 
      PROPOSED_PRIMARY_RESIDENCE_RELIEF_FAMILY : PROPOSED_PRIMARY_RESIDENCE_RELIEF_STANDARD;
    
    // Calculate the portion of tax attributable to primary residence
    // (limited to the value up to PROPOSED_PRIMARY_RESIDENCE_RELIEF_MAX_VALUE)
    const reliefEligibleValue = Math.min(primaryResidenceValue, PROPOSED_PRIMARY_RESIDENCE_RELIEF_MAX_VALUE);
    const primaryResidencePortion = totalPropertyValue > 0 ? reliefEligibleValue / totalPropertyValue : 0;
    
    // Calculate relief amount (excluding abandoned property tax)
    reliefAmount = (initialTax - abandonedTax) * primaryResidencePortion * reliefPercentage;
  }
  
  // Calculate final tax after relief
  const taxAfterRelief = Math.max(0, initialTax - reliefAmount);
  
  // Apply minimum tax rule if applicable
  const hasTaxableProperty = taxableBase > 0 || abandonedValue > 0;
  const minimumTaxRuleApplied = hasTaxableProperty && taxAfterRelief < PROPOSED_MINIMUM_TAX && taxAfterRelief > 0;
  const finalTax = minimumTaxRuleApplied ? PROPOSED_MINIMUM_TAX : taxAfterRelief;

  return {
    abandonedTax,
    threshold: adjustedThreshold,
    taxableBase,
    initialTax,
    reliefAmount,
    finalTax,
    minimumTaxRuleApplied,
    lowIncomeExemption: false
  };
}

/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
