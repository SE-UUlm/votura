import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

export default defineConfig({
  testDir: './tests',
  globalSetup: './globalSetup',
  globalTeardown: './globalTeardown',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !(process.env.CI == null),
  retries: process.env.CI != null ? 2 : 0,
  workers: process.env.CI != null ? 1 : os.availableParallelism(),
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
