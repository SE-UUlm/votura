import {
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  Space,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { parameter } from '@repo/votura-validators';
import { IconBug, IconPlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Navigate, useParams } from 'react-router';
import { useCreateBallotPaper } from '../../../swr/ballotPapers/useCreateBallotPaper.ts';
import { useGetElection } from '../../../swr/elections/useGetElection.ts';
import { getAddSuccessBallotPaperConfig } from '../../../utils/notifications.ts';
import { BallotPaperBoard } from './ballotPaperBoard/BallotPaperBoard.tsx';
import { ElectionStats } from './ElectionStats.tsx';
import { ElectionViewHeader } from './ElectionViewHeader.tsx';
import {
  MutateBallotPaperDrawer,
  type MutateBallotPaperDrawerProps,
} from './MutateBallotPaperDrawer.tsx';

export interface ElectionViewRouteParams extends Record<string, string> {
  [parameter.electionId]: string;
}

export const ElectionView = (): JSX.Element => {
  const params = useParams<ElectionViewRouteParams>();
  const {
    data: electionData,
    isLoading: isElectionLoading,
    error: electionError,
  } = useGetElection({ electionId: params.electionId });

  const { trigger, isMutating } = useCreateBallotPaper(electionData?.id);

  const [isMutateDrawerOpen, mutateDrawerActions] = useDisclosure(false);

  if (!params.electionId) {
    return <Navigate to={'/elections'} />;
  }

  if (electionError) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  if (isElectionLoading || electionData === undefined) {
    return (
      <Container>
        <Loader color="blue" />
      </Container>
    );
  }

  const onMutate: MutateBallotPaperDrawerProps['onMutate'] = async (update) => {
    const response = await trigger(update);
    notifications.show(getAddSuccessBallotPaperConfig(response.name));
  };

  return (
    <>
      <MutateBallotPaperDrawer
        opened={isMutateDrawerOpen}
        onClose={mutateDrawerActions.close}
        mutateButtonText={'Create new ballot paper'}
        onMutate={onMutate}
        title={'Create Ballot Paper'}
        isMutating={isMutating}
      />
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <ElectionViewHeader election={electionData} />
        <Divider />
        <Space h={'md'} />
        <ElectionStats election={electionData} />
        <Space h={'md'} />
        <Divider />
        <Space h={'md'} />
        <Group justify={'space-between'}>
          <Title order={4}>Ballot Papers</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={mutateDrawerActions.open}
          >
            New Ballot Paper
          </Button>
        </Group>
        <Space h={'md'} />
        <BallotPaperBoard election={electionData} />
      </Flex>
    </>
  );
};
