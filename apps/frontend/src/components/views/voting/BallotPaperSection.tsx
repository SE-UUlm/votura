import { Grid, Paper, Space, Stack, Text, Title } from '@mantine/core';
import type { SelectableVotingElection } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { Votes } from '../../../utils/createPlainFilledBallotPaper.ts';
import { CandidateVoteRow } from './CandidateVoteRow.tsx';

type BallotPaper = SelectableVotingElection['ballotPaper'];
type BallotPaperSectionType = BallotPaper['ballotPaperSections'][number];

interface BallotPaperSectionProps {
  section: BallotPaperSectionType;
  ballotPaper: BallotPaper;
  votes: Votes;
  totalVotes: number;
  votingHasNotStarted: boolean;
  onVoteChange: (sectionId: string, candidateId: string, change: number) => void;
}

export const BallotPaperSection = ({
  section,
  ballotPaper,
  votes,
  totalVotes,
  votingHasNotStarted,
  onVoteChange,
}: BallotPaperSectionProps): JSX.Element => {
  const { t } = useTranslation();

  const sectionVotes = section.candidates.reduce(
    (sum, candidate) => sum + (votes[section.id]?.[candidate.id] ?? 0),
    0,
  );

  return (
    <Paper p="md" radius="md">
      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap={0}>
            <Title order={3}>{section.name}</Title>
            <Text>{section.description}</Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 2 }}>
          <Text fw={700}>{t('maxVotes', 'Max. Votes')}</Text>
          <Text>
            {sectionVotes}/{section.maxVotes}
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Text fw={700}>{t('maxVotesPerCandidate', 'Max. Votes per Candidate')}</Text>
          <Text>{section.maxVotesPerCandidate}</Text>
        </Grid.Col>
      </Grid>

      <Space h="sm" />

      <Stack gap="xs">
        {section.candidates.map((candidate) => (
          <CandidateVoteRow
            key={candidate.id}
            candidate={candidate}
            section={section}
            ballotPaper={ballotPaper}
            votes={votes}
            sectionVotes={sectionVotes}
            totalVotes={totalVotes}
            votingHasNotStarted={votingHasNotStarted}
            onVoteChange={onVoteChange}
          />
        ))}
      </Stack>
    </Paper>
  );
};
