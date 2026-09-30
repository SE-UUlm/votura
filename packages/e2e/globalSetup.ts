import { startTestEnv } from './testEnv.js';

export default async function globalSetup(): Promise<void> {
  process.stderr.write(`[e2e] global setup started at ${new Date().toISOString()}\n`);
  await startTestEnv();
  process.stderr.write(`[e2e] global setup completed at ${new Date().toISOString()}\n`);
}
