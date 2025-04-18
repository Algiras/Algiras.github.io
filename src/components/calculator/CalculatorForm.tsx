import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';
import Button from '../ui/Button';

interface CalculatorFormProps {
  onCalculate: (formData: CalculatorFormData) => void;
}

export interface CalculatorFormData {
  primaryResidenceValue: number;
  otherPropertiesValue: number;
  abandonedValue: number;
  municipalRate: number;
  numOwners: number;
  isFamilyAdjusted: boolean;
  isLowIncome: boolean;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<CalculatorFormData>({
    primaryResidenceValue: 0,
    otherPropertiesValue: 0,
    abandonedValue: 0,
    municipalRate: 3,
    numOwners: 1,
    isFamilyAdjusted: false,
    isLowIncome: false
  });

  const [showAbandonedRate, setShowAbandonedRate] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));

      // Show abandoned rate section if abandoned value is greater than 0
      if (name === 'abandonedValue') {
        setShowAbandonedRate(numValue > 0);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4">
          {t('calculator.form.propertyValues')}
        </h3>
        
        <Input
          label={t('calculator.form.primaryResidenceValue')}
          name="primaryResidenceValue"
          type="number"
          value={formData.primaryResidenceValue || ''}
          onChange={handleInputChange}
          placeholder={t('calculator.form.enterZeroIfNone')}
          min="0"
          step="any"
          helpText={t('calculator.form.primaryResidenceHelp')}
        />
        
        <Input
          label={t('calculator.form.otherPropertiesValue')}
          name="otherPropertiesValue"
          type="number"
          value={formData.otherPropertiesValue || ''}
          onChange={handleInputChange}
          placeholder={t('calculator.form.enterZeroIfNone')}
          min="0"
          step="any"
          helpText={t('calculator.form.otherPropertiesHelp')}
        />
        
        <Input
          label={t('calculator.form.abandonedValue')}
          name="abandonedValue"
          type="number"
          value={formData.abandonedValue || ''}
          onChange={handleInputChange}
          placeholder={t('calculator.form.enterZeroIfNone')}
          min="0"
          step="any"
        />
        
        {showAbandonedRate && (
          <Input
            label={t('calculator.form.municipalRate')}
            name="municipalRate"
            type="number"
            value={formData.municipalRate || ''}
            onChange={handleInputChange}
            placeholder="e.g., 3"
            min="0.5"
            max="3"
            step="0.1"
            helpText={t('calculator.form.municipalRateHelp')}
          />
        )}
        
        <div className="definition text-xs p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-900">
          <strong>{t('calculator.form.abandonedDefinitionTitle')}</strong> {t('calculator.form.abandonedDefinitionText')}{' '}
          <a href="https://www.infolex.lt/teise/DocumentSinglePart.aspx?AktoId=41759&StrNr=2" 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-blue-600 hover:text-blue-800 underline">
            {t('calculator.form.learnMore')}
          </a>
        </div>
      </div>
      
      <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4">
          {t('calculator.form.ownershipStatus')}
        </h3>
        
        <Input
          label={t('calculator.form.numOwners')}
          name="numOwners"
          type="number"
          value={formData.numOwners || ''}
          onChange={handleInputChange}
          placeholder="e.g., 1 or 2"
          min="1"
          helpText={t('calculator.form.numOwnersHelp')}
        />
        
        <Checkbox
          label={t('calculator.form.familyAdjustment')}
          name="isFamilyAdjusted"
          checked={formData.isFamilyAdjusted}
          onChange={handleInputChange}
          helpText={t('calculator.form.familyAdjustmentHelp')}
        />
        
        <Checkbox
          label={t('calculator.form.lowIncome')}
          name="isLowIncome"
          checked={formData.isLowIncome}
          onChange={handleInputChange}
          helpText={t('calculator.form.lowIncomeHelp')}
        />
      </div>
      
      <div className="text-center pt-4">
        <Button type="submit" variant="primary">
          {t('calculator.form.calculateButton')}
        </Button>
      </div>
    </form>
  );
};

export default CalculatorForm;
