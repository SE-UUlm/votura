import { modAdd, modPow, randBetween } from 'bigint-crypto-utils';

export const getBitsOfBigInt = (x: bigint) => {
  // https://stackoverflow.com/questions/54758130/how-to-obtain-the-amount-of-bits-of-a-bigint
  const i = (x.toString(16).length - 1) * 4;
  return i + 32 - Math.clz32(Number(x >> BigInt(i)));
};

export const getCofactor = (p: bigint, q: bigint): bigint => {
  // https://www.di-mgt.com.au/multiplicative-group-mod-p.html
  const j = (p - 1n) / q;

  if ((p - 1n) % q !== 0n) {
    throw new Error('Invalid: (p - 1) is not divisible by q');
  }
  if (j % 2n !== 0n) {
    throw new Error('Invalid: cofactor j is not even');
  }

  return j;
};

export const getGeneratorForPrimes = (primeP: bigint, primeQ: bigint): bigint => {
  //https://www.di-mgt.com.au/multiplicative-group-mod-p.html
  let h = randBetween(modAdd([primeP, -1n], primeP), BigInt(1));
  const j = getCofactor(primeP, primeQ);

  let g = modPow(h, j, primeP);

  while (g <= BigInt(1)) {
    h = randBetween(modAdd([primeP, -1n], primeP), BigInt(1));
    g = modPow(h, j, primeP);
  }

  return g;
};
