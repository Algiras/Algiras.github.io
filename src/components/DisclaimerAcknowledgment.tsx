import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';

interface DisclaimerAcknowledgmentProps {
  onAccept: () => void;
}

const DisclaimerAcknowledgment: React.FC<DisclaimerAcknowledgmentProps> = ({ onAccept }) => {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{t('calculator.disclaimer.title')}</h2>
      <div className="text-sm text-gray-700 mb-6">
        <p className="mb-3">{t('calculator.disclaimer.notFinancialAdvice')}</p>
        <p className="mb-3">{t('calculator.disclaimer.personalTool')}</p>
        <p>{t('calculator.disclaimer.developerNote')} <a 
          href="https://github.com/Algiras/Algiras.github.io" 
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >{t('calculator.disclaimer.submitPR')}</a></p>
      </div>
      
      <div className="mb-4">
        <Checkbox
          id="disclaimer-check"
          label={t('calculator.disclaimer.acknowledgment')}
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
      </div>
      
      <Button
        disabled={!isChecked}
        onClick={onAccept}
      >
        {t('calculator.disclaimer.proceed')}
      </Button>
    </div>
  );
};

export default DisclaimerAcknowledgment;