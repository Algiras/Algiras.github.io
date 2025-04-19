import { CalculatorFormData } from '../components/calculator/CalculatorForm';

/**
 * Example data for the calculator
 * These examples match the test cases and official documentation
 */

// Helper function to create form data with default values
export const createExampleData = (props: Partial<CalculatorFormData>): CalculatorFormData => ({
  primaryResidenceValue: 0,
  otherPropertiesValue: 0,
  abandonedValue: 0,
  municipalRate: 3,
  numOwners: 1,
  isFamilyAdjusted: false,
  isLowIncome: false,
  ...props
});

// Single owner examples
export const singleOwnerExamples = [
  {
    id: 'single-example-1',
    title: 'calculator.explanation.singleExample1Title',
    description: 'calculator.explanation.singleExample1Description',
    data: createExampleData({
      primaryResidenceValue: 110000,
      otherPropertiesValue: 50000,
      numOwners: 1
    })
  },
  {
    id: 'single-example-2',
    title: 'calculator.explanation.singleExample2Title',
    description: 'calculator.explanation.singleExample2Description',
    data: createExampleData({
      primaryResidenceValue: 300000,
      otherPropertiesValue: 50000,
      numOwners: 1
    })
  }
];

// Co-ownership examples
export const coOwnershipExamples = [
  {
    id: 'co-ownership-example-1',
    title: 'calculator.explanation.example1Title',
    description: 'calculator.explanation.example1Description',
    data: createExampleData({
      primaryResidenceValue: 70000,
      otherPropertiesValue: 0,
      numOwners: 2
    })
  },
  {
    id: 'co-ownership-example-2',
    title: 'calculator.explanation.example2Title',
    description: 'calculator.explanation.example2Description',
    data: createExampleData({
      primaryResidenceValue: 110000,
      otherPropertiesValue: 0,
      numOwners: 2
    })
  },
  {
    id: 'co-ownership-example-3',
    title: 'calculator.explanation.example3Title',
    description: 'calculator.explanation.example3Description',
    data: createExampleData({
      primaryResidenceValue: 300000,
      otherPropertiesValue: 0,
      numOwners: 2
    })
  }
];

// All examples combined
export const allExamples = [...singleOwnerExamples, ...coOwnershipExamples];
