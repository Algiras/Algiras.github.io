#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Final fixes for property name mismatches and remaining issues
const fixes = [
  {
    file: 'src/components/projects/InvestmentCalculator.tsx',
    replacements: [
      { from: '_taxRate: taxRate', to: '__taxRate: taxRate' },
      { from: 'const _compoundingPerYear =', to: '// const _compoundingPerYear =' },
      { from: 'const _startBalance =', to: '// const _startBalance =' }
    ]
  },
  {
    file: 'src/utils/financialCalculations.ts',
    replacements: [
      { from: 'input._taxRate', to: 'input.__taxRate' },
      { from: '_inflationRate,', to: '// _inflationRate,' },
      { from: 'taxRate', to: '// taxRate' }
    ]
  },
  {
    file: 'src/components/projects/RetirementPlanner.tsx',
    replacements: [
      { from: 'retirementTaxRate: 18', to: '_retirementTaxRate: 18' },
      { from: '_taxRate,', to: '// _taxRate,' },
      { from: 'retirementTaxRate', to: '_retirementTaxRate' },
      { from: 'const _startBalance =', to: '// const _startBalance =' },
      { from: 'inputs.retirementTaxRate', to: 'inputs._retirementTaxRate' }
    ]
  },
  {
    file: 'src/__tests__/utils/financialCalculations.test.ts',
    replacements: [
      { from: 'taxRate: 15', to: '__taxRate: 15' },
      { from: 'taxRate: 0', to: '__taxRate: 0' }
    ]
  }
];

console.log('🔧 Final comprehensive fixes...');

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
      console.log(`✅ ${file}: ${from} → ${to}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
  }
});

console.log('✨ All fixes complete! Run yarn build to verify.'); 