import { Flex, Skeleton, Text } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useGetBallotPapers } from '../../../../swr/ballotPapers/useGetBallotPapers.ts';
import styles from './BallotPaperBoard.module.css';
import { BallotPaperColumn } from './BallotPaperColumn.tsx';

export interface BallotPaperBoardProps {
  election: SelectableElection | undefined;
}

export const BallotPaperBoard = ({ election }: BallotPaperBoardProps): JSX.Element => {
  const {
    data: ballotPapersData,
    isLoading: isBallotPapersLoading,
    error: ballotPapersError,
  } = useGetBallotPapers(election?.id);

  if (isBallotPapersLoading) {
    return (
      <Flex flex={1} w={'100%'} pb={'md'} gap="md">
        <Skeleton flex={1} />
        <Skeleton flex={1} />
        <Skeleton flex={1} />
        <Skeleton flex={1} />
        <Skeleton flex={1} />
      </Flex>
    );
  }

  if (election === undefined) {
    return <></>;
  }

  if (ballotPapersError !== undefined) {
    return <Text c={'red.7'}>The ballot papers could not be loaded. Please try again.</Text>;
  }

  return (
    <Flex flex={1} w={'100%'} pb={'md'} gap="md" className={styles.ballotPaperBoard}>
      {ballotPapersData
        ?.sort((a, b) => (a.createdAt >= b.createdAt ? 1 : -1))
        .map((ballotPaper, index) => (
          <BallotPaperColumn election={election} ballotPaper={ballotPaper} key={index} />
        ))}
    </Flex>
  );
};
