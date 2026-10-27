import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import { epBoundariesPlugin } from './packages/backend/src/lint-rules/ep-boundaries.rule.ts';

export default tseslint.config(
  // 1. Files that ESLint should never touch.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.vite/**',
      'pnpm-lock.yaml',
      '_bmad/**',
      '_bmad-output/**',
      '.kiro/**',
    ],
  },

  // 2. TypeScript files: type-checked rules + projectService (auto-detects each
  //    package's tsconfig.json). no-console warns on source; config files opt out below.
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['*.config.*', 'packages/*/vitest.config.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },

  // 3. JavaScript / config files: no type info needed; console allowed.
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'no-console': 'off',
    },
  },

  // 4. Frontend: React hooks rules (scoped to the frontend package only).
  {
    files: ['packages/frontend/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 5. Backend: inline module-boundary rule (AD-1). Only active for files inside
  //    src/modules/<x>/; a no-op guardrail until modules exist (Story 1.8+).
  {
    files: ['packages/backend/src/**/*.ts'],
    plugins: { 'ep-boundaries': epBoundariesPlugin },
    rules: {
      'ep-boundaries/no-cross-module-deep-imports': 'error',
    },
  },

  // 6. Test files: disable noisy type-checked rules — mocks and assertions
  //    routinely use `any` / unsafe patterns; enforcing them on test files
  //    creates friction without safety benefit.
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 7. Prettier compatibility: disable ESLint formatting rules that conflict.
  prettierConfig,
);
