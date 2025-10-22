import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/vitest.setup.ts'],
    testTimeout: 15_000, // 15 seconds
    hookTimeout: 15_000, // 15 seconds
    fileParallelism: false,
    globals: true,
    environment: 'node',
    include: ['test/**/*test.ts'],
    reporters: [
      'verbose',
      'github-actions',
      [
        'junit',
        {
          suiteName: 'votura-backend tests',
          classnameTemplate: 'filename:{filename} - filepath:{filepath}',
        },
      ],
      'json',
      'html',
    ],
    outputFile: {
      junit: './results/junit-report.xml',
      json: './results/json-report.json',
      html: './results/index.html',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      include: ['src/**'],
      exclude: [],
      thresholds: {
        lines: 80,
        functions: 90,
        branches: 80,
        statements: 80,
      },
    },
  },
});
