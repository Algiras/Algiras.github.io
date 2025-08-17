// React import removed - not needed in this file
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import RouteTransition from './components/RouteTransition';
import Documents from './pages/Documents';
import Finance from './pages/Finance';
import Home from './pages/Home';
import InvestmentCalculator from './components/projects/InvestmentCalculator';
import { InvestmentTracker } from './components/projects/investment-tracker';
import LoanComparison from './components/projects/LoanComparison';
import MortgageCalculator from './components/projects/MortgageCalculator';
import RetirementPlanner from './components/projects/RetirementPlanner';
import ROICalculator from './components/projects/ROICalculator';
import FinanceToolWrapper from './components/FinanceToolWrapper';
import MarkdownToPDF from './components/documents/MarkdownToPDF';
import DocumentToolWrapper from './components/DocumentToolWrapper';
import Games from './pages/Games';
import GameToolWrapper from './components/GameToolWrapper';
import Akotchi from './games/akotchi/Akotchi';
import AIPage from './pages/AI';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <RouteTransition />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/investment-calculator" element={
              <FinanceToolWrapper><InvestmentCalculator /></FinanceToolWrapper>
            } />
            <Route path="/finance/investment-tracker" element={
              <FinanceToolWrapper useContainer={false}><InvestmentTracker /></FinanceToolWrapper>
            } />
            <Route path="/finance/loan-comparison" element={
              <FinanceToolWrapper useContainer={false}><LoanComparison /></FinanceToolWrapper>
            } />
            <Route path="/finance/mortgage-calculator" element={
              <FinanceToolWrapper><MortgageCalculator /></FinanceToolWrapper>
            } />
            <Route path="/finance/retirement-planner" element={
              <FinanceToolWrapper><RetirementPlanner /></FinanceToolWrapper>
            } />
            <Route path="/finance/roi-calculator" element={
              <FinanceToolWrapper><ROICalculator /></FinanceToolWrapper>
            } />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/markdown-to-pdf" element={
              <DocumentToolWrapper><MarkdownToPDF /></DocumentToolWrapper>
            } />
            <Route path="/games" element={<Games />} />
            <Route path="/games/akotchi" element={
              <GameToolWrapper><Akotchi /></GameToolWrapper>
            } />
            <Route path="/games/akotchi/share" element={
              <GameToolWrapper><Akotchi /></GameToolWrapper>
            } />
            <Route path="/ai" element={<AIPage />} />
            {/* 404 Route - Catch all invalid URLs */}
            <Route path="*" element={
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0', color: 'var(--mantine-color-red-6)' }}>404</h1>
                <h2 style={{ margin: '0 0 1rem 0' }}>Page Not Found</h2>
                <p style={{ margin: '0 0 2rem 0', color: 'var(--mantine-color-dimmed)' }}>
                  The page you're looking for doesn't exist.
                </p>
                <Link 
                  to="/" 
                  style={{ 
                    textDecoration: 'none',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--mantine-color-blue-6)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 500,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-6)';
                  }}
                >
                  Go Home
                </Link>
              </div>
            } />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
