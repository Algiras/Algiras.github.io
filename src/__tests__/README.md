# Test Suite

This directory contains automated tests for the financial calculator logic and core utilities.

## Test Structure

- `utils/financialCalculations.test.ts` - Tests for all financial calculation functions
  - Loan payment calculations
  - ROI calculations
  - Investment growth calculations
  - Mortgage payment calculations
  - Retirement savings calculations
  - Input validation and error handling
  - Edge cases and boundary conditions

## Test Coverage

The test suite focuses on the core business logic of the financial calculators:

### Loan Calculations

- Monthly payment calculations using amortization formula
- Total interest and payment calculations
- Extra payment scenarios
- Amortization schedule generation
- Zero interest rate handling

### ROI Calculations

- Simple ROI calculations
- Annualized ROI calculations
- Different timeframe units (days, months, years)
- Negative returns handling
- Profit/loss calculations

### Investment Growth

- Compound interest calculations
- Monthly contribution scenarios
- Inflation adjustments
- Tax implications
- Real value calculations

### Mortgage Calculations

- Principal and interest calculations
- PMI calculations for different down payment scenarios
- Property tax and insurance calculations
- Total monthly payment calculations

### Retirement Planning

- Savings projections with employer matching
- Withdrawal rate calculations
- Retirement income projections
- Replacement ratio calculations
- Long-term growth scenarios

## Running Tests

To run all tests:

```bash
yarn test
```

To run tests in watch mode:

```bash
yarn test --watch
```

To run tests with coverage:

```bash
yarn test --coverage
```

## Test Philosophy

These tests focus on:

- **Business Logic**: Core calculation accuracy
- **Input Validation**: Proper error handling for invalid inputs
- **Edge Cases**: Boundary conditions and extreme values
- **Mathematical Accuracy**: Precise financial calculations
- **Reliability**: Consistent results across different scenarios

The tests do NOT cover:

- UI components (handled by integration tests if needed)
- Chart rendering (handled by visual tests if needed)
- User interactions (handled by E2E tests if needed)
