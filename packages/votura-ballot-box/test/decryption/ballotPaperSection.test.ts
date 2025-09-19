import { filledBallotPaperObject } from '@repo/votura-validators';
import { getKeyPair, type KeyPair } from '@votura/votura-crypto/index';
import { modPow } from 'bigint-crypto-utils';
import { beforeAll, describe, expect, it } from 'vitest';
import { BallotPaperSectionDecryption } from '../../src/decryption/ballotPaperSection.js';

describe('BallotPaperSectionDecryption tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }
  const dummyVote = {
    alpha: BigInt(5),
    beta: BigInt(3),
    commitment1: BigInt(7),
    commitment2: BigInt(11),
    challenge: BigInt(13),
    response: BigInt(17),
  };

  const dummySection = {
    votes: [
      {
        [UUIDs.candidate1]: { ...dummyVote },
        [UUIDs.candidate2]: { ...dummyVote },
        noVote: { ...dummyVote },
        invalid: { ...dummyVote },
      },
      {
        [UUIDs.candidate1]: { ...dummyVote },
        [UUIDs.candidate2]: { ...dummyVote },
        noVote: { ...dummyVote },
        invalid: { ...dummyVote },
      },
    ],
  };
  let decryption: BallotPaperSectionDecryption | null = null;
  let keyPair: KeyPair | null = null;

  beforeAll(async () => {
    keyPair = await getKeyPair(20);
    decryption = new BallotPaperSectionDecryption(keyPair.privateKey);
  });

  it('should throw if lookup table not initialized', () => {
    const section = {
      votes: [],
    };

    expect(() => decryption?.decryptSection(section, 'section-1')).toThrowError(
      'Lookup table not initialized. Call calculateLookupTable() first.',
    );
  });

  it('should extract all ciphertexts correctly', () => {
    const parseResult = filledBallotPaperObject.safeParse({
      ballotPaperId: UUIDs.ballotPaper,
      sections: {
        [UUIDs.section1]: dummySection,
      },
    });
    expect(parseResult.success).toBe(true);

    // Accessing private method via bracket notation for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const ciphertexts = decryption?.['extractAllCiphertexts'](
      dummySection,
      // eslint-disable-next-line @typescript-eslint/dot-notation
      decryption?.['extractCandidateIds'](dummySection),
    );
    expect(ciphertexts).toEqual([
      [
        [dummyVote.alpha, dummyVote.beta], // candidate 1
        [dummyVote.alpha, dummyVote.beta], // candidate 2
        [dummyVote.alpha, dummyVote.beta], // invalid
        [dummyVote.alpha, dummyVote.beta], // noVote
      ],
      [
        [dummyVote.alpha, dummyVote.beta], // candidate 1
        [dummyVote.alpha, dummyVote.beta], // candidate 2
        [dummyVote.alpha, dummyVote.beta], // invalid
        [dummyVote.alpha, dummyVote.beta], // noVote
      ],
    ]);
  });

  it('should throw if calculateLookupTable called with negative maxVotes', () => {
    expect(() => {
      decryption?.calculateLookupTable(-1);
    }).toThrowError('maxVotes must be a non-negative integer');
  });

  it('should calculate lookup table without errors', () => {
    expect(() => {
      decryption?.calculateLookupTable(10);
    }).not.toThrow();
  });

  it('should throw error when extracting candidate IDs from section with no votes', () => {
    const emptySection = {
      votes: [],
    };

    expect(() => {
      // Accessing private method via bracket notation for testing purposes
      // eslint-disable-next-line @typescript-eslint/dot-notation
      decryption?.['extractCandidateIds'](emptySection);
    }).toThrowError('No votes found in section');
  });

  it('should extract candidate IDs correctly', () => {
    const parseResult = filledBallotPaperObject.safeParse({
      ballotPaperId: UUIDs.ballotPaper,
      sections: {
        [UUIDs.section1]: dummySection,
      },
    });
    expect(parseResult.success).toBe(true);

    // Accessing private method via bracket notation for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const candidateIds = decryption?.['extractCandidateIds'](dummySection);
    expect(candidateIds).toEqual([UUIDs.candidate1, UUIDs.candidate2, 'invalid', 'noVote']); // manually ordered in alphabetical order
  });

  it('should throw error when extracting ciphertexts from candidate with no vote data', () => {
    const sectionWithMissingVoteData = {
      votes: [
        {
          [UUIDs.candidate1]: { ...dummyVote },
          // candidate 2 is missing
          noVote: { ...dummyVote },
          invalid: { ...dummyVote },
        },
      ],
    };

    expect(() => {
      // Accessing private method via bracket notation for testing purposes
      // eslint-disable-next-line @typescript-eslint/dot-notation
      decryption?.['extractAllCiphertexts'](
        sectionWithMissingVoteData,
        // eslint-disable-next-line @typescript-eslint/dot-notation
        decryption?.['extractCandidateIds'](dummySection),
      );
    }).toThrowError(`Missing vote data for candidate ${UUIDs.candidate2}`);
  });

  it('should convert encoded votes to plaintext counts correctly and throw error if lookup table is too small', () => {
    if (decryption === null || keyPair === null) {
      throw new Error('Decryption or keyPair not initialized');
    }

    decryption.calculateLookupTable(7);

    const generator = keyPair.publicKey.getGenerator();
    const primeP = keyPair.publicKey.getPrimeP();
    const encodedVotes = [
      modPow(generator, 3n, primeP),
      modPow(generator, 5n, primeP),
      modPow(generator, 7n, primeP),
    ];

    // Accessing private method via bracket notation for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const plaintextCounts = decryption['convertToVoteCounts'](encodedVotes);
    expect(plaintextCounts).toEqual([3, 5, 7]);

    const encodedVotesWithTooLargeValue = [modPow(generator, 11n, primeP)]; // 11 is too large for lookup table of size 7

    // Accessing private method via bracket notation for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(() => decryption?.['convertToVoteCounts'](encodedVotesWithTooLargeValue)).toThrowError(
      'Unable to decode encoded sum. Lookup table may be too small.',
    );
  });

  it('should correctly build a DecryptedSection object and detect if data is missing for a candidate', () => {
    // Accessing private method via bracket notation for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const decryptedSection = decryption?.['buildDecryptedSection'](
      UUIDs.section1,
      [UUIDs.candidate1, UUIDs.candidate2, 'invalid', 'noVote'],
      [2, 3, 1, 4],
    );
    expect(decryptedSection).toEqual({
      sectionId: UUIDs.section1,
      candidateResults: {
        [UUIDs.candidate1]: 2,
        [UUIDs.candidate2]: 3,
      },
      noVoteCount: 4,
      invalidCount: 1,
    });

    // voteCounts is one element short
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/dot-notation
      decryption?.['buildDecryptedSection'](
        UUIDs.section1,
        [UUIDs.candidate1, UUIDs.candidate2, 'invalid', 'noVote'],
        [2, 3, 1],
      ),
    ).toThrowError('Vote count is undefined at index 3. Length mismatch: true');

    // candidateIds is sparse (array has a hole)
    const candidateIds = [UUIDs.candidate1, UUIDs.candidate2, 'invalid', 'noVote'];
    candidateIds[8] = 'some-other-candidate'; // create a sparse array
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/dot-notation
      decryption?.['buildDecryptedSection'](UUIDs.section1, candidateIds, [2, 3, 1, 4]),
    ).toThrowError('Candidate ID is undefined at index 4');
  });
});
