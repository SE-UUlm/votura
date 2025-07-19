import { ActionIcon, Button, Group, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useUpdateElection } from '../../../swr/elections/useUpdateElection.ts';
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
  election: SelectableElection;
}

export const ElectionViewHeader = ({ election }: ElectionViewHeaderProps) => {
  const navigate = useNavigate();
  const { trigger, isMutating } = useUpdateElection(election.id);

  const onDelete = () => {
    // deleteElection(election.id); TODO: Implement election deletion (see #147)
    notifications.show(getDeleteSuccessElectionConfig(election.name));
    navigate('/elections');
    return;
  };

  const onMutate: MutateElectionModalProps['onMutate'] = async (mutatedElection) => {
    await trigger(mutatedElection);
    notifications.show(getMutateSuccessElectionConfig(mutatedElection.name));
  };

  const onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'] = () => {
    // updateElection(election.id, { immutableConfig: !election.configFrozen }); TODO: Implement election update (see #147)
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
