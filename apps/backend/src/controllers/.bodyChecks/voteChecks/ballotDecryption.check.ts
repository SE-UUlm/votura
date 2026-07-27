import { BallotPaperSectionDecryption } from '@repo/votura-ballot-box';
import { PrivateKey } from '@votura/votura-crypto/index';
import { getBallotPaperEncryptionKeys } from '../../../services/ballotPapers.service.js';

/**
 * Create and configure a ballot decryption instance.
 * @param ballotPaperId The ID of the ballot paper to decrypt.
 * @returns A promise that resolves to a BallotDecryption instance.
 */
export const createBallotDecryption = async (
  ballotPaperId: string,
): Promise<BallotPaperSectionDecryption> => {
  const { pubKey, privKey, primeP, primeQ, generator } =
    await getBallotPaperEncryptionKeys(ballotPaperId);

  const privateKey = new PrivateKey(
    BigInt(primeP),
    BigInt(primeQ),
    BigInt(generator),
    BigInt(pubKey),
    BigInt(privKey),
  );

  return new BallotPaperSectionDecryption(privateKey);
};
