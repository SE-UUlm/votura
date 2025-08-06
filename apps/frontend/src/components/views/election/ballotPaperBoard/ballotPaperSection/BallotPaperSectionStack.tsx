import { ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import type { SelectableBallotPaper, SelectableElection } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useGetBallotPaperSections } from '../../../../../swr/ballotPaperSections/useGetBallotPaperSections.ts';
import { BallotPaperSection } from './BallotPaperSection.tsx';

export interface BallotPaperSectionStackProps {
  electionId?: SelectableElection['id'];
  ballotPaperId?: SelectableBallotPaper['id'];
}

export const BallotPaperSectionStack = ({
  electionId,
  ballotPaperId,
}: BallotPaperSectionStackProps): JSX.Element => {
  const { data, isLoading } = useGetBallotPaperSections(electionId, ballotPaperId);

  if (electionId === undefined || ballotPaperId === undefined || isLoading) {
    return <Skeleton height={50} width={'100%'}></Skeleton>;
  }

  if (data === undefined || data.length === 0) {
    return (
      <Text size="xs" c={'dimmed'}>
        Create a section to get started.
      </Text>
    );
  }

  return (
    <ScrollArea flex={1} w={'100%'} style={{ overflowY: 'auto' }}>
      <Stack>
        {data.map((section) => (
          <BallotPaperSection ballotPaperSection={section} />
        ))}
      </Stack>
    </ScrollArea>
  );
};
