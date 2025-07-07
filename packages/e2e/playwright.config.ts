import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'path';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

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
  webServer: [
    {
      command: 'npm run start',
      url: 'http://localhost:4000',
      cwd: path.join(DIRNAME, '../../apps/backend'),
      env: {
        ...process.env,
        PORT: '4000',
        PEPPER: '1234',
      },
    },
    {
      command: 'npm run start',
      url: 'http://localhost:5173',
      cwd: path.join(DIRNAME, '../../apps/frontend'),
      env: {
        ...process.env,
        VITE_API_BASE_URL: 'http://localhost:4000',
      },
    },
  ],
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
