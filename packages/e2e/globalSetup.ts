import { startTestEnv } from './testEnv.js';

export default async function globalSetup(): Promise<void> {
  console.log(`[e2e] global setup started at ${new Date().toISOString()}`);
  await startTestEnv();
  console.log(`[e2e] global setup completed at ${new Date().toISOString()}`);
}
