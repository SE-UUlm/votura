import { describe, expect, it } from 'vitest';
import type z from 'zod/v4';
import {
  encryptedFilledBallotPaperObject,
  filledBallotPaperDefaultVoteOption,
  plainFilledBallotPaperObject,
  type EncryptedVote,
  type PlainVote,
} from '../../src/objects/filledBallotPaper.js';

describe('Filled Ballot Paper tests', () => {
  enum UUIDs {
    ballotPaper = '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    section1 = 'f87cff56-13a4-4c69-9021-3aa864100ca8',
    section2 = 'b434e057-fb55-4e38-800c-4f23d9df27f7',
    candidate1 = '9112c5e8-53ef-44cb-b9aa-47a97b0cae51',
    candidate2 = 'f792d5ca-65aa-4167-8f83-06e909051005',
    candidate3 = '1c0f870f-4c85-4cf0-9a00-078f3f93737c',
  }

  const dummyEncryptedVote: EncryptedVote = {
    alpha: BigInt(5),
    beta: BigInt(3),
    commitment1: BigInt(7),
    commitment2: BigInt(11),
    challenge: BigInt(13),
    response: BigInt(17),
  };

  const dummyEncryptedVotes1: Record<string, EncryptedVote> = {
    [UUIDs.candidate1]: { ...dummyEncryptedVote },
    [UUIDs.candidate2]: { ...dummyEncryptedVote },
    [UUIDs.candidate3]: { ...dummyEncryptedVote },
    [filledBallotPaperDefaultVoteOption.noVote]: { ...dummyEncryptedVote },
    [filledBallotPaperDefaultVoteOption.invalid]: { ...dummyEncryptedVote },
  };
  const dummyEncryptedVotes2: Record<string, EncryptedVote> = {
    [UUIDs.candidate1]: { ...dummyEncryptedVote },
    [UUIDs.candidate2]: { ...dummyEncryptedVote },
    [filledBallotPaperDefaultVoteOption.noVote]: { ...dummyEncryptedVote },
    [filledBallotPaperDefaultVoteOption.invalid]: { ...dummyEncryptedVote },
  };
  const dummyEncryptedVotes3: Record<string, EncryptedVote> = {
    [UUIDs.candidate3]: { ...dummyEncryptedVote },
    [filledBallotPaperDefaultVoteOption.noVote]: { ...dummyEncryptedVote },
    [filledBallotPaperDefaultVoteOption.invalid]: { ...dummyEncryptedVote },
  };

  const dummyPlainVotes1: Record<string, PlainVote> = {
    [UUIDs.candidate1]: 0,
    [UUIDs.candidate2]: 1,
    [UUIDs.candidate3]: 0,
    [filledBallotPaperDefaultVoteOption.noVote]: 0,
    [filledBallotPaperDefaultVoteOption.invalid]: 0,
  };
  const dummyPlainVotes2: Record<string, PlainVote> = {
    [UUIDs.candidate1]: 1,
    [UUIDs.candidate2]: 0,
    [filledBallotPaperDefaultVoteOption.noVote]: 0,
    [filledBallotPaperDefaultVoteOption.invalid]: 0,
  };
  const dummyPlainVotes3: Record<string, PlainVote> = {
    [UUIDs.candidate3]: 0,
    [filledBallotPaperDefaultVoteOption.noVote]: 1,
    [filledBallotPaperDefaultVoteOption.invalid]: 0,
  };

  const demoEncryptedFilledBallotPaperData: z.infer<typeof encryptedFilledBallotPaperObject> = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [dummyEncryptedVotes1],
      },
      [UUIDs.section2]: {
        votes: [dummyEncryptedVotes2, dummyEncryptedVotes3],
      },
    },
  };

  const demoPlainFilledBallotPaperData: z.infer<typeof plainFilledBallotPaperObject> = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [dummyPlainVotes1],
      },
      [UUIDs.section2]: {
        votes: [dummyPlainVotes2, dummyPlainVotes3],
      },
    },
  };

  it('Should not throw error as the EncryptedBallotPaper object is as expected', () => {
    const result = encryptedFilledBallotPaperObject.safeParse(demoEncryptedFilledBallotPaperData);
    expect(result.success).toBe(true);
  });

  it('Should not throw error as the PlainBallotPaper object is as expected', () => {
    const result = plainFilledBallotPaperObject.safeParse(demoPlainFilledBallotPaperData);
    expect(result.success).toBe(true);
  });

  it('Should throw error if "invalid"-key is missing in vote object', () => {
    // Create copy of the first object in votes for UUIDs.section1
    const voteWithoutInvalid = {
      ...demoPlainFilledBallotPaperData.sections[UUIDs.section1]?.votes[0],
    };
    // remove the invalid field in the copied object
    delete voteWithoutInvalid[filledBallotPaperDefaultVoteOption.invalid];

    const result = plainFilledBallotPaperObject.safeParse({
      ...demoPlainFilledBallotPaperData,
      sections: {
        ...demoPlainFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoPlainFilledBallotPaperData.sections[UUIDs.section1],
          votes: [voteWithoutInvalid],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if "noVote"-key is missing in vote object', () => {
    const voteWithoutNoVote = {
      ...demoEncryptedFilledBallotPaperData.sections[UUIDs.section1]?.votes[0],
    };
    delete voteWithoutNoVote[filledBallotPaperDefaultVoteOption.noVote];

    const result = encryptedFilledBallotPaperObject.safeParse({
      ...demoEncryptedFilledBallotPaperData,
      sections: {
        ...demoEncryptedFilledBallotPaperData.sections,
        [UUIDs.section1]: {
          ...demoEncryptedFilledBallotPaperData.sections[UUIDs.section1],
          votes: [voteWithoutNoVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if no candidate (UUID) key is present in vote object', () => {
    const voteWithoutCandidates = {
      ...demoPlainFilledBallotPaperData.sections[UUIDs.section2]?.votes[1],
    };
    delete voteWithoutCandidates[UUIDs.candidate3];

    const result = plainFilledBallotPaperObject.safeParse({
      ...demoPlainFilledBallotPaperData,
      sections: {
        ...demoPlainFilledBallotPaperData.sections,
        [UUIDs.section2]: {
          ...demoPlainFilledBallotPaperData.sections[UUIDs.section2],
          votes: [voteWithoutCandidates],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('Should throw error if object consists of both plain and encrypted votes', () => {
    const voteWithMixedTypes = {
      ballotPaperId: UUIDs.ballotPaper,
      sections: {
        [UUIDs.section1]: {
          votes: [dummyPlainVotes1],
        },
        [UUIDs.section2]: {
          votes: [dummyEncryptedVotes2, dummyEncryptedVotes3],
        },
      },
    };

    const resultPlain = plainFilledBallotPaperObject.safeParse(voteWithMixedTypes);
    expect(resultPlain.success).toBe(false);

    const resultEncrypted = encryptedFilledBallotPaperObject.safeParse(voteWithMixedTypes);
    expect(resultEncrypted.success).toBe(false);
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
        [UUIDs.section2]: {
          ...demoPlainFilledBallotPaperData.sections[UUIDs.section2], 
          votes: [invalidVote],
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
