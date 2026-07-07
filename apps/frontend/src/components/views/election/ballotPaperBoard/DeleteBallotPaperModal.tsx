import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableBallotPaper } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';


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
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} title={t('deletingBallotPaper', 'Deleting ballot paper')}>
      <Text>{t('youAreAboutToDeleteTheBallotPaper', 'You are about to delete the ballot paper:')}</Text>
      <Text fw={700}>{ballotPaper.name}</Text>
      <Space h={'md'} />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button variant="filled" color="red" onClick={onDelete}>
          {t('delete', 'Delete')}
        </Button>
      </Group>
    </Modal>
  );
};
