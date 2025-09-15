import { ActionIcon, Button, Group, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteElection } from '../../../swr/elections/useDeleteElection.ts';
import { useUpdateElection } from '../../../swr/elections/useUpdateElection.ts';
import { useFreezeElection } from '../../../swr/elections/useFreezeElection.ts';
import { useUnfreezeElection } from '../../../swr/elections/useUnfreezeElection.ts';
import {
  getDeleteSuccessElectionConfig,
  getMutateSuccessElectionConfig,
  getToggleFreezeSuccessElectionConfig,
} from '../../../utils/notifications.ts';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import type { MutateElectionModalProps } from '../../MutateElectionDrawer.tsx';
import type { ToggleFreezeElectionModalProps } from '../../ToggleFreezeElectionModal.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';

export interface ElectionViewHeaderProps {
  election: SelectableElection;
}

export const ElectionViewHeader = ({ election }: ElectionViewHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const { trigger: deleteTrigger } = useDeleteElection({
    electionId: election.id,
  });
  const { trigger: updateTrigger, isMutating } = useUpdateElection(election.id);
  const { trigger: freezeTrigger } = useFreezeElection(election.id);
  const { trigger: unfreezeTrigger } = useUnfreezeElection(election.id);

  const onDelete = async () => {
    try {
      await deleteTrigger();
      notifications.show(getDeleteSuccessElectionConfig(election.name));
      navigate('/elections');
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Could not delete election. Please try again.';
      notifications.show({
        title: 'Deletion failed',
        message: message,
        color: 'red',
      });
    }
  };

  const onMutate: MutateElectionModalProps['onMutate'] = async (mutatedElection) => {
    await updateTrigger(mutatedElection);
    notifications.show(getMutateSuccessElectionConfig(mutatedElection.name));
  };

  const onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'] = async () => {
    if (election.configFrozen) {
      await unfreezeTrigger();
    } else {
      await freezeTrigger();
    }
    notifications.show(getToggleFreezeSuccessElectionConfig(election.name, !election.configFrozen));
  };

  return (
    <>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Group>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={() => {
              navigate('/elections');
            }}
          >
            Back to all elections
          </Button>
          <Title order={3}>{election.name}</Title>
        </Group>
        <ElectionsSettingsMenu
          election={election}
          targetElement={
            <ActionIcon size="lg" variant="light" aria-label="Settings">
              <IconDots size={16} />
            </ActionIcon>
          }
          onDelete={onDelete}
          onMutate={onMutate}
          onToggleFreeze={onToggleFreeze}
          isMutating={isMutating}
        />
      </Group>
    </>
  );
};
