import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorFormData } from './CalculatorForm';
import { singleOwnerExamples, coOwnershipExamples } from '../../data/calculatorExamples';

interface CalculatorExamplesProps {
  onSelectExample: (data: CalculatorFormData, autoSubmit: boolean) => void;
}

const CalculatorExamples: React.FC<CalculatorExamplesProps> = ({ onSelectExample }) => {
  const { t } = useTranslation();

  const handleExampleClick = (data: CalculatorFormData) => {
    onSelectExample(data, true); // Pass true to auto-submit the form
    // Scroll to top where the form is located
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{t('calculator.explanation.multipleOwnersExamplesTitle')}</h4>
      
      {/* Multiple Owners Examples */}
      <div className="mb-6 p-3 rounded-md">
        <h5 className="font-semibold mb-2">{t('calculator.explanation.multipleOwnersTitle')}</h5>
        <p className="text-xs text-gray-700">{t('calculator.explanation.multipleOwnersDescription')}</p>
        
        {coOwnershipExamples.map((example) => (
          <div 
            key={example.id}
            className="mt-3 mb-3 p-2 bg-white border border-blue-100 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => handleExampleClick(example.data)}
            role="button"
            tabIndex={0}
            aria-label={t('calculator.examples.tryExample', { example: t(example.title, example.title) })}
          >
            <h6 className="font-medium text-blue-700">{t(example.title, example.title)}</h6>
            <p className="text-sm">{t(example.description, example.description)}</p>
            <div className="mt-1 text-xs text-indigo-600 font-medium">
              {t('calculator.examples.clickToTry')} →
            </div>
          </div>
        ))}
      </div>
      
      {/* Single Owner Examples */}
      <div className="mb-6 p-3 rounded-md">
        <h5 className="font-semibold mb-2">{t('calculator.explanation.singleOwnerExamplesTitle')}</h5>
        <p className="text-xs text-gray-700">{t('calculator.explanation.singleOwnerExamplesDescription')}</p>
        <p className="text-xs font-medium text-gray-700 mt-2">{t('calculator.explanation.singleOwnerExamplesSubtitle')}</p>
        
        {singleOwnerExamples.map((example) => (
          <div 
            key={example.id}
            className="mt-3 mb-3 p-2 bg-white border border-green-100 rounded-md hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer"
            onClick={() => handleExampleClick(example.data)}
            role="button"
            tabIndex={0}
            aria-label={t('calculator.examples.tryExample', { example: t(example.title, example.title) })}
          >
            <h6 className="font-medium text-green-700">{t(example.title, example.title)}</h6>
            <p className="text-sm">{t(example.description, example.description)}</p>
            <div className="mt-1 text-xs text-green-600 font-medium">
              {t('calculator.examples.clickToTry')} →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorExamples;