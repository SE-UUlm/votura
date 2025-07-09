import { stopTestEnv } from './testEnv.js';

export default async function globalTeardown(): Promise<void> {
  await stopTestEnv();
}
