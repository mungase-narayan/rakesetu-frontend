import { defineConfig } from 'vitest/config';

/**
 * Separate from vite.config.ts on purpose: the app build runs the React
 * Compiler babel pass, which the test run has no use for and which would slow
 * every suite down for no benefit. The alias is repeated because a test file
 * resolving `@/` differently from the app is a class of failure nobody enjoys
 * debugging.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
