import { describe, expect, it } from 'vitest';
import { filledBallotPaperObject, type FilledBallotPaper } from '../../src/objects/filledBallotPaper.js';

describe('Filled Ballot Paper tests', () => {
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
  }

  const demoFilledBallotPaperData: FilledBallotPaper = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [
          {
            noVote: {
              ...dummyVote
            },
            invalid: {
              ...dummyVote
            },
            [UUIDs.candidate1]: {
              ...dummyVote
            },
            [UUIDs.candidate2]: {
              ...dummyVote
            },
          },
        ],
      },
      [UUIDs.section2]: {
        votes: [
          {
            noVote: {
              ...dummyVote
            },
            invalid: {
              ...dummyVote
            },
            [UUIDs.candidate3]: {
              ...dummyVote
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
    const voteWithoutInvalid = { ...demoFilledBallotPaperData.sections[UUIDs.section1]?.votes[0] };
    // remove the invalid field in the copied object
    delete voteWithoutInvalid.invalid;

    const result = filledBallotPaperObject.safeParse({
      ...demoFilledBallotPaperData,
      sections: {
        ...demoFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoFilledBallotPaperData.sections[UUIDs.section1],
          votes: [voteWithoutInvalid],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if "noVote"-key is not present in vote object', () => {
    const voteWithoutNoVote = { ...demoFilledBallotPaperData.sections[UUIDs.section1]?.votes[0] };
    delete voteWithoutNoVote.noVote;

    const result = filledBallotPaperObject.safeParse({
      ...demoFilledBallotPaperData,
      sections: {
        ...demoFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoFilledBallotPaperData.sections[UUIDs.section1],
          votes: [voteWithoutNoVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if no candidate (UUID) key is present in vote object', () => {
    const voteWithoutCandidates = {
      ...demoFilledBallotPaperData.sections[UUIDs.section2]?.votes[0],
    };
    delete voteWithoutCandidates[UUIDs.candidate3];

    const result = filledBallotPaperObject.safeParse({
      ...demoFilledBallotPaperData,
      sections: {
        ...demoFilledBallotPaperData.sections,
        [UUIDs.section2]: {
          ...demoFilledBallotPaperData.sections[UUIDs.section2],
          votes: [voteWithoutCandidates],
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
