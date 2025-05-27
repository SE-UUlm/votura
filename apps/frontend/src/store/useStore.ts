import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand/vanilla';

export interface MockElection {
  id: string;
  name: string;
  description?: string;
  votingStart: Date;
  votingEnd: Date;
  immutableConfig: boolean;
  allowInvalidVotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mockElections: MockElection[] = [
  {
    id: 'a66b576f-fb83-4e85-8ccf-f4e41b4e631c',
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
    id: 'bbd21601-0c26-490d-bcb9-6a0b3de55258',
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
    id: '60df49de-32f5-45b7-b8ee-f397815be7b5',
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
  // We may want to refactor this with an object using the election ids
  // as keys so we do not need to iterate over all elections so much
  elections: MockElection[];
  addElection: (election: MockElection) => void;
  deleteElection: (id: MockElection['id']) => void;
  updateElection: (id: MockElection['id'], partial: Partial<MockElection>) => void;
}

type StoreState = MockElectionSlice;

export const createMockElectionSlice: StateCreator<
  StoreState,
  [['zustand/devtools', never]], //https://zustand.docs.pmnd.rs/middlewares/devtools
  [],
  MockElectionSlice
> = (set) => ({
  elections: mockElections,
  addElection: (election) =>
    set(
      (state) => ({ elections: [...state.elections, election] }),
      undefined,
      'mockElectionSlice/addElection',
    ),
  deleteElection: (id) =>
    set(
      (state) => ({ elections: state.elections.filter((e) => e.id !== id) }),
      undefined,
      'mockElectionSlice/deleteElection',
    ),
  updateElection: (id, partial) =>
    set(
      (state) => ({
        elections: state.elections.map((election) =>
          election.id === id ? { ...election, ...partial } : election,
        ),
      }),
      undefined,
      'mockElectionSlice/updateElection',
    ),
});

export const useStore = create<StoreState>()(
  devtools((...args) => ({
    ...createMockElectionSlice(...args),
  })),
);
