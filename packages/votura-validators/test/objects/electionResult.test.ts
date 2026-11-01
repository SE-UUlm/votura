import { describe, expect, it } from 'vitest';
import { selectableElectionResultObject } from '../../src/objects/electionResult.js';

describe('Election result tests', () => {
  const demoCandidate = {
    id: 'f792d5ca-65aa-4167-8f83-06e909051005',
    title: 'Option A',
    count: 3,
    ciphertext: { alpha: '12345', beta: '67890' },
    proof: {
      commitment1: '1345789',
      commitment2: '9072314',
      challenge: '76687914',
      response: '2013945',
    },
  };
  const demoElectionResult = {
    electionId: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
    publishedAt: new Date().toISOString(),
    pubKey: '11',
    primeP: '23',
    primeQ: '11',
    generator: '4',
    ballotPapers: [
      {
        id: '2d38c96f-42ac-4c3f-9734-7193e9c64424',
        name: 'My ballot paper',
        ballotsCast: 5,
        invalidCount: 1,
        ballotPaperSections: [
          {
            id: '123e4567-e89b-42d3-a456-426614174000',
            name: 'My ballot paper section',
            noVoteCount: 1,
            candidates: [demoCandidate],
          },
        ],
      },
    ],
  };

  it('Should accept a valid election result', () => {
    const result = selectableElectionResultObject.safeParse(demoElectionResult);
    expect(result.success).toBe(true);
  });

  it('Should not allow negative counts', () => {
    const result = selectableElectionResultObject.safeParse({
      ...demoElectionResult,
      ballotPapers: [{ ...demoElectionResult.ballotPapers[0], invalidCount: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('Should not allow a ciphertext that is not a number', () => {
    const section = demoElectionResult.ballotPapers[0]?.ballotPaperSections[0];
    const result = selectableElectionResultObject.safeParse({
      ...demoElectionResult,
      ballotPapers: [
        {
          ...demoElectionResult.ballotPapers[0],
          ballotPaperSections: [
            {
              ...section,
              candidates: [{ ...demoCandidate, ciphertext: { alpha: 'abc', beta: '1' } }],
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
