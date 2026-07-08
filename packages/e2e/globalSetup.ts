import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'path';
import { startTestEnv } from './testEnv.js';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

export default async function globalSetup(): Promise<void> {
  const nycOutputDir = path.join(DIRNAME, '../../apps/frontend/.nyc_output');
  const coverageDir = path.join(DIRNAME, '../../apps/frontend/coverage');

  await rm(nycOutputDir, { recursive: true, force: true });
  await rm(coverageDir, { recursive: true, force: true });
  await mkdir(nycOutputDir, { recursive: true });
  await startTestEnv();
}
