import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.flat.json';
import ltTranslation from './locales/lt/translation.flat.json';

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    debug: true,
    fallbackLng: 'en',
    keySeparator: false, // Use flat keys instead of nested ones
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: enTranslation
      },
      lt: {
        translation: ltTranslation
      }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false // Prevent issues during development
    },
    saveMissing: true,
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation key: ${key} for language: ${lng} in namespace: ${ns}`);
    }
  });

// Log loaded resources for debugging
console.log('Loaded translations:', {
  en: i18n.hasResourceBundle('en', 'translation'),
  lt: i18n.hasResourceBundle('lt', 'translation'),
  currentLang: i18n.language,
  availableLanguages: i18n.languages
});

export default i18n;
