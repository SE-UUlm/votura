import { ActionIcon, Checkbox, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableCandidate } from '@repo/votura-validators';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useUpdateCandidate } from '../../../../../../swr/candidates/useUpdateCandidate.ts';
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
  const { trigger: triggerUpdateCandidate, isMutating: isMutatingUpdateCandidate } =
    useUpdateCandidate(candidate.electionId, candidate.id);

  const onCandidateMutate: MutateCandidateDrawerProps['onMutate'] = async (
    partial,
  ): Promise<void> => {
    await triggerUpdateCandidate(partial);
  };

  return (
    <>
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
            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Group>
    </>
  );
};
