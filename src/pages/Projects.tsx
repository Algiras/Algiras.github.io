import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../styles/projects.css'

const Projects: React.FC = () => {
  const { t } = useTranslation()
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('projects.pageTitle')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculator Project Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden project-card">
          <div className="p-6">
            <h4 className="text-lg font-semibold mb-2 project-title">{t('projects.calculator.title')}</h4>
            <p className="mb-4 project-description">{t('projects.calculator.description')}</p>
            <Link to="/calculator" className="project-button">
              {t('projects.calculator.button')}
            </Link>
          </div>
        </div>
        
        {/* Future Projects Card */}
        <div className="bg-gray-50 border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-500 mb-2">{t('projects.more.title')}</h4>
            <p className="text-gray-500 mb-4">{t('projects.more.description')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects