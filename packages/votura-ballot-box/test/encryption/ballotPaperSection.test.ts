import type { EncryptedVoteProof, PlainFilledBallotPaper } from '@repo/votura-validators';
import { getKeyPair, type KeyPair } from '@votura/votura-crypto/index';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  BallotPaperSectionEncryption,
  type EncryptedSection,
} from '../../src/encryption/ballotPaperSection.js';

function expectFreshRandomness(
  vote: EncryptedSection['votes'][number],
  chosenId: string | undefined,
  randomness: bigint[],
): void {
  const cells = Object.values(vote);
  expect(new Set(cells.map((cell) => cell.alpha)).size).toBeGreaterThan(1);

  // with shared randomness all 0-cells have the same beta and the chosen cell stands out
  const zeroBetas = Object.entries(vote)
    .filter(([id]) => id !== chosenId)
    .map(([, cell]) => cell.beta);
  expect(new Set(zeroBetas).size).toBeGreaterThan(1);

  expect(randomness).toHaveLength(cells.length);
  expect(new Set(randomness).size).toBeGreaterThan(1);
}

function expectNumberStrings(proof: EncryptedVoteProof): void {
  for (const part of [proof.commitment1, proof.commitment2, proof.challenge, proof.response]) {
    expect(part).toMatch(/^\d+$/);
  }
}

const ENCRYPTION_IS_NULL = 'Encryption is null.';

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
    expect(encryptedSection.overallProofs).toHaveLength(4);
    encryptedSection.overallProofs.forEach(expectNumberStrings);

    for (const vote of encryptedSection.votes) {
      expect(Object.keys(vote).sort((a, b) => a.localeCompare(b))).toEqual(
        [UUIDs.candidate1, UUIDs.candidate2, UUIDs.candidate3, 'noVote', 'invalid'].sort((a, b) =>
          a.localeCompare(b),
        ),
      );

      for (const value of Object.values(vote)) {
        expect(value.alpha).toMatch(/^\d+$/);
        expect(value.beta).toMatch(/^\d+$/);
        expectNumberStrings(value.zeroProof);
        expectNumberStrings(value.oneProof);
      }
    }
  });

  it('should throw if a vote has no chosen cell', () => {
    const section = {
      votes: [
        {
          [UUIDs.candidate1]: 0,
          [UUIDs.candidate2]: 0,
          noVote: 0,
          invalid: 0,
        },
      ],
    };

    if (!encryption) {
      throw new Error(ENCRYPTION_IS_NULL);
    }
    expect(() => encryption?.encryptSection(section, UUIDs.section1)).toThrow(
      'realIndex is out of bounds',
    );
  });

  it('should throw if a vote has no data for a candidate', () => {
    // a missing key is already rejected by extractCandidateIds, so the key exists with no value
    const section = {
      votes: [{ [UUIDs.candidate1]: 1, [UUIDs.candidate2]: undefined }],
    } as unknown as PlainFilledBallotPaper['sections'][string];

    if (!encryption) {
      throw new Error(ENCRYPTION_IS_NULL);
    }
    expect(() => encryption?.encryptSection(section, UUIDs.section1)).toThrow(
      `Missing vote data for candidate ${UUIDs.candidate2}`,
    );
  });

  it('should not share randomness between the cells of a vote', () => {
    const candidates: string[] = [UUIDs.candidate1, UUIDs.candidate2, UUIDs.candidate3];
    const section = {
      votes: Array.from({ length: 20 }, (_, i) => ({
        [UUIDs.candidate1]: Number(i % 3 === 0),
        [UUIDs.candidate2]: Number(i % 3 === 1),
        [UUIDs.candidate3]: Number(i % 3 === 2),
        noVote: 0,
        invalid: 0,
      })),
    };

    if (!encryption) {
      throw new Error(ENCRYPTION_IS_NULL);
    }
    const [encryptedSection, auditableVotes] = encryption.encryptSection(section, UUIDs.section1);

    for (const [index, vote] of encryptedSection.votes.entries()) {
      expectFreshRandomness(
        vote,
        candidates.at(index % 3),
        auditableVotes.at(index)?.randomness ?? [],
      );
    }
  });
});
