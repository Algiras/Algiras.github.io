import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

// Lazy load pages for better performance
const Projects = lazy(() => import('./pages/Projects'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Home = lazy(() => import('./pages/Home'))

// Layout components
import Layout from './components/Layout'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="cv" element={<Home />} />
          {/* Redirect any unknown paths to the CV page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}

export default App
