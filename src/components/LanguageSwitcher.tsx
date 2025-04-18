import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'lt' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  return (
    <button 
      onClick={toggleLanguage} 
      className="px-3 py-1 border border-white rounded-md text-sm hover:bg-indigo-600"
    >
      {t('nav.language')}
    </button>
  );
};

export default LanguageSwitcher;
