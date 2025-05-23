import type { MockElection } from '../store/useStore.ts';
import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { MouseEventHandler } from 'react';

export interface ToggleFreezeElectionModalProps {
  election: MockElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onToggleFreeze: MouseEventHandler<HTMLButtonElement>;
}

export const ToggleFreezeElectionModal = ({
  election,
  opened,
  onClose,
  onToggleFreeze,
}: ToggleFreezeElectionModalProps) => {
  const title = election.immutableConfig ? 'Unfreeze election config' : 'Freeze election config';
  const action = election.immutableConfig ? 'Unfreeze' : 'Freeze';

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Text>You are about to {action.toLowerCase()} the election:</Text>
      <Text fw={700}>{election.name}</Text>
      <Space h={'md'} />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="filled"
          onClick={(e) => {
            onToggleFreeze(e);
            onClose();
          }}
        >
          {action}
        </Button>
      </Group>
    </Modal>
  );
};
