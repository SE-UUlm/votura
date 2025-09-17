import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: true,
    environment: 'node',
    include: ['test/**/*test.ts'],
    reporters: [
      'verbose',
      'github-actions',
      [
        'junit',
        {
          suiteName: 'votura-ballot-box tests',
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
