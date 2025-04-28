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
