import { ActionIcon, Button, Group, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { type MockElection, useStore } from '../../../store/useStore.ts';
import {
  getDeleteSuccessElectionConfig,
  getMutateSuccessElectionConfig,
  getToggleFreezeSuccessElectionConfig,
} from '../../../utils/notifications.ts';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import type { MutateElectionModalProps } from '../../MutateElectionModal.tsx';
import type { ToggleFreezeElectionModalProps } from '../../ToggleFreezeElectionModal.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';

export interface ElectionViewHeaderProps {
  election: MockElection;
}

export const ElectionViewHeader = ({ election }: ElectionViewHeaderProps) => {
  const navigate = useNavigate();
  const deleteElection = useStore((state) => state.deleteElection);
  const updateElection = useStore((state) => state.updateElection);

  const onDelete = () => {
    deleteElection(election.id);
    notifications.show(getDeleteSuccessElectionConfig(election.name));
    navigate('/elections');
    return;
  };

  const onMutate: MutateElectionModalProps['onMutate'] = (mutatedElection) => {
    updateElection(election.id, mutatedElection);
    notifications.show(getMutateSuccessElectionConfig(mutatedElection?.name || election.name));
  };

  const onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'] = () => {
    updateElection(election.id, { immutableConfig: !election.immutableConfig });
    notifications.show(
      getToggleFreezeSuccessElectionConfig(election.name, !election.immutableConfig),
    );
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
        />
      </Group>
    </>
  );
};
