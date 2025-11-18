// React import removed - not needed in this file
import { HashRouter as Router, Link, Route, Routes } from 'react-router-dom';
import MarkdownToPDF from './components/documents/MarkdownToPDF';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import DebtPayoffCalculator from './components/projects/DebtPayoffCalculator';
import { InvestmentTracker } from './components/projects/investment-tracker';
import InvestmentCalculator from './components/projects/InvestmentCalculator';
import LoanComparison from './components/projects/LoanComparison';
import MortgageCalculator from './components/projects/MortgageCalculator';
import RefinanceCalculator from './components/projects/RefinanceCalculator';
import RetirementPlanner from './components/projects/RetirementPlanner';
import ROICalculator from './components/projects/ROICalculator';
import RouteTransition from './components/RouteTransition';
import ScrollToTop from './components/ScrollToTop';
import ToolWrapper from './components/ToolWrapper';
import Akotchi from './games/akotchi/Akotchi';
import Documents from './pages/Documents';
import Finance from './pages/Finance';
import Games from './pages/Games';
import Home from './pages/Home';

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
            <Route
              path="/finance/investment-calculator"
              element={
                <ToolWrapper category="finance">
                  <InvestmentCalculator />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/investment-tracker"
              element={
                <ToolWrapper category="finance" useContainer={false}>
                  <InvestmentTracker />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/loan-comparison"
              element={
                <ToolWrapper category="finance" useContainer={false}>
                  <LoanComparison />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/mortgage-calculator"
              element={
                <ToolWrapper category="finance">
                  <MortgageCalculator />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/retirement-planner"
              element={
                <ToolWrapper category="finance">
                  <RetirementPlanner />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/roi-calculator"
              element={
                <ToolWrapper category="finance">
                  <ROICalculator />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/debt-payoff"
              element={
                <ToolWrapper category="finance">
                  <DebtPayoffCalculator />
                </ToolWrapper>
              }
            />
            <Route
              path="/finance/refinance"
              element={
                <ToolWrapper category="finance">
                  <RefinanceCalculator />
                </ToolWrapper>
              }
            />
            <Route path="/documents" element={<Documents />} />
            <Route
              path="/documents/markdown-to-pdf"
              element={
                <ToolWrapper category="documents">
                  <MarkdownToPDF />
                </ToolWrapper>
              }
            />
            <Route path="/games" element={<Games />} />
            <Route
              path="/games/akotchi"
              element={
                <ToolWrapper category="games">
                  <Akotchi />
                </ToolWrapper>
              }
            />
            <Route
              path="/games/akotchi/share"
              element={
                <ToolWrapper category="games">
                  <Akotchi />
                </ToolWrapper>
              }
            />
            {/* 404 Route - Catch all invalid URLs */}
            <Route
              path="*"
              element={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    padding: '2rem',
                  }}
                >
                  <h1
                    style={{
                      fontSize: '4rem',
                      margin: '0 0 1rem 0',
                      color: 'var(--mantine-color-red-6)',
                    }}
                  >
                    404
                  </h1>
                  <h2 style={{ margin: '0 0 1rem 0' }}>Page Not Found</h2>
                  <p
                    style={{
                      margin: '0 0 2rem 0',
                      color: 'var(--mantine-color-dimmed)',
                    }}
                  >
                    The page you&apos;re looking for doesn&apos;t exist.
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
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor =
                        'var(--mantine-color-blue-7)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor =
                        'var(--mantine-color-blue-6)';
                    }}
                  >
                    Go Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
