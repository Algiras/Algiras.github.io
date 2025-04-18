import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Dropdown from './ui/Dropdown';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Language options with proper labels
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'lt', label: 'Lietuvių' }
  ];

  // Update local state when i18n language changes externally
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  };

  return (
    <Dropdown
      options={languageOptions}
      value={currentLang}
      onChange={handleLanguageChange}
      className="w-32"
    />
  );
};

export default LanguageSwitcher;
