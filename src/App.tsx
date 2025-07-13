// React import removed - not needed in this file
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Documents from './pages/Documents';
import Finance from './pages/Finance';
import Home from './pages/Home';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/documents" element={<Documents />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
