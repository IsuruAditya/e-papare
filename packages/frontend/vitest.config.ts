import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      alias: {
        '@e-papere/shared-types': resolve(__dirname, '../shared-types/src/index.ts'),
      },
    },
  }),
);
