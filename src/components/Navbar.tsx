import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const location = useLocation()
  const { t } = useTranslation()
  
  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">Algimantas K.</Link>
            </div>
            <div className="ml-6 flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
