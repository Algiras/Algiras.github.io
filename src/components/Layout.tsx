import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'
import CookieConsent from './CookieConsent'

const Layout: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center py-6 text-sm">
        <p className="mb-2">
          {t('home.footer.copyright', { year: currentYear })} | {t('home.footer.rights')}
        </p>
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <a 
            href="https://github.com/Algiras" 
            className="text-indigo-300 hover:underline hover:text-indigo-200 transition-colors" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('home.footer.github')}
          </a>
          <span className="text-gray-500">|</span>
          <a 
            href="https://www.linkedin.com/in/asimplek" 
            className="text-indigo-300 hover:underline hover:text-indigo-200 transition-colors" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('home.footer.linkedin')}
          </a>
          <span className="text-gray-500">|</span>
          <a 
            href="https://algiras.github.io/" 
            className="text-indigo-300 hover:underline hover:text-indigo-200 transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >
            algiras.github.io
          </a>
          <span className="text-gray-500">|</span>
          <span>{t('layout.footer.tools')}</span>
        </p>
      </footer>
      <CookieConsent />
    </div>
  )
}

export default Layout
