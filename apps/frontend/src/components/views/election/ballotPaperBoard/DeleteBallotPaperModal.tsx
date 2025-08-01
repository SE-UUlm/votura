import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableBallotPaper } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';

export interface DeleteBallotPaperModalProps {
  ballotPaper: SelectableBallotPaper;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

export const DeleteBallotPaperModal = ({
  ballotPaper,
  onDelete,
  onClose,
  opened,
}: DeleteBallotPaperModalProps): JSX.Element => {
  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting ballot paper'}>
      <Text>You are about to delete the ballot paper:</Text>
      <Text fw={700}>{ballotPaper.name}</Text>
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
