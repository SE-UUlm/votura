export const maxVotesRefinement = (data: {
  maxVotes: number;
  maxVotesPerCandidate: number;
}): boolean => data.maxVotes >= data.maxVotesPerCandidate;
export const maxVotesRefinementMessage =
  'maxVotes must be greater than or equal to maxVotesPerCandidate';
