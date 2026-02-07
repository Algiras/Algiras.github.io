# Calculator Enhancement Components

This directory contains reusable components and utilities for enhancing financial calculators with modern UX features.

## 📦 Components

### 1. **AnimatedMetric** / AnimatedCurrency / AnimatedPercentage
Animated number counters with smooth easeOut transitions.

```tsx
import { AnimatedCurrency, AnimatedPercentage } from '../calculator';

// Currency with animation
<AnimatedCurrency
  value={125000}
  label="Total Cost"
  description="Over 30 years"
  size="lg"
  decimals={0}
  colorScheme="positive"
/>

// Percentage
<AnimatedPercentage
  value={6.5}
  label="Interest Rate"
  decimals={2}
  previousValue={7.0}  // Shows delta
/>
```

**Props:**
- `value`: number - Target value to animate to
- `duration`: number - Animation duration in ms (default: 1000)
- `prefix/suffix`: string - Currency symbol, percentage, etc.
- `decimals`: number - Decimal places to show
- `colorScheme`: 'positive' | 'negative' | 'neutral'
- `previousValue`: number - Show delta/change from previous value
- `label`: string - Optional label above the metric
- `description`: string - Optional description below

---

### 2. **InsightCard** / InsightList
Display auto-generated recommendations and insights.

```tsx
import { InsightList } from '../calculator';
import { generateMortgageInsights } from '../../utils/insightGenerator';

const insights = generateMortgageInsights(inputs, results);

<InsightList
  insights={insights}
  dismissible={true}
  onDismiss={(index, dontShowAgain) => {
    // Handle dismissal
  }}
/>
```

**Insight Types:**
- `success` - Green, positive recommendations
- `warning` - Orange, cautions and warnings
- `info` - Blue, informational tips
- `tip` - Yellow, helpful suggestions

---

### 3. **InputHelper** / InputLabelWithHelper
Contextual help tooltips for calculator inputs.

```tsx
import { InputHelper, FINANCIAL_HELPERS } from '../calculator';

// Using pre-defined helpers
<Group gap={4}>
  <Text size="sm" fw={500}>Interest Rate</Text>
  <InputHelper {...FINANCIAL_HELPERS.interestRate} />
</Group>

// Custom helper
<InputHelper
  helpText="Total purchase price of the property"
  currentAverage="$400,000 (US median)"
  learnMoreUrl="https://..."
  position="top"
/>
```

**Pre-defined Helpers:**
- `interestRate` - Current average rates
- `downPayment` - PMI explanation
- `loanTerm` - 15yr vs 30yr comparison
- `propertyTax`, `homeInsurance`, `pmi`, `hoa`
- `extraPayment` - Benefits explanation
- `inflation`, `contribution`, `rateOfReturn`
- `debtToIncome`

---

### 4. **ExportPanel**
Unified export UI for PDF, CSV, Share, and Copy.

```tsx
import { ExportPanel } from '../calculator';

const exportOptions = {
  calculatorType: 'mortgage',
  calculatorName: 'Mortgage Calculator',
  inputs: { homePrice: 400000, ... },
  results: { totalCost: 600000, ... },
  generateMarkdown: () => generateMortgageMarkdown(inputs, results),
  generateCSV: () => generateAmortizationCSV(schedule),
};

<ExportPanel
  options={exportOptions}
  variant="menu"  // or "fab" for floating action button
  position="top-right"
/>
```

**Features:**
- **PDF Export**: Browser print dialog with formatted report
- **CSV Export**: Download tables (amortization schedules, etc.)
- **Share Link**: Generate URL with encoded calculator state
- **Copy**: Copy formatted text summary to clipboard

---

### 5. **ComparisonMode** / ComparisonToggle
Side-by-side scenario comparison.

```tsx
import { ComparisonMode } from '../calculator';

const scenarios = [
  { label: 'Scenario A', inputs: {...}, results: {...}, color: 'blue' },
  { label: 'Scenario B', inputs: {...}, results: {...}, color: 'green' },
];

<ComparisonMode
  scenarios={scenarios}
  renderCard={(scenario, index) => <YourCardComponent {...scenario} />}
  compareMetrics={['totalCost', 'monthlyPayment']}
  metricFormatter={(value) => `$${value.toFixed(0)}`}
/>
```

---

## 🛠️ Utilities

### calculatorExport.ts

```tsx
import {
  encodeStateToURL,
  decodeStateFromURL,
  generateCSV,
  generateMortgageMarkdown,
  formatCurrency,
  formatPercentage,
} from '../../utils/calculatorExport';

// URL state management
const encoded = encodeStateToURL({ calculatorType: 'mortgage', inputs, results });
const shareUrl = `${window.location.origin}/mortgage?calc=${encoded}`;

// On mount, restore from URL
const params = new URLSearchParams(window.location.search);
const state = decodeStateFromURL(params.get('calc'));

// CSV generation
const csv = generateCSV(
  data,
  ['Month', 'Payment', 'Principal', 'Interest', 'Balance'],
  'amortization_schedule'
);

// Markdown generation
const markdown = generateMortgageMarkdown(inputs, results);
```

---

### insightGenerator.ts

```tsx
import {
  generateMortgageInsights,
  generateInvestmentInsights,
  generateDebtPayoffInsights,
  generateRetirementInsights,
  generateROIInsights,
} from '../../utils/insightGenerator';

// Generate insights
const insights = generateMortgageInsights(inputs, results);
// Returns Insight[] array with type, title, description, optional action
```

**Insight Rules (Mortgage Example):**
- PMI warning if down payment < 20%
- Extra payment benefits calculation
- Interest rate vs market average
- Interest as % of total cost
- 15yr vs 30yr comparison
- Debt-to-income ratio warnings

---

## 🎨 Animations

Import the animation CSS in your main entry point:

```tsx
import './styles/calculator-animations.css';
```

**Available Classes:**
- `.calculator-metric` - Metric reveal animation
- `.calculator-chart` - Chart slide-in
- `.insight-card` - Insight slide-in
- `.calculator-entrance` - Orchestrated entrance
- `.calculator-card-hover` - Hover lift effect

**CSS Variables:**
```css
.calculator-progress-bar {
  animation: progressFill 1s cubic-bezier(0.16, 1, 0.3, 1) both;
  --progress-value: 75%; /* Set dynamically */
}
```

---

## 📖 Live Demo

Visit `/calculator-demo` to see all components in action with a simple mortgage calculator.

**Demo URL:** `http://localhost:5173/#/calculator-demo`

---

## 🔧 Integration Guide

### Step 1: Import Components

```tsx
import {
  AnimatedCurrency,
  InsightList,
  InputHelper,
  ExportPanel,
  FINANCIAL_HELPERS,
} from '../calculator';
import { generateMortgageInsights } from '../../utils/insightGenerator';
```

### Step 2: Add URL State Support

```tsx
import { encodeStateToURL, decodeStateFromURL } from '../../utils/calculatorExport';

// On mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const calcState = params.get('calc');
  if (calcState) {
    const decoded = decodeStateFromURL(calcState);
    if (decoded && decoded.calculatorType === 'mortgage') {
      setInputs(decoded.inputs);
    }
  }
}, []);
```

### Step 3: Generate Insights

```tsx
const insights = useMemo(() => {
  if (!results) return [];
  return generateMortgageInsights(inputs, results);
}, [inputs, results]);
```

### Step 4: Replace Static Metrics

```tsx
// Before
<Text size="xl" fw={700}>${results.totalCost.toFixed(0)}</Text>

// After
<AnimatedCurrency
  value={results.totalCost}
  label="Total Cost"
  size="lg"
  decimals={0}
/>
```

### Step 5: Add Input Helpers

```tsx
<Group gap={4} mb={4}>
  <Text size="sm" fw={500}>Interest Rate</Text>
  <InputHelper {...FINANCIAL_HELPERS.interestRate} />
</Group>
<NumberInput {...props} />
```

### Step 6: Add Insights Section

```tsx
{insights.length > 0 && (
  <Card withBorder p="lg">
    <Title order={4} mb="md">💡 Smart Insights</Title>
    <InsightList insights={insights} />
  </Card>
)}
```

### Step 7: Add Export Panel

```tsx
const exportOptions = {
  calculatorType: 'mortgage',
  calculatorName: 'Mortgage Calculator',
  inputs,
  results,
  generateMarkdown: () => generateMortgageMarkdown(inputs, results),
  generateCSV: () => generateAmortizationCSV(results.amortizationSchedule),
};

<ExportPanel options={exportOptions} variant="menu" />
```

---

## ✅ Type Safety

All components are fully typed with TypeScript. Import types:

```tsx
import type {
  AnimatedMetricProps,
  Insight,
  ExportOptions,
  ComparisonScenario,
} from '../calculator';
```

---

## 🎯 Best Practices

1. **Memoize Insights**: Use `useMemo` to avoid regenerating on every render
2. **URL State**: Check for URL params on mount to restore shared calculations
3. **Animation Performance**: Components use `requestAnimationFrame` for 60fps
4. **Accessibility**: All components support keyboard navigation and screen readers
5. **Dark Mode**: Components automatically adapt to Mantine color scheme
6. **Mobile**: Components are responsive and touch-friendly

---

## 📝 Notes

- Components use Mantine UI library for consistency
- Animations respect `prefers-reduced-motion`
- Export panel uses browser's print dialog (no dependencies)
- URL encoding uses base64 (no compression library needed)
- All formatters use Intl.NumberFormat for locale support

---

## 🚀 Next Steps

To apply enhancements to existing calculators:

1. Start with one calculator as a pilot (MortgageCalculator recommended)
2. Test all features (animated metrics, insights, export, share)
3. Verify mobile responsiveness and dark mode
4. Roll out to remaining 7 calculators using the same pattern
5. Monitor for performance issues or edge cases

See `CalculatorDemo.tsx` for a complete reference implementation.
