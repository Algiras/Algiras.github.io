import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useDocumentTitle(titleKey: string, defaultTitle = 'Algimantas CV') {
  const { t } = useTranslation();
  
  useEffect(() => {
    const translatedTitle = t(titleKey) || defaultTitle;
    document.title = translatedTitle;
    
    return () => {
      document.title = defaultTitle;
    };
  }, [t, titleKey, defaultTitle]);
}