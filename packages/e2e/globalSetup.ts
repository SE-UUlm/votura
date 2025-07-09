import { startTestEnv } from './testEnv.js';

export default async function globalSetup(): Promise<void> {
  await startTestEnv();
}
