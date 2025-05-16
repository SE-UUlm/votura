import { create } from 'zustand/react';
import type { StateCreator } from 'zustand/vanilla';

export interface MockElection {
  id: string;
  name: string;
  description: string;
  votingStart: Date;
  votingEnd: Date;
  immutableConfig: boolean;
  allowInvalidVotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mockElections: MockElection[] = [
  {
    id: 'election-001',
    name: 'Student Council Election 2025',
    description: 'Election to choose representatives for the student council.',
    votingStart: new Date('2025-06-01T08:00:00Z'),
    votingEnd: new Date('2025-06-05T18:00:00Z'),
    immutableConfig: true,
    allowInvalidVotes: false,
    createdAt: new Date('2025-05-01T10:00:00Z'),
    updatedAt: new Date('2025-05-10T14:30:00Z'),
  },
  {
    id: 'election-002',
    name: 'Board of Directors Vote',
    description: 'Annual vote to elect members to the board of directors.',
    votingStart: new Date('2025-07-10T09:00:00Z'),
    votingEnd: new Date('2025-07-15T17:00:00Z'),
    immutableConfig: false,
    allowInvalidVotes: true,
    createdAt: new Date('2025-05-05T09:00:00Z'),
    updatedAt: new Date('2025-05-12T11:45:00Z'),
  },
  {
    id: 'election-003',
    name: 'City Council Referendum',
    description: 'Public referendum on proposed city infrastructure changes.',
    votingStart: new Date('2025-08-20T07:00:00Z'),
    votingEnd: new Date('2025-08-25T20:00:00Z'),
    immutableConfig: true,
    allowInvalidVotes: false,
    createdAt: new Date('2025-05-08T08:15:00Z'),
    updatedAt: new Date('2025-05-14T16:00:00Z'),
  },
];

interface MockElectionSlice {
  elections: MockElection[];
  addElection: (election: MockElection) => void;
  deleteElection: (id: MockElection['id']) => void;
}

export const createMockElectionSlice: StateCreator<MockElectionSlice, [], [], MockElectionSlice> = (
  set,
) => ({
  elections: mockElections,
  addElection: (election) => set((state) => ({ elections: [...state.elections, election] })),
  deleteElection: (id) =>
    set((state) => ({ elections: state.elections.filter((e) => e.id !== id) })),
});

type StoreState = MockElectionSlice;

export const useStore = create<StoreState>()((...args) => ({
  ...createMockElectionSlice(...args),
}));
