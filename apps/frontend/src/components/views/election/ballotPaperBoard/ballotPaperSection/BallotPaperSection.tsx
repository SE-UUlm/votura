import { ActionIcon, Center, Divider, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  updateableCandidateOperationOptions,
  type SelectableBallotPaperSection,
  type SelectableElection,
} from '@repo/votura-validators';
import { IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useUpdateCandidateInBallotPaperSection } from '../../../../../swr/ballotPaperSections/useUpdateCandidateInBallotPaperSection.ts';
import { useCreateCandidate } from '../../../../../swr/candidates/useCreateCandidate.ts';
import { useGetCandidates } from '../../../../../swr/candidates/useGetCandidates.ts';
import { getCreateSuccessCandidateConfig } from '../../../../../utils/notifications.ts';
import { BallotPaperSectionSettingsMenu } from './BallotPaperSectionSettingsMenu.tsx';
import type { MutateCandidateDrawerProps } from './candidates/MutateCandidateDrawer.tsx';
import { useTranslation } from 'react-i18next';


export interface BallotPaperSectionProps {
  electionId: SelectableElection['id'];
  ballotPaperSection: SelectableBallotPaperSection;
}

export const BallotPaperSection = ({
  ballotPaperSection,
  electionId,
}: BallotPaperSectionProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: electionCandidates, isLoading: isLoadingElectionCandidates } =
    useGetCandidates(electionId);
  const bpsCandidateRows = electionCandidates
    ?.slice()
    .sort((a, b) => (a.createdAt >= b.createdAt ? 1 : -1))
    .filter((candidate) => ballotPaperSection.candidateIds.includes(candidate.id))
    .map((candidate) => (
      <Text key={candidate.id} size="sm" truncate="end">
        {candidate.title}
      </Text>
    ));

  const { trigger: triggerCreateCandidate, isMutating: isCandidateMutating } =
    useCreateCandidate(electionId);
  const { trigger: triggerAddCandidate, isMutating: isAddCandidateMutating } =
    useUpdateCandidateInBallotPaperSection(
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
            <Text c="dimmed" size="sm">{t('candidatesLength', 'Candidates: {{length}}', { length: ballotPaperSection.candidateIds.length })}</Text>
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
            <ActionIcon size="md" variant="light" aria-label={t('sectionSettings', 'Section Settings')}>
              <IconDots size={16} />
            </ActionIcon>
          </BallotPaperSectionSettingsMenu>
        </Group>
        <Divider />
        <Stack>
          {isLoadingElectionCandidates ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            <div className="bps-active-candidates">
              <Stack gap="xs">{bpsCandidateRows}</Stack>
            </div>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
