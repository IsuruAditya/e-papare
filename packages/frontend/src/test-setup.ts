import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest is not configured with `globals: true`, so React Testing Library's
// automatic post-test cleanup does not run on its own. Register it explicitly
// here so each test starts from an empty document (otherwise repeated renders
// leak into the DOM and role/text queries find multiple matches).
afterEach(() => {
  cleanup();
});
