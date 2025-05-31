import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*test.ts'],
    reporters: [
      'verbose',
      ['default', { summary: false }],
      [
        'junit',
        {
          suiteName: 'votura-crypto tests',
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
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      thresholds: {
        lines: 85,
        functions: 90,
        branches: 75,
        statements: 85,
      },
    },
  },
});
