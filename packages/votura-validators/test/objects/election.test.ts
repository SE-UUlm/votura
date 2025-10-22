import { describe, expect, it } from 'vitest';
import { insertableElectionObject, updateableElectionObject } from '../../src/objects/election.js';

describe('Election tests', () => {
  const demoElection = insertableElectionObject.parse({
    name: 'My test election',
    private: true,
    votingStartAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    votingEndAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    allowInvalidVotes: false,
  });

  it('Should not allow votingEndAt < votingStartAt', () => {
    const result = insertableElectionObject.safeParse({
      ...demoElection,
      votingEndAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    });
    expect(result.success).toBe(false);

    const result2 = updateableElectionObject.safeParse({
      ...demoElection,
      votingEndAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    });
    expect(result2.success).toBe(false);
  });
});
