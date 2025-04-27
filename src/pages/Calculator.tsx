import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../utils/documentUtils';
import CalculatorForm, { CalculatorFormData } from '../components/calculator/CalculatorForm';
import CalculatorResults from '../components/calculator/CalculatorResults';
import CalculatorExplanation from '../components/calculator/CalculatorExplanation';
import CalculatorDisclaimer from '../components/calculator/CalculatorDisclaimer';
import CalculatorExamples from '../components/calculator/CalculatorExamples';
import DisclaimerAcknowledgment from '../components/DisclaimerAcknowledgment';
import { calculateCurrentTax, calculateProposedTax } from '../utils/taxCalculator';

const Calculator: React.FC = () => {
  const { t } = useTranslation();
  useDocumentTitle('document.title.calculator');
  
  // State for disclaimer acceptance
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // State for form data and calculation results
  const [formData, setFormData] = useState<CalculatorFormData | null>(null);
  const [currentResults, setCurrentResults] = useState<ReturnType<typeof calculateCurrentTax> | null>(null);
  const [proposedResults, setProposedResults] = useState<ReturnType<typeof calculateProposedTax> | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Reference to the form section for scrolling
  const formRef = useRef<HTMLDivElement>(null);
  
  // State for selected example data
  const [selectedExampleData, setSelectedExampleData] = useState<CalculatorFormData | null>(null);
  
  // Handle form submission and calculate results
  const handleCalculate = (data: CalculatorFormData) => {
    setFormData(data);
    const current = calculateCurrentTax(data);
    const proposed = calculateProposedTax(data);
    
    setCurrentResults(current);
    setProposedResults(proposed);
    setShowExplanation(false); // Reset to results view
  };
  
  // Handle example selection
  const handleExampleSelect = (data: CalculatorFormData, autoSubmit: boolean = false) => {
    setSelectedExampleData(data);
    setFormData(null); // Reset any previous results
    setCurrentResults(null);
    setProposedResults(null);
    
    // Scroll to the form section
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Auto-submit the form if requested
    if (autoSubmit) {
      // Use setTimeout to ensure the form is rendered with the new data before submitting
      setTimeout(() => {
        handleCalculate(data);
      }, 100);
    }
  };
  
  // Toggle between results and explanation
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };
  
  // If disclaimer hasn't been accepted, show the disclaimer first
  if (!disclaimerAccepted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('calculator.title')}</h1>
        <p className="text-sm text-center text-gray-600 mb-8">{t('calculator.subtitle')}</p>
        
        <DisclaimerAcknowledgment onAccept={() => setDisclaimerAccepted(true)} />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('calculator.title')}</h1>
      <p className="text-sm text-center text-gray-600 mb-8">{t('calculator.subtitle')}</p>
      
      <div ref={formRef} className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
        {/* Show form if no results yet */}
        {!formData && (
          <CalculatorForm 
            onCalculate={handleCalculate} 
            initialData={selectedExampleData} 
          />
        )}
        
        {/* Show results or explanation if we have calculated data */}
        {formData && currentResults && proposedResults && (
          <>
            {showExplanation ? (
              <>
                <CalculatorExplanation 
                  formData={formData} 
                  currentResults={currentResults} 
                  proposedResults={proposedResults} 
                />
                <div className="mt-6 text-center">
                  <button 
                    onClick={toggleExplanation}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    ← {t('calculator.explanation.backToResults')}
                  </button>
                </div>
              </>
            ) : (
              <CalculatorResults 
                formData={formData} 
                currentResults={currentResults} 
                proposedResults={proposedResults} 
                onShowExplanation={toggleExplanation} 
              />
            )}
            
            {/* Option to recalculate */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <button 
                onClick={() => {
                  setFormData(null);
                  setCurrentResults(null);
                  setProposedResults(null);
                }}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                {t('calculator.results.recalculate')}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Examples */}
      <CalculatorExamples onSelectExample={handleExampleSelect} />
      
      {/* Disclaimer */}
      <CalculatorDisclaimer />
    </div>
  );
};

export default Calculator;
