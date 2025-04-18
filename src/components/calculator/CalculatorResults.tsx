import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { CalculatorFormData } from './CalculatorForm';

interface CalculatorResultsProps {
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
  onShowExplanation: () => void;
}

const CalculatorResults: React.FC<CalculatorResultsProps> = ({
  formData,
  currentResults,
  proposedResults,
  onShowExplanation
}) => {
  const { t } = useTranslation();
  
  // Calculate the difference between current and proposed tax
  const taxDifference = proposedResults.finalTax - currentResults.finalTax;
  const percentChange = currentResults.finalTax > 0 
    ? (taxDifference / currentResults.finalTax) * 100 
    : proposedResults.finalTax > 0 ? 100 : 0;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  return (
    <div className="result-section">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        {t('calculator.results.title')}
      </h2>
      
      {/* Input Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2 text-center">
          {t('calculator.results.inputSummary')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <span>
            {t('calculator.results.primaryResidence')}: <strong>{formatCurrency(formData.primaryResidenceValue)}</strong>
          </span>
          <span>
            {t('calculator.results.otherProperties')}: <strong>{formatCurrency(formData.otherPropertiesValue)}</strong>
          </span>
          <span>
            {t('calculator.results.abandonedProperty')}: <strong>{formatCurrency(formData.abandonedValue)}</strong>
          </span>
          {formData.abandonedValue > 0 && (
            <span>
              {t('calculator.results.municipalRate')}: <strong>{formData.municipalRate}%</strong>
            </span>
          )}
          <span>
            {t('calculator.results.owners')}: <strong>{formData.numOwners}</strong>
          </span>
          <span>
            {t('calculator.results.familyAdjustment')}: <strong>{formData.isFamilyAdjusted ? t('common.yes') : t('common.no')}</strong>
          </span>
          <span>
            {t('calculator.results.lowIncome')}: <strong>{formData.isLowIncome ? t('common.yes') : t('common.no')}</strong>
          </span>
          <span>
            {t('calculator.results.totalValue')}: <strong>
              {formatCurrency(formData.primaryResidenceValue + formData.otherPropertiesValue + formData.abandonedValue)}
            </strong>
          </span>
        </div>
      </div>
      
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Rules Column */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3 border-b border-indigo-200 pb-2">
            {t('calculator.results.currentRules')}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.abandonedTax')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(currentResults.abandonedTax)}</span>
            </div>
            
            <hr className="my-1 border-gray-100" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-gray-500 italic">{t('calculator.results.standardTaxLabel')}</span>
              <span className="text-value"></span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.valueConsidered')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {formatCurrency(formData.primaryResidenceValue + formData.otherPropertiesValue)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.threshold')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(currentResults.threshold)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.taxableBase')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(currentResults.taxableBase)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.standardTax')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(currentResults.initialTax)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.lowIncomeExemption')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {currentResults.lowIncomeExemption ? t('common.applied') : t('common.notApplied')}
              </span>
            </div>
            
            <hr className="my-1 border-gray-100" />
            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
              <span className="text-base font-semibold text-gray-800">{t('calculator.results.finalTax')}:</span>
              <span className="text-base font-bold text-indigo-700 text-right">{formatCurrency(currentResults.finalTax)}</span>
            </div>
            
            {currentResults.minimumTaxRuleApplied && (
              <div className="text-xs text-green-600 text-right pt-1">{t('calculator.results.minimumTaxNote')}</div>
            )}
            
            {currentResults.lowIncomeExemption && (
              <div className="text-xs text-green-600 text-right pt-1">{t('calculator.results.lowIncomeNote')}</div>
            )}
          </div>
        </div>
        
        {/* Proposed Rules Column */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3 border-b border-indigo-200 pb-2">
            {t('calculator.results.proposedRules')}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.abandonedTax')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(proposedResults.abandonedTax)}</span>
            </div>
            
            <hr className="my-1 border-gray-100" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-gray-500 italic">{t('calculator.results.standardTaxLabel')}</span>
              <span className="text-value"></span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.valueConsidered')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {formatCurrency(formData.primaryResidenceValue + formData.otherPropertiesValue)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.threshold')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(proposedResults.threshold)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.taxableBase')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(proposedResults.taxableBase)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.taxBeforeRelief')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(proposedResults.initialTax)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.primaryResidenceRelief')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">{formatCurrency(proposedResults.reliefAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs text-gray-600 mr-2">{t('calculator.results.lowIncomeExemption')}:</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {proposedResults.lowIncomeExemption ? t('common.applied') : t('common.notApplied')}
              </span>
            </div>
            
            <hr className="my-1 border-gray-100" />
            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
              <span className="text-base font-semibold text-gray-800">{t('calculator.results.finalTax')}:</span>
              <span className="text-base font-bold text-indigo-700 text-right">{formatCurrency(proposedResults.finalTax)}</span>
            </div>
            
            {proposedResults.minimumTaxRuleApplied && (
              <div className="text-xs text-green-600 text-right pt-1">{t('calculator.results.minimumTaxNote')}</div>
            )}
            
            {proposedResults.lowIncomeExemption && (
              <div className="text-xs text-green-600 text-right pt-1">{t('calculator.results.lowIncomeNote')}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tax Change Summary */}
      {(currentResults.finalTax > 0 || proposedResults.finalTax > 0) && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
          <h3 className="text-base font-semibold text-indigo-800 mb-1">
            {t('calculator.results.estimatedChange')}
          </h3>
          <span className="text-lg font-bold text-indigo-900">
            {taxDifference >= 0 ? '+' : ''}{formatCurrency(taxDifference)}
          </span>
          <span className="block text-sm text-indigo-700">
            ({taxDifference >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
          </span>
        </div>
      )}
      
      {/* Explanation Button */}
      <div className="text-center mt-8">
        <Button 
          variant="secondary" 
          onClick={onShowExplanation}
        >
          {t('calculator.results.showExplanation')}
        </Button>
      </div>
    </div>
  );
};

export default CalculatorResults;
