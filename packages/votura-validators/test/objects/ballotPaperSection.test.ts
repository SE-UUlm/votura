import { describe, expect, it } from 'vitest';
import {
  insertableBallotPaperSectionObject,
  updateableBallotPaperSectionObject,
} from '../../src/objects/ballotPaperSection.js';

describe('Ballot paper section tests', () => {
  const demoBallotPaperSection = insertableBallotPaperSectionObject.parse({
    name: 'Test ballot paper',
    description: 'Test ballot paper description',
    maxVotes: 5,
    maxVotesPerCandidate: 3,
  });

  it('Should not allow maxVotes < maxVotesPerCandidate', () => {
    const result = insertableBallotPaperSectionObject.safeParse({
      ...demoBallotPaperSection,
      maxVotes: 15,
      maxVotesPerCandidate: 16,
    });
    expect(result.success).toBe(false);

    const result2 = updateableBallotPaperSectionObject.safeParse({
      ...demoBallotPaperSection,
      maxVotes: 1234,
      maxVotesPerCandidate: 4321,
    });
    expect(result2.success).toBe(false);
  });
});
