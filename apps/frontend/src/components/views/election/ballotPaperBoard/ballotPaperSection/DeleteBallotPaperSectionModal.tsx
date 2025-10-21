import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableBallotPaperSection } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';

export interface DeleteBallotPaperSectionModalProps {
  ballotPaperSection: SelectableBallotPaperSection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

export const DeleteBallotPaperSectionModal = ({
  ballotPaperSection,
  onDelete,
  onClose,
  opened,
}: DeleteBallotPaperSectionModalProps): JSX.Element => {
  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting ballot paper section'}>
      <Text>You are about to delete the ballot paper section:</Text>
      <Text fw={700}>{ballotPaperSection.name}</Text>
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
