import type { PlainFilledBallotPaper } from '@repo/votura-validators';
import { getKeyPair, type KeyPair } from '@votura/votura-crypto/index';
import { beforeAll, describe, expect, it } from 'vitest';
import { BallotPaperSectionEncryption } from '../../src/encryption/ballotPaperSection.js';

describe('BallotPaperSectionEncryption tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }

  let encryption: BallotPaperSectionEncryption | null = null;
  let keyPair: KeyPair | null = null;

  beforeAll(async () => {
    keyPair = await getKeyPair(20);
    encryption = new BallotPaperSectionEncryption(keyPair.publicKey);
  });

  it('should encrypt a section with multiple votes correctly', () => {
    const plainFilledBallotPaper: PlainFilledBallotPaper = {
      ballotPaperId: UUIDs.ballotPaper,
      sections: {
        [UUIDs.section1]: {
          votes: [
            {
              [UUIDs.candidate1]: 0,
              [UUIDs.candidate2]: 1,
              [UUIDs.candidate3]: 0,
              noVote: 0,
              invalid: 0,
            },
            {
              [UUIDs.candidate1]: 1,
              [UUIDs.candidate2]: 0,
              [UUIDs.candidate3]: 0,
              noVote: 0,
              invalid: 0,
            },
            {
              [UUIDs.candidate1]: 0,
              [UUIDs.candidate2]: 1,
              [UUIDs.candidate3]: 0,
              noVote: 0,
              invalid: 0,
            },
            {
              [UUIDs.candidate1]: 0,
              [UUIDs.candidate2]: 0,
              [UUIDs.candidate3]: 0,
              noVote: 1,
              invalid: 0,
            },
          ],
        },
      },
    };

    if (!encryption || !plainFilledBallotPaper.sections[UUIDs.section1]) {
      throw new Error('Encryption and Section1 are null or undefined.');
    }
    const [encryptedSection] = encryption.encryptSection(
      plainFilledBallotPaper.sections[UUIDs.section1],
      UUIDs.section1,
    );
    expect(encryptedSection.sectionId).toBe(UUIDs.section1);
    expect(encryptedSection.votes).toHaveLength(4);

    for (const vote of encryptedSection.votes) {
      expect(Object.keys(vote).sort((a, b) => a.localeCompare(b))).toEqual(
        [UUIDs.candidate1, UUIDs.candidate2, UUIDs.candidate3, 'noVote', 'invalid'].sort((a, b) =>
          a.localeCompare(b),
        ),
      );

      for (const value of Object.values(vote)) {
        expect(value).toHaveProperty('alpha');
        expect(typeof value.alpha).toBe('bigint');
        expect(value).toHaveProperty('beta');
        expect(typeof value.beta).toBe('bigint');
        expect(value).toHaveProperty('commitment1');
        expect(typeof value.commitment1).toBe('bigint');
        expect(value).toHaveProperty('commitment2');
        expect(typeof value.commitment2).toBe('bigint');
        expect(value).toHaveProperty('challenge');
        expect(typeof value.challenge).toBe('bigint');
        expect(value).toHaveProperty('response');
        expect(typeof value.response).toBe('bigint');
      }
    }
  });
});
