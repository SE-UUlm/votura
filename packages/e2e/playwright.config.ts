import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import * as os from 'node:os';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !(process.env.CI == null),
  retries: process.env.CI != null ? 2 : 0,
  workers: process.env.CI != null ? 1 : os.availableParallelism(),
  reporter: 'html',
  use: {
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
