import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableCandidate } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';

export interface DeleteCandidateModalProps {
  candidate: SelectableCandidate;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onDelete: MouseEventHandler<HTMLButtonElement>;
  isMutating: boolean;
}

export const DeleteCandidateModal = ({
  candidate,
  onDelete,
  onClose,
  opened,
  isMutating,
}: DeleteCandidateModalProps): JSX.Element => {
  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting candidate'}>
      <Text>You are about to delete the candidate:</Text>
      <Text fw={700}>{candidate.title}</Text>
      <Space h={'md'} />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose} disabled={isMutating}>
          Cancel
        </Button>
        <Button variant="filled" color="red" onClick={onDelete} disabled={isMutating}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
};
