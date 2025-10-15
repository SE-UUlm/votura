import { encryptedFilledBallotPaperObject } from '@repo/votura-validators';
import { describe, expect, it } from 'vitest';
import { extractCandidateIds } from '../src/utils.js';

describe('Votura Ballot Box utils tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }
  const dummyVote = {
    alpha: '5',
    beta: '3',
    commitment1: '7',
    commitment2: '11',
    challenge: '13',
    response: '17',
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

  it('should throw error if extracting candidate IDs from section with no votes', () => {
    const emptySection = {
      votes: [],
    };

    expect(() => {
      extractCandidateIds(emptySection);
    }).toThrowError('No votes found in section.');
  });

  it('should throw error if votes have different number of candidates', () => {
    const differentKeyCountSection = {
      votes: [
        {
          [UUIDs.candidate1]: { ...dummyVote },
          [UUIDs.candidate2]: { ...dummyVote },
          noVote: { ...dummyVote },
          invalid: { ...dummyVote },
        },
        {
          [UUIDs.candidate1]: { ...dummyVote },
          noVote: { ...dummyVote },
          invalid: { ...dummyVote },
        },
      ],
    };

    expect(() => {
      extractCandidateIds(differentKeyCountSection);
    }).toThrowError(/different number of candidates/);
  });

  it('should throw error if votes have mismatching candidate IDs', () => {
    const differentKeysSection = {
      votes: [
        {
          [UUIDs.candidate1]: { ...dummyVote },
          [UUIDs.candidate2]: { ...dummyVote },
          noVote: { ...dummyVote },
          invalid: { ...dummyVote },
        },
        {
          [UUIDs.candidate1]: { ...dummyVote },
          [UUIDs.candidate3]: { ...dummyVote },
          noVote: { ...dummyVote },
          invalid: { ...dummyVote },
        },
      ],
    };

    expect(() => {
      extractCandidateIds(differentKeysSection);
    }).toThrowError(/different candidateIds/);
  });

  it('should extract candidate IDs correctly', () => {
    const parseResult = encryptedFilledBallotPaperObject.safeParse({
      ballotPaperId: UUIDs.ballotPaper,
      sections: {
        [UUIDs.section1]: dummySection,
      },
    });
    expect(parseResult.success).toBe(true);

    const candidateIds = extractCandidateIds(dummySection);
    expect(candidateIds).toEqual([UUIDs.candidate1, UUIDs.candidate2, 'invalid', 'noVote']); // manually ordered in alphabetical order
  });
});
