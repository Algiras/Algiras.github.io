import React from 'react';
import '../styles/cv.css';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="cv-page max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-xl shadow-xl my-8">
      <header className="text-center mb-16 border-b border-slate-200 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-3">{t('cv.title')}</h1>
        <p className="text-xl md:text-2xl text-slate-600">{t('cv.subtitle')}</p>
      </header>

      <section id="contact" className="mb-10">
        <h2><i className="fas fa-address-book"></i>{t('cv.sections.contact')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-slate-700">

          <div className="flex items-center contact-item">
            <i className="fab fa-linkedin fa-fw"></i>
            <a href="https://www.linkedin.com/in/asimplek" target="_blank" rel="noopener noreferrer">linkedin.com/in/asimplek</a>
          </div>
          <div className="flex items-center contact-item">
            <i className="fab fa-medium fa-fw"></i>
            <a href="https://medium.com/@AlgimantasKras1" target="_blank" rel="noopener noreferrer">medium.com/@AlgimantasKras1</a>
          </div>
          <div className="flex items-center contact-item">
            <i className="fab fa-facebook fa-fw"></i>
            <a href="https://www.facebook.com/algimantask" target="_blank" rel="noopener noreferrer">{t('contact.facebook')}</a>
          </div>
          <div className="flex items-center contact-item">
            <i className="fas fa-map-marker-alt fa-fw"></i>
            <span>{t('cv.contact.location')}</span>
          </div>
        </div>
      </section>
      <section id="programming-interests" className="mb-10">
        <h2><i className="fas fa-code"></i>{t('cv.sections.programming')}</h2>
        <p className="text-slate-700 leading-relaxed text-base mb-4">
          {t('cv.programming.general')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              <i className="fas fa-project-diagram mr-2"></i>
              {t('cv.programming.functional.title')}
            </h3>
            <p className="text-slate-700">{t('cv.programming.functional.description')}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              <i className="fas fa-robot mr-2"></i>
              {t('cv.programming.ai.title')}
            </h3>
            <p className="text-slate-700">{t('cv.programming.ai.description')}</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
