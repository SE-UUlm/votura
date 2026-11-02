import { Grid, Paper, SimpleGrid, Space, Stack, Text, Title } from '@mantine/core';
import type { SelectableElectionResult } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { CandidateResultsTable } from './CandidateResultsTable.tsx';

export interface BallotPaperResultCardProps {
  ballotPaper: SelectableElectionResult['ballotPapers'][number];
}

export const BallotPaperResultCard = ({ ballotPaper }: BallotPaperResultCardProps): JSX.Element => {
  const { t } = useTranslation();
  const sections = ballotPaper.ballotPaperSections;

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        backgroundColor: '#80b9e5',
      }}
    >
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap={0}>
            <Title order={3}>{ballotPaper.name}</Title>
            <Text>{ballotPaper.description}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 2 }}>
          <Text fw={700}>{t('ballotsCast', 'Ballots cast')}</Text>
          <Text>{ballotPaper.ballotsCast}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 2 }}>
          <Text fw={700}>{t('invalidBallots', 'Invalid ballots')}</Text>
          <Text>{ballotPaper.invalidCount}</Text>
        </Grid.Col>
      </Grid>
      <Space h="md" />
      <SimpleGrid cols={{ base: 1, md: sections.length > 1 ? 2 : 1 }}>
        {sections.map((section) => (
          <CandidateResultsTable
            key={section.id}
            title={section.name}
            candidates={section.candidates}
            noVoteCount={section.noVoteCount}
          />
        ))}
      </SimpleGrid>
    </Paper>
  );
};
