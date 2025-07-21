import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { MouseEventHandler } from 'react';

export interface ToggleFreezeElectionModalProps {
  election: SelectableElection;
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
  const action = election.configFrozen ? 'Unfreeze' : 'Freeze';
  const titleText = action + ' election config';
  const redColor = 'var(--mantine-color-red-7)';
  const title = (
    <Group gap="xs">
      <IconAlertTriangle size={20} stroke={2} style={{ color: redColor }} />
      <Text fw={700} c="red.7">
        {titleText}
      </Text>
    </Group>
  );

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Text c="red.7">You are about to {action.toLowerCase()} the election:</Text>
      <Text fw={700} c="red.7">
        {election.name}
      </Text>
      <Space h={'md'} />
      <Text fs="italic" c="red.7">
        Important:
      </Text>
      <Text fs="italic" c="red.7">
        Freezing an election locks its configuration, no further changes can be made.
      </Text>
      <Text fs="italic" c="red.7">
        Unfreezing an election allows configuration changes again, but all previously issued voter
        tokens become invalid, and any votes that have already been cast will be reset and no longer
        counted.
      </Text>
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
