import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorFormData } from './CalculatorForm';

interface CalculatorExplanationProps {
  formData: CalculatorFormData;
  currentResults: {
    abandonedTax: number;
    threshold: number;
    taxableBase: number;
    initialTax: number;
    finalTax: number;
    minimumTaxRuleApplied: boolean;
    lowIncomeExemption: boolean;
  };
  proposedResults: {
    abandonedTax: number;
    threshold: number;
    taxableBase: number;
    initialTax: number;
    reliefAmount: number;
    finalTax: number;
    minimumTaxRuleApplied: boolean;
    lowIncomeExemption: boolean;
  };
}

const CalculatorExplanation: React.FC<CalculatorExplanationProps> = ({
  formData,
  currentResults,
  proposedResults
}) => {
  const { t } = useTranslation();
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Calculate maintained property value (primary residence + other properties)
  const maintainedValue = formData.primaryResidenceValue + formData.otherPropertiesValue;
  
  return (
    <div className="mt-6 p-4 md:p-6 bg-white border border-gray-200 rounded-lg text-sm shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        {t('calculator.explanation.title')}
      </h3>
      
      {/* 1. Abandoned Property Tax */}
      {formData.abandonedValue > 0 ? (
        <>
          <h4 className="text-base font-semibold text-gray-700 mt-5 mb-2">
            {t('calculator.explanation.abandonedPropertyTaxTitle')}
          </h4>
          <p>
            {t('calculator.explanation.abandonedPropertyTaxDescription', { rate: formData.municipalRate.toFixed(1) })}
          </p>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.abandonedValueFormula', { rate: formData.municipalRate.toFixed(1) })}
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatCurrency(formData.abandonedValue)} × ({formData.municipalRate.toFixed(1)}% / 100) = {formatCurrency(currentResults.abandonedTax)}
            </span>
          </div>
        </>
      ) : (
        <>
          <h4 className="text-base font-semibold text-gray-700 mt-5 mb-2">
            {t('calculator.explanation.abandonedPropertyTaxTitle')}
          </h4>
          <p className="text-xs text-gray-500 italic mt-1">
            {t('calculator.explanation.noAbandonedProperty')}
          </p>
        </>
      )}
      
      {/* 2. Standard Tax Calculation Comparison */}
      <p className="mt-4">
        {t('calculator.explanation.maintainedPropertyComparison', { value: formatCurrency(maintainedValue) })}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-4">
        {/* Current Rules Column */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-base font-semibold text-indigo-700 mb-3 border-b border-indigo-100 pb-2">
            {t('calculator.explanation.currentRulesTitle')}
          </h4>
          
          {/* Threshold */}
          <p><strong>{t('calculator.explanation.thresholdTitle')}</strong></p>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.individualThreshold', { 
                type: formData.isFamilyAdjusted ? t('calculator.explanation.familyAdjusted') : t('calculator.explanation.standard'),
                value: formData.isFamilyAdjusted ? '200k' : '150k'
              })}
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatCurrency(formData.isFamilyAdjusted ? 200000 : 150000)}
            </span>
          </div>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.totalThreshold')}
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatCurrency(formData.isFamilyAdjusted ? 200000 : 150000)} × {formData.numOwners} = {formatCurrency(currentResults.threshold)}
            </span>
          </div>
          
          {/* Taxable Base */}
          <p><strong>{t('calculator.explanation.taxableBaseTitle')}</strong></p>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.taxableBaseFormula')}
            </span>
            <span className="font-medium text-gray-900 text-right">
              Max(0, {formatCurrency(maintainedValue)} - {formatCurrency(currentResults.threshold)}) = {formatCurrency(currentResults.taxableBase)}
            </span>
          </div>
          
          {/* Initial Standard Tax */}
          {currentResults.taxableBase > 0 ? (
            <>
              <p><strong>{t('calculator.explanation.initialStandardTaxTitle')}</strong></p>
              <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                <li>{t('calculator.explanation.currentRate1', { value: (300000 * formData.numOwners).toLocaleString('lt-LT') })}</li>
                <li>{t('calculator.explanation.currentRate2', { 
                  min: (300000 * formData.numOwners).toLocaleString('lt-LT'),
                  max: (500000 * formData.numOwners).toLocaleString('lt-LT')
                })}</li>
                <li>{t('calculator.explanation.currentRate3', { value: (500000 * formData.numOwners).toLocaleString('lt-LT') })}</li>
              </ul>
              <p className="text-xs text-gray-500 italic mt-1">
                {t('calculator.explanation.resultBeforeExemptions', { value: formatCurrency(currentResults.initialTax) })}
              </p>
            </>
          ) : (
            <p><strong>{t('calculator.explanation.initialStandardTaxZero')}</strong></p>
          )}
          
          {/* Low Income Exemption */}
          {formData.isLowIncome && formData.primaryResidenceValue > 0 ? (
            <p><strong>{t('calculator.explanation.lowIncomeExemptionApplied')}</strong></p>
          ) : (
            <p className="text-xs text-gray-500 italic">
              <strong>{t('calculator.explanation.lowIncomeExemptionNotApplied')}</strong>
            </p>
          )}
          
          {/* Final Standard Tax */}
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center mt-2">
            <strong>{t('calculator.explanation.finalStandardTaxCurrent')}</strong>
            <span>{formatCurrency(currentResults.finalTax - currentResults.abandonedTax)}</span>
          </div>
        </div>
        
        {/* Proposed Rules Column */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-base font-semibold text-indigo-700 mb-3 border-b border-indigo-100 pb-2">
            {t('calculator.explanation.proposedRulesTitle')}
          </h4>
          
          {/* Threshold */}
          <p><strong>{t('calculator.explanation.thresholdTitle')}</strong></p>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.individualThreshold', { 
                type: formData.isFamilyAdjusted ? t('calculator.explanation.familyAdjusted') : t('calculator.explanation.standard'),
                value: formData.isFamilyAdjusted ? '50k' : '40k'
              })}
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatCurrency(formData.isFamilyAdjusted ? 50000 : 40000)}
            </span>
          </div>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.totalThreshold')}
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatCurrency(formData.isFamilyAdjusted ? 50000 : 40000)} × {formData.numOwners} = {formatCurrency(proposedResults.threshold)}
            </span>
          </div>
          
          {/* Taxable Base */}
          <p><strong>{t('calculator.explanation.taxableBaseTitle')}</strong></p>
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
            <span className="text-gray-600 mr-2">
              {t('calculator.explanation.taxableBaseFormula')}
            </span>
            <span className="font-medium text-gray-900 text-right">
              Max(0, {formatCurrency(maintainedValue)} - {formatCurrency(proposedResults.threshold)}) = {formatCurrency(proposedResults.taxableBase)}
            </span>
          </div>
          
          {/* Initial Standard Tax */}
          {proposedResults.taxableBase > 0 ? (
            <>
              <p><strong>{t('calculator.explanation.initialStandardTaxTitle')}</strong></p>
              <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                {formData.isFamilyAdjusted ? (
                  <>
                    <li>{t('calculator.explanation.proposedRateFamily1', { value: (250000 * formData.numOwners).toLocaleString('lt-LT') })}</li>
                    <li>{t('calculator.explanation.proposedRateFamily2', { 
                      min: (250000 * formData.numOwners).toLocaleString('lt-LT'),
                      max: (500000 * formData.numOwners).toLocaleString('lt-LT')
                    })}</li>
                    <li>{t('calculator.explanation.proposedRateFamily3', { 
                      min: (500000 * formData.numOwners).toLocaleString('lt-LT'),
                      max: (750000 * formData.numOwners).toLocaleString('lt-LT')
                    })}</li>
                    <li>{t('calculator.explanation.proposedRateFamily4', { value: (750000 * formData.numOwners).toLocaleString('lt-LT') })}</li>
                  </>
                ) : (
                  <>
                    <li>{t('calculator.explanation.proposedRateStandard1', { value: (200000 * formData.numOwners).toLocaleString('lt-LT') })}</li>
                    <li>{t('calculator.explanation.proposedRateStandard2', { 
                      min: (200000 * formData.numOwners).toLocaleString('lt-LT'),
                      max: (400000 * formData.numOwners).toLocaleString('lt-LT')
                    })}</li>
                    <li>{t('calculator.explanation.proposedRateStandard3', { 
                      min: (400000 * formData.numOwners).toLocaleString('lt-LT'),
                      max: (600000 * formData.numOwners).toLocaleString('lt-LT')
                    })}</li>
                    <li>{t('calculator.explanation.proposedRateStandard4', { value: (600000 * formData.numOwners).toLocaleString('lt-LT') })}</li>
                  </>
                )}
              </ul>
              <p className="text-xs text-gray-500 italic mt-1">
                {t('calculator.explanation.resultBeforeExemptions', { value: formatCurrency(proposedResults.initialTax) })}
              </p>
            </>
          ) : (
            <p><strong>{t('calculator.explanation.initialStandardTaxZero')}</strong></p>
          )}
          
          {/* Primary Residence Relief */}
          {formData.primaryResidenceValue > 0 && !formData.isLowIncome ? (
            <>
              <p><strong>
                {t('calculator.explanation.primaryResidenceReliefTitle', { 
                  percent: formData.isFamilyAdjusted ? '75' : '50'
                })}
              </strong></p>
              <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
                <span className="text-gray-600 mr-2">
                  {t('calculator.explanation.estimatedReliefAmount')}
                </span>
                <span className="font-medium text-gray-900 text-right">
                  {formatCurrency(proposedResults.reliefAmount)}
                </span>
              </div>
              <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
                <span className="text-gray-600 mr-2">
                  {t('calculator.explanation.taxAfterRelief')}
                </span>
                <span className="font-medium text-gray-900 text-right">
                  {formatCurrency(Math.max(0, proposedResults.initialTax - proposedResults.reliefAmount))}
                </span>
              </div>
            </>
          ) : formData.primaryResidenceValue > 0 && formData.isLowIncome ? (
            <p className="text-xs text-gray-500 italic">
              <strong>{t('calculator.explanation.primaryResidenceReliefNotAppliedLowIncome')}</strong>
            </p>
          ) : (
            <p className="text-xs text-gray-500 italic">
              <strong>{t('calculator.explanation.primaryResidenceReliefNotAppliedNoValue')}</strong>
            </p>
          )}
          
          {/* Low Income Exemption */}
          {formData.isLowIncome && formData.primaryResidenceValue > 0 ? (
            <p><strong>{t('calculator.explanation.lowIncomeExemptionApplied')}</strong></p>
          ) : (
            <p className="text-xs text-gray-500 italic">
              <strong>{t('calculator.explanation.lowIncomeExemptionNotApplied')}</strong>
            </p>
          )}
          
          {/* Final Standard Tax */}
          <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center mt-2">
            <strong>{t('calculator.explanation.finalStandardTaxProposed')}</strong>
            <span>{formatCurrency(proposedResults.finalTax - proposedResults.abandonedTax)}</span>
          </div>
        </div>
      </div>
      
      {/* 3. Final Total Tax */}
      <h4 className="text-base font-semibold text-gray-700 mt-5 mb-2">
        {t('calculator.explanation.finalTotalTaxTitle')}
      </h4>
      <p>
        {t('calculator.explanation.finalTotalTaxDescription')}
      </p>
      
      {/* Current Rules - Final Sum */}
      <h5 className="text-sm font-semibold text-gray-600 mt-4 mb-1">
        {t('calculator.explanation.currentRulesFinalSum')}
      </h5>
      <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
        <span className="text-gray-600 mr-2">{t('calculator.explanation.taxOnAbandonedProperty')}</span>
        <span className="font-medium text-gray-900 text-right">{formatCurrency(currentResults.abandonedTax)}</span>
      </div>
      <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
        <span className="text-gray-600 mr-2">{t('calculator.explanation.plusFinalStandardTaxCurrent')}</span>
        <span className="font-medium text-gray-900 text-right">{formatCurrency(currentResults.finalTax - currentResults.abandonedTax)}</span>
      </div>
      <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center mt-2 pt-2 border-t-2 border-gray-300 font-semibold">
        <span>{t('calculator.explanation.equalsPreliminaryTotalTaxCurrent')}</span>
        <span>{formatCurrency(currentResults.abandonedTax + (currentResults.finalTax - currentResults.abandonedTax))}</span>
      </div>
      
      {/* Proposed Rules - Final Sum */}
      <h5 className="text-sm font-semibold text-gray-600 mt-4 mb-1">
        {t('calculator.explanation.proposedRulesFinalSum')}
      </h5>
      <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
        <span className="text-gray-600 mr-2">{t('calculator.explanation.taxOnAbandonedProperty')}</span>
        <span className="font-medium text-gray-900 text-right">{formatCurrency(proposedResults.abandonedTax)}</span>
      </div>
      <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center">
        <span className="text-gray-600 mr-2">{t('calculator.explanation.plusFinalStandardTaxProposed')}</span>
        <span className="font-medium text-gray-900 text-right">{formatCurrency(proposedResults.finalTax - proposedResults.abandonedTax)}</span>
      </div>
      <div className="my-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md text-sm flex justify-between items-center mt-2 pt-2 border-t-2 border-gray-300 font-semibold">
        <span>{t('calculator.explanation.equalsPreliminaryTotalTaxProposed')}</span>
        <span>{formatCurrency(proposedResults.abandonedTax + (proposedResults.finalTax - proposedResults.abandonedTax))}</span>
      </div>
      
      <p className="text-xs text-gray-500 italic mt-3">
        <strong>{t('calculator.explanation.minimumTaxRuleTitle')}</strong> {t('calculator.explanation.minimumTaxRuleDescription')}
      </p>
    </div>
  );
};

export default CalculatorExplanation;
