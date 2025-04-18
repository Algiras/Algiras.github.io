import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'

const Layout = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center py-4 text-sm">
      <p>
      © {currentYear} <a 
      href="https://algiras.github.io/" 
      className="hover:underline"
      target="_blank" 
      rel="noopener noreferrer"
      >
      algiras.github.io
      </a> | Personal CV & Tools
      </p>
      </footer>
    </div>
  )
}

export default Layout
