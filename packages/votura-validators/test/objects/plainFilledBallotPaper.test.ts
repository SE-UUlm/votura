import { describe, expect, it } from 'vitest';
import { filledBallotPaperDefaultVoteOption } from './filledBallotPaper.js';
import {
  plainFilledBallotPaperObject,
  type PlainFilledBallotPaper,
} from './plainFilledBallotPaper.js';

describe('Plain Ballot Paper tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }

  const demoPlainFilledBallotPaperData: PlainFilledBallotPaper = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate2]: 1,
            [UUIDs.candidate3]: 0,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 1,
            [UUIDs.candidate2]: 0,
            [UUIDs.candidate3]: 0,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate2]: 1,
            [UUIDs.candidate3]: 0,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate2]: 0,
            [UUIDs.candidate3]: 0,
            [filledBallotPaperDefaultVoteOption.noVote]: 1,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
        ],
      },
      [UUIDs.section2]: {
        votes: [
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate3]: 1,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate3]: 1,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 1,
            [UUIDs.candidate3]: 0,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate3]: 1,
            [filledBallotPaperDefaultVoteOption.noVote]: 0,
            [filledBallotPaperDefaultVoteOption.invalid]: 0,
          },
        ],
      },
    },
  };

  it('Should not throw error as the object is valid', () => {
    const result = plainFilledBallotPaperObject.safeParse(demoPlainFilledBallotPaperData);
    expect(result.success).toBe(true);
  });

  it('Should throw error if no option is set to 1', () => {
    const invalidVote = {
      ...demoPlainFilledBallotPaperData.sections[UUIDs.section1]?.votes[0],
      [UUIDs.candidate2]: 0, // remove the 1
    };

    const result = plainFilledBallotPaperObject.safeParse({
      ...demoPlainFilledBallotPaperData,
      sections: {
        ...demoPlainFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoPlainFilledBallotPaperData.sections[UUIDs.section1],
          votes: [invalidVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if more than one option is set to 1', () => {
    const invalidVote = {
      ...demoPlainFilledBallotPaperData.sections[UUIDs.section2]?.votes[0],
      [UUIDs.candidate1]: 1, // additional 1
    };

    const result = plainFilledBallotPaperObject.safeParse({
      ...demoPlainFilledBallotPaperData,
      sections: {
        ...demoPlainFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoPlainFilledBallotPaperData.sections[UUIDs.section1],
          votes: [invalidVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
