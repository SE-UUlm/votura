import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableBallotPaperSection } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} title={t('deletingBallotPaperSection', 'Deleting ballot paper section')}>
      <Text>{t('youAreAboutToDeleteTheBallotPaperSection', 'You are about to delete the ballot paper section:')}</Text>
      <Text fw={700}>{ballotPaperSection.name}</Text>
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
