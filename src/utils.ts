import { primalityTest } from 'miller-rabin-primality';

export const getBitsOfBigInt = (x: bigint) => {
  // https://stackoverflow.com/questions/54758130/how-to-obtain-the-amount-of-bits-of-a-bigint
  const i = (x.toString(16).length - 1) * 4;
  return i + 32 - Math.clz32(Number(x >> BigInt(i)));
};

export const getRandomBigInt = (bits: number = 2048): bigint => {
  let rand = '1';
  for (let i = 1; i < bits; i++) {
    rand += Math.random() < 0.5 ? '0' : '1';
  }
  return BigInt('0b' + rand);
};

export const getPrime = async (bits: number = 2048) => {
  let probablePrime = getRandomBigInt(bits);
  let result = await primalityTest(probablePrime);

  while (!result.probablePrime) {
    probablePrime = getRandomBigInt(bits);
    result = await primalityTest(probablePrime);
  }

  return probablePrime;
};

export const getRandomBigIntFromInterval = (
  min: bigint,
  max: bigint,
): bigint => {
  const range: bigint = max - min + 1n;
  const byteLength = Math.ceil(range.toString(2).length / 8); // bytes needed

  let rand;
  do {
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes);

    // Convert bytes to BigInt
    rand = randomBytes.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
  } while (rand >= range); // Reject if out of range (to keep uniform distribution)

  return min + rand;
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

// TODO: write proper test
export const getGeneratorForPrimes = (
  primeP: bigint,
  primeQ: bigint,
): bigint => {
  //https://www.di-mgt.com.au/multiplicative-group-mod-p.html
  let h = getRandomBigIntFromInterval(BigInt(1), primeP - BigInt(1));
  const j = getCofactor(primeP, primeQ);

  let g = (h ^ j) % primeP;

  while (g <= BigInt(1)) {
    h = getRandomBigIntFromInterval(BigInt(1), primeP - BigInt(1));
    g = (h ^ j) % primeP;
  }

  return g;
};
