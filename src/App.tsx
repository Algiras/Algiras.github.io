// React import removed - not needed in this file
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
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


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
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
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
