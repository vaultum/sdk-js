import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts'
      ]
    },
    include: ['src/**/*.test.ts', 'test/**/*.spec.ts', 'test/**/*.test.ts'],
    testTimeout: 10000
  }
});
