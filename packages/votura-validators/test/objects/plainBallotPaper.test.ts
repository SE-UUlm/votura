import { describe, expect, it } from 'vitest';
import {
  plainBallotPaperDefaultVoteOption,
  plainBallotPaperObject,
  type PlainBallotPaper,
} from '../../src/objects/plainBallotPaper.js';

describe('Plain Ballot Paper tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }

  const demoPlainBallotPaperData: PlainBallotPaper = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate2]: 1,
            [UUIDs.candidate3]: 0,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 1,
            [UUIDs.candidate2]: 0,
            [UUIDs.candidate3]: 0,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate2]: 1,
            [UUIDs.candidate3]: 0,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate2]: 0,
            [UUIDs.candidate3]: 0,
            [plainBallotPaperDefaultVoteOption.noVote]: 1,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
        ],
      },
      [UUIDs.section2]: {
        votes: [
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate3]: 1,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate3]: 1,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 1,
            [UUIDs.candidate3]: 0,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
          {
            [UUIDs.candidate1]: 0,
            [UUIDs.candidate3]: 1,
            [plainBallotPaperDefaultVoteOption.noVote]: 0,
            [plainBallotPaperDefaultVoteOption.invalid]: 0,
          },
        ],
      },
    },
  };

  it('Should not throw error as the object is valid', () => {
    const result = plainBallotPaperObject.safeParse(demoPlainBallotPaperData);
    expect(result.success).toBe(true);
  });

  it('Should throw error if "invalid"-key is missing in vote object', () => {
    // Create copy of the first object in votes for UUIDs.section1
    const voteWithoutInvalid = { ...demoPlainBallotPaperData.sections[UUIDs.section1]?.votes[0] };
    // remove the invalid field in the copied object
    delete voteWithoutInvalid[plainBallotPaperDefaultVoteOption.invalid];

    const result = plainBallotPaperObject.safeParse({
      ...demoPlainBallotPaperData,
      sections: {
        ...demoPlainBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoPlainBallotPaperData.sections[UUIDs.section1],
          votes: [voteWithoutInvalid],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if "noVote"-key is missing in vote object', () => {
    const voteWithoutNoVote = { ...demoPlainBallotPaperData.sections[UUIDs.section1]?.votes[0] };
    delete voteWithoutNoVote[plainBallotPaperDefaultVoteOption.noVote];

    const result = plainBallotPaperObject.safeParse({
      ...demoPlainBallotPaperData,
      sections: {
        ...demoPlainBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoPlainBallotPaperData.sections[UUIDs.section1],
          votes: [voteWithoutNoVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if no candidate (UUID) key is present in vote object', () => {
    const voteWithoutCandidates = {
      ...demoPlainBallotPaperData.sections[UUIDs.section2]?.votes[0],
    };
    delete voteWithoutCandidates[UUIDs.candidate3];

    const result = plainBallotPaperObject.safeParse({
      ...demoPlainBallotPaperData,
      sections: {
        ...demoPlainBallotPaperData.sections,
        [UUIDs.section2]: {
          ...demoPlainBallotPaperData.sections[UUIDs.section2],
          votes: [voteWithoutCandidates],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if more than one option is set to 1', () => {
    const invalidVote = {
      ...demoPlainBallotPaperData.sections[UUIDs.section1]?.votes[0],
      [UUIDs.candidate3]: 1, // additional 1
    };

    const result = plainBallotPaperObject.safeParse({
      ...demoPlainBallotPaperData,
      sections: {
        ...demoPlainBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoPlainBallotPaperData.sections[UUIDs.section1],
          votes: [invalidVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
