import { expect, test } from 'vitest';
import { getKeyPair } from './index.js';

test('placeholder', { timeout: 30000 }, async () => {
  expect(true).toBe(true);
});

test('getKeyPair', {timeout: 60000}, async () => {
  const keyPair = await getKeyPair(2048);
  console.log(keyPair);
})