import { describe, expect, it } from 'vitest';
import { insertableElectionObject } from '../../src/objects/election.js';
import { zodErrorToResponse400 } from '../../src/objects/response.js';

describe('Election tests', () => {
  const brokenDemoElection = {
    name: 'My test election',
    private: 'true',
    votingStartAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    votingEndAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    allowInvalidVotes: 1,
  };

  it('Should not allow votingEndAt < votingStartAt', () => {
    const result = insertableElectionObject.safeParse({
      ...brokenDemoElection,
    });
    expect(result.success).toBe(false);

    if (result.error !== undefined) {
      const response = zodErrorToResponse400(result.error);
      expect(response.message).not.toBe('');
    }
  });
});
