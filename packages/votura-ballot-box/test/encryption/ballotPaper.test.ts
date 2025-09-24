import type { PlainBallotPaper } from '@repo/votura-validators';
import { getKeyPair, type KeyPair } from '@votura/votura-crypto/index';
import { beforeAll, describe, expect, it } from 'vitest';
import { BallotPaperEncryption } from '../../src/encryption/ballotPaper.js';

describe('BallotPaperEncryption tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }

  let encryption: BallotPaperEncryption | null = null;
  let keyPair: KeyPair | null = null;

  beforeAll(async () => {
    keyPair = await getKeyPair(32);
    encryption = new BallotPaperEncryption(keyPair.publicKey);
  });

  it('should encrypt a complete ballot paper with multiple sections correctly', () => {
    const plainBallotPaper: PlainBallotPaper = {
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
        [UUIDs.section2]: {
          votes: [
            {
              [UUIDs.candidate1]: 0,
              [UUIDs.candidate3]: 1,
              noVote: 0,
              invalid: 0,
            },
            {
              [UUIDs.candidate1]: 0,
              [UUIDs.candidate3]: 1,
              noVote: 0,
              invalid: 0,
            },
            {
              [UUIDs.candidate1]: 1,
              [UUIDs.candidate3]: 0,
              noVote: 0,
              invalid: 0,
            },
            {
              [UUIDs.candidate1]: 0,
              [UUIDs.candidate3]: 1,
              noVote: 0,
              invalid: 0,
            },
          ],
        },
      },
    };

    if (!encryption) {
      throw new Error('Encryption is null or undefined.');
    }
    const encryptedBallotPaper = encryption.encryptBallotPaper(plainBallotPaper);
    expect(encryptedBallotPaper.ballotPaperId).toBe(UUIDs.ballotPaper);
    expect(Object.keys(encryptedBallotPaper.sections)).toHaveLength(2);
    expect(Object.keys(encryptedBallotPaper.sections).sort()).toEqual(
      [UUIDs.section1, UUIDs.section2].sort(),
    );

    for (const [sectionId, encryptedSection] of Object.entries(encryptedBallotPaper.sections)) {
      const plainSectionVotes = plainBallotPaper.sections[sectionId]?.votes;
      if (!plainSectionVotes) {
        throw new Error('PlainSectionVotes is null or undefined.');
      }
      expect(encryptedSection.votes).toHaveLength(plainSectionVotes.length);
    }
  });
});
