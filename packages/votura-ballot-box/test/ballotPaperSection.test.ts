import { type PlainBallotPaper } from '@repo/votura-validators';
import { getKeyPair, type KeyPair } from '@votura/votura-crypto/index';
import { beforeAll, describe, expect, it } from 'vitest';
import { BallotPaperSectionDecryption, BallotPaperSectionEncryption } from '../src/index.js';

describe('Integration test: encrypt and decrypt a ballot paper section', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  };

  let decryption: BallotPaperSectionDecryption | null = null;
  let encryption: BallotPaperSectionEncryption | null = null;
  let keyPair: KeyPair | null = null;

  beforeAll(async () => {
    keyPair = await getKeyPair(32);
    encryption = new BallotPaperSectionEncryption(keyPair.publicKey);
    decryption = new BallotPaperSectionDecryption(keyPair.privateKey);
  });

  it('should encrypt and decrypt a section with votes [B, A, B, noVote]', () => {
    // input: PlainBallotPaper section
    const plainBallotPaper: PlainBallotPaper = {
      ballotPaperId: UUIDs.ballotPaper,
      sections: {
        [UUIDs.section1]: {
          votes: [
            { [UUIDs.candidate1]: 0, [UUIDs.candidate2]: 1, [UUIDs.candidate3]: 0, noVote: 0, invalid: 0 },
            { [UUIDs.candidate1]: 1, [UUIDs.candidate2]: 0, [UUIDs.candidate3]: 0, noVote: 0, invalid: 0 },
            { [UUIDs.candidate1]: 0, [UUIDs.candidate2]: 1, [UUIDs.candidate3]: 0, noVote: 0, invalid: 0 },
            { [UUIDs.candidate1]: 0, [UUIDs.candidate2]: 0, [UUIDs.candidate3]: 0, noVote: 1, invalid: 0 },
          ]
        }
      }
    };

    // encryption: PlainBallotPaper section => FilledBallotPaper section
    if (!encryption || !plainBallotPaper.sections[UUIDs.section1]) {
      throw new Error('Encryption and Section1 are null or undefined.');
    }
    const encryptedSection = encryption.encryptSection(plainBallotPaper.sections[UUIDs.section1], UUIDs.section1);

    // decryption: FilledBallotPaper section => DecryptedSection
    if (!decryption) {
      throw new Error('Decryption is null or undefined.');
    }
    decryption.calculateLookupTable(4);
    const result = decryption.decryptSection(encryptedSection, UUIDs.section1);
    expect(result).toEqual({
      sectionId: UUIDs.section1,
      candidateResults: {
        [UUIDs.candidate1]: 1,
        [UUIDs.candidate2]: 2,
      },
      noVoteCount: 1,
      invalidCount: 0,
    });
  });
});
