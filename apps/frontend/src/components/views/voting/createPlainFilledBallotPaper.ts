import {
  filledBallotPaperDefaultVoteOption,
  type PlainFilledBallotPaper,
  type SelectableVotingElection,
} from '@repo/votura-validators';

type Votes = Record<string, Record<string, number>>;

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
        const vote: Record<string, 0 | 1> = {};

        for (const id of candidateIds) {
          vote[id] = id === candidateId ? 1 : 0;
        }

        vote[filledBallotPaperDefaultVoteOption.noVote] = 0;
        vote[filledBallotPaperDefaultVoteOption.invalid] = 0;

        sectionVotes.push(vote);
      }
    }

    const remainingVotes = section.maxVotes - sectionVotes.length;

    for (let i = 0; i < remainingVotes; i++) {
      const vote: Record<string, 0 | 1> = {};

      for (const candidateId of candidateIds) {
        vote[candidateId] = 0;
      }

      vote[filledBallotPaperDefaultVoteOption.noVote] = 1;
      vote[filledBallotPaperDefaultVoteOption.invalid] = 0;

      sectionVotes.push(vote);
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