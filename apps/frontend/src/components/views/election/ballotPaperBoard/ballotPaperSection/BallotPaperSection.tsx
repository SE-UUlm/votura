import { ActionIcon, Center, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  updateableCandidateOperationOptions,
  type SelectableBallotPaperSection,
  type SelectableElection,
} from '@repo/votura-validators';
import { IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useDeleteBallotPaperSection } from '../../../../../swr/ballotPaperSections/useDeleteBallotPaperSection.ts';
import { useUpdateBallotPaperSection } from '../../../../../swr/ballotPaperSections/useUpdateBallotPaperSection.ts';
import { useUpdateCandidateInBallotPaperSection } from '../../../../../swr/ballotPaperSections/useUpdateCandidateInBallotPaperSection.ts';
import { useCreateCandidate } from '../../../../../swr/candidates/useCreateCandidate.ts';
import {
  getCreateSuccessCandidateConfig,
  getDeleteSuccessBallotPaperSectionConfig,
  getMutateSuccessBallotPaperSectionConfig,
} from '../../../../../utils/notifications.ts';
import { BallotPaperSectionSettingsMenu } from './BallotPaperSectionSettingsMenu.tsx';
import type { MutateCandidateDrawerProps } from './candidates/MutateCandidateDrawer.tsx';
import type { MutateBallotPaperSectionSectionDrawerProps } from './MutateBallotPaperSectionSectionDrawer.tsx';

export interface BallotPaperSectionProps {
  electionId: SelectableElection['id'];
  ballotPaperSection: SelectableBallotPaperSection;
}

export const BallotPaperSection = ({
  ballotPaperSection,
  electionId,
}: BallotPaperSectionProps): JSX.Element => {
  const { trigger: triggerUpdate, isMutating: isUpdateMutating } = useUpdateBallotPaperSection({
    electionId: electionId,
    ballotPaperId: ballotPaperSection.ballotPaperId,
    ballotPaperSectionId: ballotPaperSection.id,
  });
  const { trigger: triggerDelete } = useDeleteBallotPaperSection({
    electionId: electionId,
    ballotPaperId: ballotPaperSection.ballotPaperId,
    ballotPaperSectionId: ballotPaperSection.id,
  });
  const { trigger: triggerCreateCandidate, isMutating: isCandidateMutating } =
    useCreateCandidate(electionId);
  const { trigger: triggerAddCandidate, isMutating: isAddCandidateMutating } =
    useUpdateCandidateInBallotPaperSection(
      electionId,
      ballotPaperSection.ballotPaperId,
      ballotPaperSection.id,
    );

  const onMutate: MutateBallotPaperSectionSectionDrawerProps['onMutate'] = async (
    mutatedBallotPaper,
  ): Promise<void> => {
    await triggerUpdate(mutatedBallotPaper);
    notifications.show(getMutateSuccessBallotPaperSectionConfig(mutatedBallotPaper.name));
  };

  const onDelete = async (): Promise<void> => {
    await triggerDelete();
    notifications.show(getDeleteSuccessBallotPaperSectionConfig(ballotPaperSection.name));
  };

  const onCandidateMutate: MutateCandidateDrawerProps['onMutate'] = async (
    partial,
  ): Promise<void> => {
    const candidate = await triggerCreateCandidate(partial);
    await triggerAddCandidate({
      candidateId: candidate.id,
      operation: updateableCandidateOperationOptions.add,
    });
    notifications.show(getCreateSuccessCandidateConfig(partial.title));
  };

  return (
    <Paper shadow="xs" p={'md'}>
      <Stack>
        <Group justify={'space-between'} align={'start'}>
          <Stack w={'80%'}>
            <Text truncate="end">{ballotPaperSection.name}</Text>
            {ballotPaperSection.description !== undefined && (
              <Text lineClamp={2} c="dimmed" size="sm">
                {ballotPaperSection.description}
              </Text>
            )}
          </Stack>
          <BallotPaperSectionSettingsMenu
            electionId={electionId}
            ballotPaperSection={ballotPaperSection}
            onMutate={onMutate}
            isMutating={isUpdateMutating}
            onDelete={onDelete}
            onCandidateMutate={onCandidateMutate}
            isCandidateMutating={isCandidateMutating || isAddCandidateMutating}
          >
            <ActionIcon size="md" variant="light" aria-label="Section Settings">
              <IconDots size={16} />
            </ActionIcon>
          </BallotPaperSectionSettingsMenu>
        </Group>
        <Divider />
        <Center>
          <Text size="sm">Candidates: {ballotPaperSection.candidateIds.length}</Text>
        </Center>
      </Stack>
    </Paper>
  );
};
