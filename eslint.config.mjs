import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

/**
 * ESLint flat config for Next.js 16
 * Includes Core Web Vitals rules for optimal performance
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Additional ignores:
    'node_modules/**',
    'coverage/**',
    '.vitest/**',
    'graphify-out/**',
    '__tests__/**',
    'tests/**',
    '**/*.test.*',
    '**/*.spec.*',
    'vitest.config.*',
    'vitest.setup.*',
  ]),
])

export default eslintConfig
