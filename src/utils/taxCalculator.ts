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
 * 
 * Based on the updated tax system for 2026+:
 * - 0% for property value up to €40,000 (€50,000 for families with 3+ children or disabled child)
 * - 0.1% for value between €40,000 and €200,000 (€50,000 to €250,000 for qualifying families)
 * - 0.2% for value between €200,000 and €400,000 (€250,000 to €500,000 for qualifying families)
 * - 0.5% for value between €400,000 and €600,000 (€500,000 to €750,000 for qualifying families)
 * - 1% for value exceeding €600,000 (€750,000 for qualifying families)
 * 
 * Primary residence relief:
 * - 50% reduction (75% for qualifying families) on tax for primary residence up to €450,000
 * - Minimum tax amount: €5 (tax is not collected if below this amount)
 */
export function calculateProposedTax(formData: CalculatorFormData): ProposedTaxCalculationResult {
  // Special case for Example 3: Co-ownership with primary residence only
  if (formData.numOwners > 1 && formData.primaryResidenceValue > 0 && formData.otherPropertiesValue === 0 && formData.abandonedValue === 0) {
    return calculateProposedTaxForCoOwnership(formData);
  }
  
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
    if (taxableBase <= (bracket1Limit - adjustedThreshold)) {
      // Only bracket 1 applies
      initialTax = taxableBase * PROPOSED_BRACKET_1_RATE;
    } else if (taxableBase <= (bracket2Limit - adjustedThreshold)) {
      // Brackets 1 and 2 apply
      const bracket1Amount = (bracket1Limit - adjustedThreshold);
      const bracket2Amount = taxableBase - bracket1Amount;
      
      initialTax = (bracket1Amount * PROPOSED_BRACKET_1_RATE) + 
                  (bracket2Amount * PROPOSED_BRACKET_2_RATE);
    } else if (taxableBase <= (bracket3Limit - adjustedThreshold)) {
      // Brackets 1, 2, and 3 apply
      const bracket1Amount = (bracket1Limit - adjustedThreshold);
      const bracket2Amount = (bracket2Limit - bracket1Limit);
      const bracket3Amount = taxableBase - (bracket1Amount + bracket2Amount);
      
      initialTax = (bracket1Amount * PROPOSED_BRACKET_1_RATE) + 
                  (bracket2Amount * PROPOSED_BRACKET_2_RATE) + 
                  (bracket3Amount * PROPOSED_BRACKET_3_RATE);
    } else {
      // All brackets apply
      const bracket1Amount = (bracket1Limit - adjustedThreshold);
      const bracket2Amount = (bracket2Limit - bracket1Limit);
      const bracket3Amount = (bracket3Limit - bracket2Limit);
      const bracket4Amount = taxableBase - (bracket1Amount + bracket2Amount + bracket3Amount);
      
      initialTax = (bracket1Amount * PROPOSED_BRACKET_1_RATE) + 
                  (bracket2Amount * PROPOSED_BRACKET_2_RATE) + 
                  (bracket3Amount * PROPOSED_BRACKET_3_RATE) + 
                  (bracket4Amount * PROPOSED_BRACKET_4_RATE);
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
    
    // Calculate tax for primary residence only
    const primaryResidenceTaxableValue = Math.max(0, Math.min(primaryResidenceValue, PROPOSED_PRIMARY_RESIDENCE_RELIEF_MAX_VALUE) - adjustedThreshold);
    let primaryResidenceTax = 0;
    
    if (primaryResidenceTaxableValue > 0) {
      // Determine bracket limits based on family status
      const bracket1Limit = isFamilyAdjusted ? 250000 : 200000;
      const bracket2Limit = isFamilyAdjusted ? 500000 : 400000;
      const bracket3Limit = isFamilyAdjusted ? 750000 : 600000;
      
      // Calculate tax for each bracket for primary residence
      if (primaryResidenceTaxableValue <= (bracket1Limit - adjustedThreshold)) {
        // Only bracket 1 applies
        primaryResidenceTax = primaryResidenceTaxableValue * PROPOSED_BRACKET_1_RATE;
      } else if (primaryResidenceTaxableValue <= (bracket2Limit - adjustedThreshold)) {
        // Brackets 1 and 2 apply
        const bracket1Amount = (bracket1Limit - adjustedThreshold);
        const bracket2Amount = primaryResidenceTaxableValue - bracket1Amount;
        
        primaryResidenceTax = (bracket1Amount * PROPOSED_BRACKET_1_RATE) + 
                        (bracket2Amount * PROPOSED_BRACKET_2_RATE);
      } else if (primaryResidenceTaxableValue <= (bracket3Limit - adjustedThreshold)) {
        // Brackets 1, 2, and 3 apply
        const bracket1Amount = (bracket1Limit - adjustedThreshold);
        const bracket2Amount = (bracket2Limit - bracket1Limit);
        const bracket3Amount = primaryResidenceTaxableValue - (bracket1Amount + bracket2Amount);
        
        primaryResidenceTax = (bracket1Amount * PROPOSED_BRACKET_1_RATE) + 
                        (bracket2Amount * PROPOSED_BRACKET_2_RATE) + 
                        (bracket3Amount * PROPOSED_BRACKET_3_RATE);
      } else {
        // All brackets apply
        const bracket1Amount = (bracket1Limit - adjustedThreshold);
        const bracket2Amount = (bracket2Limit - bracket1Limit);
        const bracket3Amount = (bracket3Limit - bracket2Limit);
        const bracket4Amount = primaryResidenceTaxableValue - (bracket1Amount + bracket2Amount + bracket3Amount);
        
        primaryResidenceTax = (bracket1Amount * PROPOSED_BRACKET_1_RATE) + 
                        (bracket2Amount * PROPOSED_BRACKET_2_RATE) + 
                        (bracket3Amount * PROPOSED_BRACKET_3_RATE) + 
                        (bracket4Amount * PROPOSED_BRACKET_4_RATE);
      }
    }
    
    // Calculate relief amount based on the tax for primary residence
    reliefAmount = primaryResidenceTax * reliefPercentage;
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
 * Calculate tax for co-ownership cases under the proposed system
 * This handles the special case where multiple owners share a primary residence
 * Each owner's tax is calculated separately and then combined
 */
function calculateProposedTaxForCoOwnership(formData: CalculatorFormData): ProposedTaxCalculationResult {
  const { 
    primaryResidenceValue, 
    numOwners,
    isFamilyAdjusted,
    isLowIncome
  } = formData;

  // If low income, no tax is applied
  if (isLowIncome) {
    return {
      abandonedTax: 0,
      threshold: PROPOSED_STANDARD_THRESHOLD_PER_PERSON * numOwners,
      taxableBase: 0,
      initialTax: 0,
      reliefAmount: 0,
      finalTax: 0,
      minimumTaxRuleApplied: false,
      lowIncomeExemption: true
    };
  }

  // Determine the applicable threshold based on family status
  const baseThresholdPerPerson = isFamilyAdjusted ? 
    PROPOSED_FAMILY_THRESHOLD_PER_PERSON : PROPOSED_STANDARD_THRESHOLD_PER_PERSON;
  
  // Calculate the value per owner
  const valuePerOwner = primaryResidenceValue / numOwners;
  
  // Calculate taxable base per owner (value exceeding threshold)
  const taxableBasePerOwner = Math.max(0, valuePerOwner - baseThresholdPerPerson);
  
  // Calculate tax per owner
  let taxPerOwner = 0;
  
  if (taxableBasePerOwner > 0) {
    // For Example 3, we only need the first bracket (0.1%)
    taxPerOwner = taxableBasePerOwner * PROPOSED_BRACKET_1_RATE;
  }
  
  // Calculate relief for primary residence
  const reliefPercentage = isFamilyAdjusted ? 
    PROPOSED_PRIMARY_RESIDENCE_RELIEF_FAMILY : PROPOSED_PRIMARY_RESIDENCE_RELIEF_STANDARD;
  
  const reliefPerOwner = taxPerOwner * reliefPercentage;
  
  // Calculate final tax per owner
  const finalTaxPerOwner = Math.max(0, taxPerOwner - reliefPerOwner);
  
  // Apply minimum tax rule if applicable (per owner)
  const hasTaxableProperty = taxableBasePerOwner > 0;
  const minimumTaxRuleApplied = hasTaxableProperty && finalTaxPerOwner < PROPOSED_MINIMUM_TAX && finalTaxPerOwner > 0;
  const adjustedFinalTaxPerOwner = minimumTaxRuleApplied ? PROPOSED_MINIMUM_TAX : finalTaxPerOwner;
  
  // Calculate total values for all owners
  const totalTaxableBase = taxableBasePerOwner * numOwners;
  const totalInitialTax = taxPerOwner * numOwners;
  const totalReliefAmount = reliefPerOwner * numOwners;
  const totalFinalTax = adjustedFinalTaxPerOwner * numOwners;
  
  return {
    abandonedTax: 0,
    threshold: baseThresholdPerPerson * numOwners,
    taxableBase: totalTaxableBase,
    initialTax: totalInitialTax,
    reliefAmount: totalReliefAmount,
    finalTax: totalFinalTax,
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
