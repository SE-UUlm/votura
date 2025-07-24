import { Flex, Skeleton, Text } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import { useGetBallotPapers } from '../../../../swr/ballotPapers/useGetBallotPapers.ts';
import { BallotPaperColumn } from './BallotPaperColumn.tsx';
import styles from './BallotPaperBoard.module.css'

export interface BallotPaperBoardProps {
  electionId: SelectableElection['id'] | undefined;
}

export const BallotPaperBoard = ({ electionId }: BallotPaperBoardProps) => {
  const {
    data: ballotPapersData,
    isLoading: isBallotPapersLoading,
    error: ballotPapersError,
  } = useGetBallotPapers(electionId);

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

  if (ballotPapersError !== undefined) {
      return (
          <Text c={'red.7'}>The ballot papers could not be loaded. Please try again.</Text>
      )
  }

  return (
    <Flex flex={1} w={'100%'} pb={'md'} gap="md" className={styles.ballotPaperBoard}>
      {ballotPapersData?.map((ballotPaper, index) => (
        <BallotPaperColumn ballotPaper={ballotPaper} key={index} />
      ))}
    </Flex>
  );
};
