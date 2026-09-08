import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';

export interface DeleteVoterGroupModalProps {
  voterGroup: SelectableVoterGroup;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

export const DeleteVoterGroupModal = ({
  voterGroup,
  opened,
  onClose,
  onDelete,
}: DeleteVoterGroupModalProps): JSX.Element => {
  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting voter group'}>
      <Text>You are about to delete the voter group:</Text>
      <Text fw={700}>{voterGroup.name}</Text>
      <Space h={'md'} />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="filled" color="red" onClick={onDelete}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
};
