import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Dile a Vitest que ignore la carpeta de Playwright
    exclude: ['node_modules', 'tests/e2e/**'],
  },
});