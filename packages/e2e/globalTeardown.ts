import { stopTestEnv } from './testEnv.js';

export default async function globalTeardown(): Promise<void> {
  process.stderr.write(`[e2e] global teardown started at ${new Date().toISOString()}\n`);
  await stopTestEnv();
  process.stderr.write(`[e2e] global teardown completed at ${new Date().toISOString()}\n`);
}
