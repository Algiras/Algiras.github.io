import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from './ui/Dropdown';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Language options with localized labels
  const languageOptions = [
    { value: 'en', label: t('language.english') },
    { value: 'de', label: t('language.german') },
    { value: 'lt', label: t('language.lithuanian') },
    { value: 'ru', label: t('language.russian') }
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
      className="w-28 sm:w-32"
    />
  );
};

export default LanguageSwitcher;
