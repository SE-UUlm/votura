import { ActionIcon, Checkbox, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableCandidate } from '@repo/votura-validators';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useDeleteCandidate } from '../../../../../../swr/candidates/useDeleteCandidate.ts';
import { useUpdateCandidate } from '../../../../../../swr/candidates/useUpdateCandidate.ts';
import { DeleteCandidateModal, type DeleteCandidateModalProps } from './DeleteCandidateModal.tsx';
import {
  MutateCandidateDrawer,
  type MutateCandidateDrawerProps,
} from './MutateCandidateDrawer.tsx';

export interface CandidateRowProps {
  candidate: SelectableCandidate;
  bpsCandidates: SelectableCandidate['id'][];
  onToggleCandidate: (candidate: SelectableCandidate) => void | Promise<void>;
  isMutatingToggleCandidate: boolean;
}

export const CandidateRow = ({
  candidate,
  bpsCandidates,
  onToggleCandidate,
  isMutatingToggleCandidate,
}: CandidateRowProps) => {
  const [mutateCandidateContextOpen, mutateCandidateActions] = useDisclosure(false);
  const [deleteCandidateContextOpen, deleteCandidateActions] = useDisclosure(false);
  const { trigger: triggerUpdateCandidate, isMutating: isMutatingUpdateCandidate } =
    useUpdateCandidate(candidate.electionId, candidate.id);
  const { trigger: triggerDeleteCandidate, isMutating: isMutatingDeleteCandidate } =
    useDeleteCandidate(candidate.electionId, candidate.id);

  const onCandidateMutate: MutateCandidateDrawerProps['onMutate'] = async (
    partial,
  ): Promise<void> => {
    await triggerUpdateCandidate(partial);
  };

  const onCandidateDelete: DeleteCandidateModalProps['onDelete'] = async () => {
    await triggerDeleteCandidate();
  };

  return (
    <>
      <DeleteCandidateModal
        candidate={candidate}
        opened={deleteCandidateContextOpen}
        onClose={deleteCandidateActions.close}
        onDelete={onCandidateDelete}
        isMutating={isMutatingDeleteCandidate}
      />
      <MutateCandidateDrawer
        opened={mutateCandidateContextOpen}
        onClose={mutateCandidateActions.close}
        mutateButtonText={'Save changed'}
        onMutate={onCandidateMutate}
        title={'Edit candidate'}
        isMutating={isMutatingUpdateCandidate}
        candidate={candidate}
      />
      <Group key={candidate.id} justify="space-between" wrap={'nowrap'}>
        <Checkbox
          checked={bpsCandidates.includes(candidate.id)}
          aria-label={'candidate-checkbox'}
          disabled={isMutatingToggleCandidate}
          onChange={() => onToggleCandidate(candidate)}
        />
        <Text truncate="end" flex={1}>
          {candidate.title}
        </Text>
        <Group>
          <ActionIcon variant={'transparent'}>
            <IconSettings
              style={{ width: '70%', height: '70%' }}
              stroke={1.5}
              onClick={mutateCandidateActions.open}
            />
          </ActionIcon>
          <ActionIcon variant={'transparent'} color="red">
            <IconTrash
              style={{ width: '70%', height: '70%' }}
              stroke={1.5}
              onClick={deleteCandidateActions.open}
            />
          </ActionIcon>
        </Group>
      </Group>
    </>
  );
};
