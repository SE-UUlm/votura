import { Checkbox, Group, Text } from '@mantine/core';
import type { SelectableVotingElection } from '@repo/votura-validators';
import type { JSX } from 'react';
import type { Votes } from '../../../utils/createPlainFilledBallotPaper.ts';

type BallotPaper = SelectableVotingElection['ballotPaper'];
type BallotPaperSection = BallotPaper['ballotPaperSections'][number];
type Candidate = BallotPaperSection['candidates'][number];

interface CandidateVoteRowProps {
  candidate: Candidate;
  section: BallotPaperSection;
  ballotPaper: BallotPaper;
  votes: Votes;
  sectionVotes: number;
  totalVotes: number;
  votingHasNotStarted: boolean;
  selectedCheckboxes: boolean[];
  onCheckboxChange: (
    sectionId: string,
    candidateId: string,
    index: number,
    checked: boolean,
  ) => void;
}

export const CandidateVoteRow = ({
  candidate,
  section,
  ballotPaper,
  votes,
  sectionVotes,
  totalVotes,
  votingHasNotStarted,
  selectedCheckboxes,
  onCheckboxChange,
}: CandidateVoteRowProps): JSX.Element => {
  const candidateVotes = votes[section.id]?.[candidate.id] ?? 0;

  const candidateTotalVotes = ballotPaper.ballotPaperSections.reduce(
    (total, currentSection) => total + (votes[currentSection.id]?.[candidate.id] ?? 0),
    0,
  );

  const canIncrease =
    !votingHasNotStarted &&
    candidateVotes < section.maxVotesPerCandidate &&
    candidateTotalVotes < ballotPaper.maxVotesPerCandidate &&
    sectionVotes < section.maxVotes &&
    totalVotes < ballotPaper.maxVotes;

  return (
    <Group gap="md">
      <Group gap="xs">
        {Array.from({ length: section.maxVotesPerCandidate }, (_, index) => {
          const isChecked = selectedCheckboxes[index] ?? false;

          return (
            <Checkbox
              key={index}
              checked={isChecked}
              disabled={isChecked ? votingHasNotStarted : !canIncrease}
              onChange={(event) => {
                onCheckboxChange(section.id, candidate.id, index, event.currentTarget.checked);
              }}
            />
          );
        })}
      </Group>
      <Text fw={700}>{candidate.title}</Text>
      <Text>{candidate.description}</Text>
    </Group>
  );
};
