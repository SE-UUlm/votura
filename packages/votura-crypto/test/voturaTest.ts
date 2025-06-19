import { test } from 'vitest';
import { type Ciphertext, KeyPair } from '../src/index.js';

interface VoturaFixtures {
  keyPair: KeyPair;
  randomness: bigint;
  plaintext: bigint;
  ciphertext: Ciphertext;
}

const keyPair: KeyPair = new KeyPair(
  250179873683957752804777319628987296639n,
  125089936841978876402388659814493648319n,
  4n,
  131540522532280256081645765350762669379n,
  34148884576190600744644237053046182241n,
);

export const voturaTest = test.extend<VoturaFixtures>({
  keyPair,
  randomness: 10n,
  plaintext: 123456789n,
  ciphertext: [1048576n, 74111364892091862126244320048683329486n],
});
