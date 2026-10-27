import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    // SWC handles emitDecoratorMetadata — required for NestJS DI in tests.
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorMetadata: true },
        target: 'es2022',
      },
    }),
  ],
  test: {
    environment: 'node',
    globals: false,
    alias: {
      '@e-papere/shared-types': resolve(__dirname, '../shared-types/src/index.ts'),
    },
  },
});
