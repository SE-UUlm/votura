import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*test.ts'],
    reporters: [
      'verbose',
      'github-actions',
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
      reporter: ['text', 'html', 'clover', 'json'],
      include: ['src/**'],
      exclude: ['**/*.d.ts', 'src/db/migrations/**', 'src/db/migrate.ts', 'src/db/seed.ts'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
