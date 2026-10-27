/**
 * Unit tests for the ep-boundaries/no-cross-module-deep-imports ESLint rule.
 *
 * Tests four cases per the I/O matrix in Story 1.3:
 *   1. Cross-module service import  → error (blocked)
 *   2. Cross-module repository import → error (blocked)
 *   3. Cross-module barrel import   → no error (allowed)
 *   4. Same-module import           → no error (allowed)
 */
import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { noCrossModuleDeepImports } from '../lint-rules/ep-boundaries.rule';

// Use a fake absolute filename inside the auth module as the test file context.
const AUTH_FILE = '/workspace/packages/backend/src/modules/auth/auth.service.ts';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

describe('ep-boundaries/no-cross-module-deep-imports', () => {
  it('passes all RuleTester cases', () => {
    ruleTester.run('ep-boundaries/no-cross-module-deep-imports', noCrossModuleDeepImports, {
      valid: [
        // 3. Allowed: barrel import from another module (../payment → index)
        {
          filename: AUTH_FILE,
          code: "import { PaymentService } from '../payment';",
        },
        // 3b. Allowed: explicit barrel index file (exercises the index-allow branch)
        {
          filename: AUTH_FILE,
          code: "import { PaymentService } from '../payment/index';",
        },
        // 3c. Allowed: cross-module non-implementation file (types/dto are not service/repository)
        {
          filename: AUTH_FILE,
          code: "import { PAYMENT_STATUS } from '../payment/payment.types';",
        },
        // 4. Allowed: same-module deep import (./auth.repository is in same module)
        {
          filename: AUTH_FILE,
          code: "import { AuthRepository } from './auth.repository';",
        },
        // Allowed: non-module shared import
        {
          filename: AUTH_FILE,
          code: "import { something } from '../shared/utils';",
        },
        // Allowed: package import (not relative)
        {
          filename: AUTH_FILE,
          code: "import { Injectable } from '@nestjs/common';",
        },
      ],
      invalid: [
        // 1. Blocked: cross-module service import
        {
          filename: AUTH_FILE,
          code: "import { PaymentService } from '../payment/payment.service';",
          errors: [{ messageId: 'crossModule' }],
        },
        // 2. Blocked: cross-module repository import
        {
          filename: AUTH_FILE,
          code: "import { PaymentRepository } from '../payment/payment.repository';",
          errors: [{ messageId: 'crossModule' }],
        },
      ],
    });
  });
});
