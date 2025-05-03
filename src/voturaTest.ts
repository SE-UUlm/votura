import { KeyPair } from './index.js';
import { test } from 'vitest';

interface VoturaFixtures {
  keyPair: KeyPair;
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
});
