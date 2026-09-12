import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('deletingVoterGroup', 'Deleting voter group')}
    >
      <Text>
        {t('youAreAboutToDeleteTheVoterGroup', 'You are about to delete the voter group:')}
      </Text>
      <Text fw={700}>{voterGroup.name}</Text>
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
