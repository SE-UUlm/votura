import { stopTestEnv } from './testEnv.js';

export default async function globalTeardown(): Promise<void> {
  console.log(`[e2e] global teardown started at ${new Date().toISOString()}`);
  await stopTestEnv();
  console.log(`[e2e] global teardown completed at ${new Date().toISOString()}`);
}
