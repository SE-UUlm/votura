import type { MockElection } from '../store/useStore.ts';

export const getDefaultMockElection = (partial: Partial<MockElection>): MockElection => {
  return {
    id: crypto.randomUUID(),
    name: 'Default Election Name',
    votingStart: new Date(),
    votingEnd: new Date(),
    immutableConfig: false,
    allowInvalidVotes: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
};
