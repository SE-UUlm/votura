import { describe, expect, it } from 'vitest';
import { filledBallotPaperObject } from '../../src/objects/filledBallotPaper.js';

describe('Filled Ballot Paper tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }

  const demoFilledBallotPaperData = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [
          {
            noVote: {
              alpha: 12345,
              beta: 67890,
              commitment1: 11111,
              commitment2: 22222,
              challenge: 33333,
              response: 44444,
            },
            invalid: {
              alpha: 98765,
              beta: 43210,
              commitment1: 55555,
              commitment2: 66666,
              challenge: 77777,
              response: 88888,
            },
            [UUIDs.candidate1]: {
              alpha: 13579,
              beta: 24680,
              commitment1: 97531,
              commitment2: 86420,
              challenge: 75319,
              response: 64208,
            },
            [UUIDs.candidate2]: {
              alpha: 11223,
              beta: 33445,
              commitment1: 55667,
              commitment2: 77889,
              challenge: 99001,
              response: 12234,
            },
          },
        ],
      },
      [UUIDs.section2]: {
        votes: [
          {
            noVote: {
              alpha: 54321,
              beta: 19876,
              commitment1: 19283,
              commitment2: 37465,
              challenge: 55647,
              response: 73829,
            },
            invalid: {
              alpha: 10293,
              beta: 48576,
              commitment1: 92837,
              commitment2: 46510,
              challenge: 83749,
              response: 20184,
            },
            [UUIDs.candidate3]: {
              alpha: 56789,
              beta: 12345,
              commitment1: 67890,
              commitment2: 23456,
              challenge: 78901,
              response: 34567,
            },
          },
        ],
      },
    },
  };

  it('Should not throw error as the object is as expected', () => {
    const result = filledBallotPaperObject.safeParse(demoFilledBallotPaperData);
    expect(result.success).toBe(true);
  });

  it('Should throw error if "invalid"-key is not present in vote object', () => {
    // Create copy of the first object in votes for UUIDs.section1
    const voteWithoutInvalid = { ...demoFilledBallotPaperData.sections[UUIDs.section1].votes[0] };
    // remove the invalid field in the copied object
    delete voteWithoutInvalid.invalid;

    const result = filledBallotPaperObject.safeParse({
      ...demoFilledBallotPaperData,
      sections: {
        ...demoFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          votes: [voteWithoutInvalid],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if "noVote"-key is not present in vote object', () => {
    const voteWithoutNoVote = { ...demoFilledBallotPaperData.sections[UUIDs.section1].votes[0] };
    delete voteWithoutNoVote.noVote;

    const result = filledBallotPaperObject.safeParse({
      ...demoFilledBallotPaperData,
      sections: {
        ...demoFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          votes: [voteWithoutNoVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if no candidate (UUID) key is present in vote object', () => {
    const voteWithoutCandidates = {
      ...demoFilledBallotPaperData.sections[UUIDs.section2].votes[0],
    };
    delete voteWithoutCandidates[UUIDs.candidate3];

    const result = filledBallotPaperObject.safeParse({
      ...demoFilledBallotPaperData,
      sections: {
        ...demoFilledBallotPaperData.sections,
        [UUIDs.section2]: {
          votes: [voteWithoutCandidates],
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
