import { describe, expect, it } from 'vitest';
import {
  encryptedFilledBallotPaperObject,
  type EncryptedFilledBallotPaper,
} from '../../src/objects/encryptedFilledBallotPaper.js';
import { filledBallotPaperDefaultVoteOption } from './filledBallotPaper.js';

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
  };

  const demoEncryptedFilledBallotPaperData: EncryptedFilledBallotPaper = {
    ballotPaperId: UUIDs.ballotPaper,
    sections: {
      [UUIDs.section1]: {
        votes: [
          {
            [UUIDs.candidate1]: {
              ...dummyVote,
            },
            [UUIDs.candidate2]: {
              ...dummyVote,
            },
            [filledBallotPaperDefaultVoteOption.noVote]: {
              ...dummyVote,
            },
            [filledBallotPaperDefaultVoteOption.invalid]: {
              ...dummyVote,
            },
          },
        ],
      },
      [UUIDs.section2]: {
        votes: [
          {
            [UUIDs.candidate3]: {
              ...dummyVote,
            },
            [filledBallotPaperDefaultVoteOption.noVote]: {
              ...dummyVote,
            },
            [filledBallotPaperDefaultVoteOption.invalid]: {
              ...dummyVote,
            },
          },
        ],
      },
    },
  };

  it('Should not throw error as the object is as expected', () => {
    const result = encryptedFilledBallotPaperObject.safeParse(demoEncryptedFilledBallotPaperData);
    expect(result.success).toBe(true);
  });
});
