# Lithuanian Real Estate Tax Calculator Test Suite

## Overview
This test suite validates the tax calculation logic for both the current (2023-2025) and proposed (2026+) Lithuanian real estate tax systems. The tests ensure that the calculator correctly implements the tax rules as defined in the Lithuanian legislation.

## Test Structure

The test suite is organized into two main files:

1. `currentTaxSystem.test.ts` - Tests for the current tax system (valid until end of 2025)
2. `proposedTaxSystem.test.ts` - Tests for the proposed tax system (from 2026 onwards)

Each file contains comprehensive test cases covering:
- Threshold calculations
- Progressive rate calculations
- Family adjustment calculations
- Primary residence relief (for proposed system)
- Low income exemptions
- Minimum tax rule application
- Abandoned property tax calculations

## Tax Rules Implementation

### Current System (2023-2025)

- **Thresholds**:
  - Standard: €150,000 per property portfolio
  - Family-adjusted: €200,000 per property portfolio (for families with 3+ children or disabled child)

- **Progressive Rates**:
  - 0.5% on value exceeding threshold up to €300,000 (or €390,000 for family-adjusted)
  - 1.0% on value between €300,001-€500,000 (or €390,001-€650,000 for family-adjusted)
  - 2.0% on value exceeding €500,000 (or €650,000 for family-adjusted)

- **Minimum Tax**: €5 (tax is not collected if below this amount)

### Proposed System (2026+)

- **Thresholds**:
  - Standard: €40,000 per person
  - Family-adjusted: €50,000 per person (for families with 3+ children or disabled child)

- **Progressive Rates**:
  - 0.1% on value from threshold to €200,000 (or €250,000 for family-adjusted)
  - 0.2% on value from €200,001 to €400,000 (or €250,001 to €500,000 for family-adjusted)
  - 0.5% on value from €400,001 to €600,000 (or €500,001 to €750,000 for family-adjusted)
  - 1.0% on value exceeding €600,000 (or €750,000 for family-adjusted)

- **Primary Residence Relief**:
  - Standard: 50% reduction on tax for primary residence (up to €450,000 value)
  - Family-adjusted: 75% reduction on tax for primary residence (up to €450,000 value)

- **Minimum Tax**: €5 (tax is not collected if below this amount)

## Running Tests

To run the tests, use the following command:

```bash
yarn test
```

To run a specific test file:

```bash
yarn test src/__tests__/utils/currentTaxSystem.test.ts
# or
yarn test src/__tests__/utils/proposedTaxSystem.test.ts
```

## Test Data

The tests use a variety of property value scenarios to validate the tax calculation logic, including:
- Single properties vs. multiple properties
- Properties below and above thresholds
- Properties spanning multiple tax brackets
- Joint ownership scenarios
- Family-adjusted scenarios
- Low-income exemption cases
- Abandoned property scenarios

## Validation Against Official Examples

The test cases include scenarios based on official examples provided in the Lithuanian Ministry of Finance documentation, ensuring that our calculator aligns with the official interpretation of the tax laws.

## References

- Lithuanian Real Estate Tax Law (current version)
- Proposed amendments to the Lithuanian Real Estate Tax Law (April 2025)
- Ministry of Finance explanatory notes and examples
- Bank of Lithuania analysis of the proposed tax reform
