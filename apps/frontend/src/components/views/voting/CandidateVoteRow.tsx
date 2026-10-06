import { ActionIcon, Group, Text } from '@mantine/core';
import type { SelectableVotingElection } from '@repo/votura-validators';
import { IconMinus, IconPlus } from '@tabler/icons-react';
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
  onVoteChange: (sectionId: string, candidateId: string, change: number) => void;
}

export const CandidateVoteRow = ({
  candidate,
  section,
  ballotPaper,
  votes,
  sectionVotes,
  totalVotes,
  votingHasNotStarted,
  onVoteChange,
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

  const canDecrease = candidateVotes > 0;

  return (
    <Group gap="md">
      <Group gap={4}>
        <ActionIcon
          variant="outline"
          size="sm"
          onClick={(): void => {
            onVoteChange(section.id, candidate.id, -1);
          }}
          disabled={!canDecrease}
        >
          <IconMinus size={16} />
        </ActionIcon>

        <Text w={24} ta="center" fw={600}>
          {candidateVotes}
        </Text>

        <ActionIcon
          variant="outline"
          size="sm"
          onClick={(): void => {
            onVoteChange(section.id, candidate.id, 1);
          }}
          disabled={!canIncrease}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>

      <Text fw={700}>{candidate.title}</Text>
      <Text>{candidate.description}</Text>
    </Group>
  );
};
