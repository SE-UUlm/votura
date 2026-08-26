import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableUser } from '@repo/votura-validators';
import type { JSX, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

export interface DeleteAccountModalProps {
  user: SelectableUser;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

export const DeleteAccountModal = ({
  user,
  opened,
  onClose,
  onDelete,
}: DeleteAccountModalProps): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting account'}>
      <Text>{t('youAreAboutToDeleteTheAccount', 'You are about to delete the account:')}</Text>
      <Text fw={700}>{user.email}</Text>
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
