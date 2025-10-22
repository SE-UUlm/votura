import { ActionIcon, Divider, Group, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableBallotPaper, SelectableElection } from '@repo/votura-validators';
import { IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useDeleteBallotPaper } from '../../../../swr/ballotPapers/useDeleteBallotPaper.ts';
import { useUpdateBallotPaper } from '../../../../swr/ballotPapers/useUpdateBallotPaper.ts';
import { useCreateBallotPaperSection } from '../../../../swr/ballotPaperSections/useCreateBallotPaperSection.ts';
import {
  getAddSuccessBallotPaperSectionConfig,
  getDeleteSuccessBallotPaperConfig,
  getMutateSuccessBallotPaperConfig,
} from '../../../../utils/notifications.ts';
import type { MutateBallotPaperDrawerProps } from '../MutateBallotPaperDrawer.tsx';
import { BallotPaperSectionStack } from './ballotPaperSection/BallotPaperSectionStack.tsx';
import type { MutateBallotPaperSectionSectionDrawerProps } from './ballotPaperSection/MutateBallotPaperSectionSectionDrawer.tsx';
import { BallotPaperSettingsMenu } from './BallotPaperSettingsMenu.tsx';

export interface BallotPaperColumnProps {
  election: SelectableElection;
  ballotPaper: SelectableBallotPaper;
}

export const BallotPaperColumn = ({
  election,
  ballotPaper,
}: BallotPaperColumnProps): JSX.Element => {
  const theme = useMantineTheme();
  const { trigger: triggerUpdate, isMutating: isUpdateMutating } = useUpdateBallotPaper({
    electionId: election.id,
    ballotPaperId: ballotPaper.id,
  });
  const { trigger: triggerDelete } = useDeleteBallotPaper({
    electionId: election.id,
    ballotPaperId: ballotPaper.id,
  });
  const { trigger: triggerCreateSection, isMutating: isSectionMutating } =
    useCreateBallotPaperSection({
      electionId: election.id,
      ballotPaperId: ballotPaper.id,
    });

  const onMutate: MutateBallotPaperDrawerProps['onMutate'] = async (
    mutatedBallotPaper,
  ): Promise<void> => {
    await triggerUpdate(mutatedBallotPaper);
    notifications.show(getMutateSuccessBallotPaperConfig(mutatedBallotPaper.name));
  };

  const onDelete = async (): Promise<void> => {
    await triggerDelete();
    notifications.show(getDeleteSuccessBallotPaperConfig(ballotPaper.name));
  };

  const onSectionMutate: MutateBallotPaperSectionSectionDrawerProps['onMutate'] = async (
    partial,
  ): Promise<void> => {
    await triggerCreateSection(partial);
    notifications.show(getAddSuccessBallotPaperSectionConfig(partial.name));
  };

  return (
    <Paper shadow={'xs'} p={'md'} miw={400} bg={theme.colors.gray[0]} style={{ overflow: 'auto' }}>
      <Stack h={'100%'}>
        <Group justify={'space-between'} align={'start'}>
          <Stack w={'80%'}>
            <Text truncate="end">{ballotPaper.name}</Text>
            {ballotPaper.description !== undefined && (
              <Text lineClamp={2} c="dimmed" size="sm">
                {ballotPaper.description}
              </Text>
            )}
          </Stack>
          <BallotPaperSettingsMenu
            ballotPaper={ballotPaper}
            onMutate={onMutate}
            isMutating={isUpdateMutating}
            onDelete={onDelete}
            onSectionMutate={onSectionMutate}
            isSectionMutating={isSectionMutating}
          >
            <ActionIcon size="lg" variant="light" aria-label="Ballot Paper Settings">
              <IconDots size={16} />
            </ActionIcon>
          </BallotPaperSettingsMenu>
        </Group>
        <Divider />
        <BallotPaperSectionStack electionId={election.id} ballotPaperId={ballotPaper.id} />
      </Stack>
    </Paper>
  );
};
