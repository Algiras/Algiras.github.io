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

// Helper component for explanation sections
const ExplanationSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h4 className="text-base font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">{title}</h4>
    <div className="space-y-2 text-xs md:text-sm">{children}</div>
  </div>
);

// Helper component for calculation rows
const CalcRow: React.FC<{ label: string; calculation?: string; result: string }> = ({ label, calculation, result }) => (
  <div className="my-1 py-1.5 px-3 bg-white border border-gray-200 rounded-md flex flex-col sm:flex-row justify-between sm:items-center">
    <span className="text-gray-600 mr-2 mb-1 sm:mb-0">{label}</span>
    {calculation && <span className="text-xs text-gray-500 mr-2 hidden md:inline">({calculation})</span>}
    <span className="font-medium text-gray-900 text-left sm:text-right">{result}</span>
  </div>
);

const CalculatorExplanation: React.FC<CalculatorExplanationProps> = ({
  formData,
  currentResults,
  proposedResults
}) => {
  const { t } = useTranslation();
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('lt-LT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('lt-LT').format(value);
  };
  
  // Calculate maintained property value (primary residence + other properties)
  const maintainedValue = formData.primaryResidenceValue + formData.otherPropertiesValue;
  
  const currentThresholdBasis = formData.isFamilyAdjusted ? 200000 : 150000;
  const proposedThresholdBasis = formData.isFamilyAdjusted ? 50000 : 40000;

  const renderTaxRates = (rates: {key: string, params?: { [key: string]: string | number }}[]) => (
    <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-gray-600">
      {rates.map((rate, index) => {
        const params = rate.params ? Object.fromEntries(
          Object.entries(rate.params).map(([key, value]) => 
            typeof value === 'number' ? [key, formatNumber(value)] : [key, value]
          )
        ) : {};
        return <li key={index}>{t(rate.key, params)}</li>;
      })}
    </ul>
  );

  return (
    <div className="mt-6 p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        {t('calculator.explanation.title')}
      </h3>
      
      {/* 1. Abandoned Property Tax */}
      <ExplanationSection title={t('calculator.explanation.abandonedPropertyTaxTitle')}>
        {formData.abandonedValue > 0 ? (
          <>
            <p>{t('calculator.explanation.abandonedPropertyTaxDescription', { value: formatCurrency(formData.abandonedValue), rate: formData.municipalRate.toFixed(1) })}</p>
            <CalcRow
              label={t('calculator.explanation.abandonedValueFormula', { rate: formData.municipalRate.toFixed(1) })}
              calculation={`${formatCurrency(formData.abandonedValue)} × (${formData.municipalRate.toFixed(1)}% / 100)`}
              result={`= ${formatCurrency(currentResults.abandonedTax)}`}
            />
          </>
        ) : (
          <p className="text-gray-500 italic">{t('calculator.explanation.noAbandonedProperty')}</p>
        )}
      </ExplanationSection>
      
      {/* 2. Standard Tax Calculation Comparison */}
      <p className="mb-4 text-sm text-center text-gray-700">
        {t('calculator.explanation.maintainedPropertyComparison', { value: formatCurrency(maintainedValue) })}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Rules Column */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 text-center border-b border-indigo-100 pb-2">
            {t('calculator.explanation.currentRulesTitle')}
          </h4>
          
          <ExplanationSection title={t('calculator.explanation.thresholdTitle')}>
            <CalcRow
              label={t('calculator.explanation.individualThreshold', {
                type: formData.isFamilyAdjusted ? t('calculator.explanation.familyAdjusted') : t('calculator.explanation.standard'),
                value: formData.isFamilyAdjusted ? '200k' : '150k'
              })}
              result={formatCurrency(currentThresholdBasis)}
            />
            <CalcRow
              label={t('calculator.explanation.totalThreshold')}
              calculation={`${formatCurrency(currentThresholdBasis)} × ${formData.numOwners}`}
              result={`= ${formatCurrency(currentResults.threshold)}`}
            />
          </ExplanationSection>
          
          <ExplanationSection title={t('calculator.explanation.taxableBaseTitle')}>
            <CalcRow
              label={t('calculator.explanation.taxableBaseFormula')}
              calculation={`Max(0, ${formatCurrency(maintainedValue)} - ${formatCurrency(currentResults.threshold)})`}
              result={`= ${formatCurrency(currentResults.taxableBase)}`}
            />
          </ExplanationSection>
          
          {currentResults.taxableBase > 0 ? (
            <ExplanationSection title={t('calculator.explanation.initialStandardTaxTitle')}>
              {renderTaxRates([
                { key: 'calculator.explanation.currentRate1' },
                { key: 'calculator.explanation.currentRate2' },
                { key: 'calculator.explanation.currentRate3' }
              ])}
              <p className="text-xs text-gray-500 italic mt-2">
                {t('calculator.explanation.resultBeforeExemptions', { value: formatCurrency(currentResults.initialTax) })}
              </p>
            </ExplanationSection>
          ) : (
            <ExplanationSection title={t('calculator.explanation.initialStandardTaxTitle')}>
              <p className="text-gray-500 italic">{t('calculator.explanation.initialStandardTaxZero')}</p>
            </ExplanationSection>
          )}
          
          <ExplanationSection title={t('calculator.explanation.lowIncomeExemption')}>
            {formData.isLowIncome && formData.primaryResidenceValue > 0 ? (
              <p className="text-green-600 italic">{t('calculator.explanation.lowIncomeExemptionApplied')}</p>
            ) : (
              <p className="text-gray-500 italic">
                <strong>{t('calculator.explanation.lowIncomeExemptionNotApplied')}</strong>
              </p>
            )}
          </ExplanationSection>
          
          <ExplanationSection title={t('calculator.explanation.finalTax')}>
            <CalcRow
              label={t('calculator.explanation.finalStandardTaxCurrent')}
              result={formatCurrency(currentResults.finalTax - currentResults.abandonedTax)}
            />
            {currentResults.minimumTaxRuleApplied && <p className="text-xs text-green-600 italic text-right">{t('calculator.results.minimumTaxNote')}</p>}
          </ExplanationSection>
        </div>
        
        {/* Proposed Rules Column */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 text-center border-b border-indigo-100 pb-2">
            {t('calculator.explanation.proposedRulesTitle')}
          </h4>
          
          <ExplanationSection title={t('calculator.explanation.thresholdTitle')}>
            <CalcRow
              label={t('calculator.explanation.individualThreshold', {
                type: formData.isFamilyAdjusted ? t('calculator.explanation.familyAdjusted') : t('calculator.explanation.standard'),
                value: formData.isFamilyAdjusted ? '50k' : '40k'
              })}
              result={formatCurrency(proposedThresholdBasis)}
            />
            <CalcRow
              label={t('calculator.explanation.totalThreshold')}
              calculation={`${formatCurrency(proposedThresholdBasis)} × ${formData.numOwners}`}
              result={`= ${formatCurrency(proposedResults.threshold)}`}
            />
          </ExplanationSection>
          
          <ExplanationSection title={t('calculator.explanation.taxableBaseTitle')}>
            <CalcRow
              label={t('calculator.explanation.taxableBaseFormula')}
              calculation={`Max(0, ${formatCurrency(maintainedValue)} - ${formatCurrency(proposedResults.threshold)})`}
              result={`= ${formatCurrency(proposedResults.taxableBase)}`}
            />
          </ExplanationSection>
          
          {proposedResults.taxableBase > 0 ? (
            <ExplanationSection title={t('calculator.explanation.initialStandardTaxTitle')}>
              {renderTaxRates([
                { key: 'calculator.explanation.proposedRateStandard1' },
                { key: 'calculator.explanation.proposedRateStandard2' },
                { key: 'calculator.explanation.proposedRateStandard3' },
                { key: 'calculator.explanation.proposedRateStandard4' }
              ])}
              <p className="text-xs text-gray-500 italic mt-2">
                {t('calculator.explanation.resultBeforeExemptions', { value: formatCurrency(proposedResults.initialTax) })}
              </p>
            </ExplanationSection>
          ) : (
            <ExplanationSection title={t('calculator.explanation.initialStandardTaxTitle')}>
              <p className="text-gray-500 italic">{t('calculator.explanation.initialStandardTaxZero')}</p>
            </ExplanationSection>
          )}
          
          {formData.primaryResidenceValue > 0 && proposedResults.reliefAmount > 0 && (
            <ExplanationSection title={t('calculator.explanation.primaryResidenceReliefTitle')}>
              <p>{t('calculator.explanation.primaryResidenceReliefDescription', { primaryValue: formatCurrency(formData.primaryResidenceValue) })}</p>
              <CalcRow
                label={t('calculator.explanation.estimatedReliefAmount')}
                result={formatCurrency(proposedResults.reliefAmount)}
              />
            </ExplanationSection>
          )}
          
          <ExplanationSection title={t('calculator.explanation.lowIncomeExemption')}>
            {formData.isLowIncome && formData.primaryResidenceValue > 0 ? (
              <p className="text-green-600 italic">{t('calculator.explanation.lowIncomeExemptionApplied')}</p>
            ) : (
              <p className="text-gray-500 italic">
                <strong>{t('calculator.explanation.lowIncomeExemptionNotApplied')}</strong>
              </p>
            )}
          </ExplanationSection>
          
          <ExplanationSection title={t('calculator.explanation.finalTax')}>
            <CalcRow
              label={t('calculator.explanation.finalStandardTaxProposed')}
              result={formatCurrency(proposedResults.finalTax - proposedResults.abandonedTax)}
            />
            {proposedResults.minimumTaxRuleApplied && <p className="text-xs text-green-600 italic text-right">{t('calculator.results.minimumTaxNote')}</p>}
          </ExplanationSection>
        </div>
      </div>
      
      {/* 3. Final Total Tax */}
      <ExplanationSection title={t('calculator.explanation.finalTaxCalculationTitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CalcRow
            label={t('calculator.explanation.totalFinalTax') + ` (${t('calculator.explanation.currentRulesTitle')})`}
            calculation={`${formatCurrency(currentResults.abandonedTax)} + ${formatCurrency(currentResults.finalTax - currentResults.abandonedTax)}`}
            result={`= ${formatCurrency(currentResults.finalTax)}`}
          />
          <CalcRow
            label={t('calculator.explanation.totalFinalTax') + ` (${t('calculator.explanation.proposedRulesTitle')})`}
            calculation={`${formatCurrency(proposedResults.abandonedTax)} + ${formatCurrency(proposedResults.finalTax - proposedResults.abandonedTax)}`}
            result={`= ${formatCurrency(proposedResults.finalTax)}`}
          />
        </div>
      </ExplanationSection>
    </div>
  );
};

export default CalculatorExplanation;
