import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Finance from './pages/Finance';
import Documents from './pages/Documents';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
