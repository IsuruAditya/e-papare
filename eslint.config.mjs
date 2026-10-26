import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

/**
 * Inline custom rule: ep-boundaries/no-cross-module-deep-imports
 *
 * Enforces AD-1: one backend module may not import another module's internal
 * implementation files directly. Cross-module access must go through the
 * module barrel (index) and NestJS dependency injection.
 *
 * `no-restricted-imports` cannot express this because relative import strings
 * (e.g. "../payment/payment.service") do not encode the source module; only the
 * importer's file path reveals whether an import is same- vs cross-module.
 *
 * Behavior:
 *   - Applies only to files inside `packages/backend/src/modules/<thisModule>/`.
 *   - Blocks relative imports that resolve into a *different* module and target
 *     an internal service/repository implementation file (e.g.
 *     "../payment/payment.service", "../payment/payment.repository").
 *   - Allows: same-module imports, the module barrel ("../payment",
 *     "../payment/index"), DI-wiring imports ("../payment/payment.module"),
 *     shared types/dtos, package imports, and non-module folders ("../shared/...").
 */
const noCrossModuleDeepImports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow deep imports of another backend module's internal service/repository (AD-1). Use the module barrel + NestJS DI instead.",
    },
    schema: [],
    messages: {
      crossModule:
        'Cross-module import of "{{target}}" bypasses NestJS DI (AD-1). Import the service from the module barrel "../{{other}}" and inject it instead.',
    },
  },
  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    const currentMatch = filename.match(/\/modules\/(\w+)\//);
    if (!currentMatch) return {};
    const currentModule = currentMatch[1];
    const importerDir = filename.replace(/\/[^/]+$/, '');

    function resolveRelative(source) {
      const parts = importerDir.split('/');
      for (const seg of source.split('/')) {
        if (seg === '.' || seg === '') continue;
        if (seg === '..') parts.pop();
        else parts.push(seg);
      }
      return parts.join('/');
    }

    function checkSource(source, node) {
      if (!source.startsWith('.')) return;
      const resolved = resolveRelative(source);
      const m = resolved.match(/\/modules\/(\w+)\/(.+)/);
      if (!m) return;
      const targetModule = m[1];
      const remainder = m[2];
      if (targetModule === currentModule) return;
      // Allow the module barrel: remainder is just "index" or "index.ts".
      if (/^index(\.[a-z]+)?$/.test(remainder)) return;
      // Only block imports of internal service/repository implementation files.
      const lastSeg = remainder.split('/').pop();
      if (/\.(service|repository)(\.[a-z]+)?$/.test(lastSeg)) {
        context.report({
          node,
          messageId: 'crossModule',
          data: { target: source, other: targetModule },
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkSource(node.source.value, node);
      },
      ExportNamedDeclaration(node) {
        if (node.source) checkSource(node.source.value, node);
      },
      ExportAllDeclaration(node) {
        checkSource(node.source.value, node);
      },
    };
  },
};

const epBoundariesPlugin = {
  meta: { name: 'ep-boundaries' },
  rules: {
    'no-cross-module-deep-imports': noCrossModuleDeepImports,
  },
};

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
        projectService: { allowDefaultProject: ['*.config.*'] },
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

  // 6. Prettier compatibility: disable ESLint formatting rules that conflict.
  prettierConfig,
);
