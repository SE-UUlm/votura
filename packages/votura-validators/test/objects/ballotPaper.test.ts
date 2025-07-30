import { describe, expect, it } from 'vitest';
import {
  insertableBallotPaperObject,
  updateableBallotPaperObject,
} from '../../src/objects/ballotPaper.js';

describe('Ballot paper tests', () => {
  const demoBallotPaper = insertableBallotPaperObject.parse({
    name: 'Test ballot paper',
    description: 'Test ballot paper description',
    maxVotes: 5,
    maxVotesPerCandidate: 3,
  });

  it('Should not allow maxVotes < maxVotesPerCandidate', () => {
    const result = insertableBallotPaperObject.safeParse({
      ...demoBallotPaper,
      maxVotes: 1,
      maxVotesPerCandidate: 2,
    });
    expect(result.success).toBe(false);

    const result2 = updateableBallotPaperObject.safeParse({
      ...demoBallotPaper,
      maxVotes: 1000,
      maxVotesPerCandidate: 2000,
    });
    expect(result2.success).toBe(false);
  });
});
