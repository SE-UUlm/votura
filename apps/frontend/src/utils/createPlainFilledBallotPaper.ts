import {
  filledBallotPaperDefaultVoteOption,
  type PlainFilledBallotPaper,
  type SelectableVotingElection,
} from '@repo/votura-validators';

export type Votes = Record<string, Record<string, number>>;

const createVote = (
  candidateIds: string[],
  selectedCandidateId?: string,
): Record<string, 0 | 1> => {
  const candidateVotes = Object.fromEntries(
    candidateIds.map((candidateId) => [candidateId, candidateId === selectedCandidateId ? 1 : 0]),
  ) as Record<string, 0 | 1>;

  return {
    ...candidateVotes,
    [filledBallotPaperDefaultVoteOption.noVote]: selectedCandidateId === undefined ? 1 : 0,
    [filledBallotPaperDefaultVoteOption.invalid]: 0,
  };
};

export const createPlainFilledBallotPaper = (
  ballotPaper: SelectableVotingElection['ballotPaper'],
  votes: Votes,
): PlainFilledBallotPaper => {
  const sections: PlainFilledBallotPaper['sections'] = {};

  for (const section of ballotPaper.ballotPaperSections) {
    const sectionVotes: PlainFilledBallotPaper['sections'][string]['votes'] = [];

    const candidateIds = section.candidates.map((candidate) => candidate.id);

    for (const candidateId of candidateIds) {
      const candidateVotes = votes[section.id]?.[candidateId] ?? 0;

      for (let i = 0; i < candidateVotes; i++) {
        sectionVotes.push(createVote(candidateIds, candidateId));
      }
    }

    const remainingVotes = section.maxVotes - sectionVotes.length;

    for (let i = 0; i < remainingVotes; i++) {
      sectionVotes.push(createVote(candidateIds));
    }

    sections[section.id] = {
      votes: sectionVotes,
    };
  }

  return {
    ballotPaperId: ballotPaper.id,
    sections,
  };
};
