import { test } from 'vitest';
import { getPrime } from './index.js';

test(
  'getRandomBigInt',
  async () => {
    console.log(await getPrime());
  },
  { timeout: 30000 },
);
