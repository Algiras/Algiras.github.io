import React from 'react';
import { useTranslation } from 'react-i18next';

const CalculatorDisclaimer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-6 text-xs text-gray-600">
      <strong>{t('calculator.disclaimer.title')}</strong> {t('calculator.disclaimer.subtitle')}
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>{t('calculator.disclaimer.point1')}</li>
        <li>{t('calculator.disclaimer.point2')}</li>
        <li>{t('calculator.disclaimer.point3')}</li>
        <li>{t('calculator.disclaimer.point4')}</li>
        <li>{t('calculator.disclaimer.point5')}</li>
      </ul>
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('calculator.resources.title')}</h4>
                <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>{t('calculator.resources.findingValue.title')}</strong> {t('calculator.resources.findingValue.description')} 
            <a href="https://www.registrucentras.lt/savitarna/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {t('calculator.resources.findingValue.link')}
            </a>
          </li>
          <li>
            <strong>{t('calculator.resources.vmi.title')}</strong> {t('calculator.resources.vmi.description')} 
            <a href="https://www.vmi.lt/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {t('calculator.resources.vmi.link')}
            </a>
          </li>
          <li>
            <strong>{t('calculator.resources.finmin.title')}</strong> {t('calculator.resources.finmin.description')} 
            <a href="https://finmin.lrv.lt/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {t('calculator.resources.finmin.link')}
            </a>
            {t('calculator.resources.finmin.additionalText')} 
            <a href="https://finmin.lrv.lt/lt/aktualus-valstybes-finansu-duomenys/mokestiniu-pasiulymu-paketas/nt-duk/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {t('calculator.resources.finmin.additionalLink')}
            </a>
          </li>
          <li>
            <strong>{t('calculator.resources.law.title')}</strong> {t('calculator.resources.law.description')} 
            <a href="https://www.e-tar.lt/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {t('calculator.resources.law.link')}
            </a>
          </li>
          <li>
            <strong>{t('calculator.resources.article.title')}</strong> 
            <a href="https://www.lrt.lt/naujienos/verslas/4/2538574/naujasis-nt-mokescio-projektas-kiek-tektu-susimoketi-uz-busta" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {t('calculator.resources.article.link')}
            </a>
          </li>
          <li>
            <strong>{t('calculator.resources.municipality.title')}</strong> {t('calculator.resources.municipality.description')}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CalculatorDisclaimer;
