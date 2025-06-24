import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { MouseEventHandler } from 'react';
import type {SelectableElection} from '@repo/votura-validators';

export interface DeleteElectionModalProps {
  election: SelectableElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

export const DeleteElectionModal = ({
  election,
  opened,
  onClose,
  onDelete,
}: DeleteElectionModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting election'}>
      <Text>You are about to delete the election:</Text>
      <Text fw={700}>{election.name}</Text>
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
