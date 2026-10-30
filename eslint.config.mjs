// ESLint flat config (Next 16 + ESLint 10). Replaces the legacy .eslintrc.json.
import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', 'node_modules/**', 'archive/**', 'coverage/**', 'public/**', 'next-env.d.ts']),
  {
    rules: {
      // Style/maintainability signals: warnings so `npm run lint` shows them; correctness stays errors.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'react/no-unescaped-entities': 'off',
      // New React Compiler rules (react-hooks v6+). Real but non-breaking; flagged as warnings and
      // tracked for a component-by-component fix (see docs/DEPENDENCY_AUDIT.md).
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  {
    files: ['__tests__/**', 'e2e/**', 'scripts/**/*.js', '*.config.ts', '*.config.js', '*.config.mjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off', '@typescript-eslint/no-explicit-any': 'off' },
  },
])
