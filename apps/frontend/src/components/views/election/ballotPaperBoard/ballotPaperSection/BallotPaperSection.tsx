import { ActionIcon, Center, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableBallotPaperSection, SelectableElection } from '@repo/votura-validators';
import { IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useAddCandidateToBallotPaperSection } from '../../../../../swr/ballotPaperSections/useAddCandidateToBallotPaperSection.ts';
import { useCreateCandidate } from '../../../../../swr/candidates/useCreateCandidate.ts';
import { getCreateSuccessCandidateConfig } from '../../../../../utils/notifications.ts';
import { BallotPaperSectionSettingsMenu } from './BallotPaperSectionSettingsMenu.tsx';
import type { MutateCandidateDrawerProps } from './candidates/MutateCandidateDrawer.tsx';

export interface BallotPaperSectionProps {
  electionId: SelectableElection['id'];
  ballotPaperSection: SelectableBallotPaperSection;
}

export const BallotPaperSection = ({
  ballotPaperSection,
  electionId,
}: BallotPaperSectionProps): JSX.Element => {
  const { trigger: triggerCreateCandidate, isMutating: isCandidateMutating } =
    useCreateCandidate(electionId);
  const { trigger: triggerAddCandidate, isMutating: isAddCandidateMutating } =
    useAddCandidateToBallotPaperSection(
      electionId,
      ballotPaperSection.ballotPaperId,
      ballotPaperSection.id,
    );

  const onCandidateMutate: MutateCandidateDrawerProps['onMutate'] = async (
    partial,
  ): Promise<void> => {
    const candidate = await triggerCreateCandidate(partial);
    await triggerAddCandidate({
      candidateId: candidate.id,
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
