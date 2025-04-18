import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">Algimantas K.</Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/projects" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/projects' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
              >
                {t('nav.projects')}
              </Link>
              <Link 
                to="/calculator" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/calculator' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
              >
                {t('nav.calculator')}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <div className="md:hidden ml-2">
              <button 
                type="button" 
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-600 focus:outline-none"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/projects"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/projects' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.projects')}
          </Link>
          <Link
            to="/calculator"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/calculator' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.calculator')}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
