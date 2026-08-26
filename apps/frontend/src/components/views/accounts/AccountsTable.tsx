import { Badge, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { SelectableUser } from '@repo/votura-validators';
import dayjs from 'dayjs';
import { type JSX, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteUser } from '../../../swr/useDeleteUser.ts';
import { useEditUser } from '../../../swr/useEditUser.ts';
import { Avatar } from '../../Avatar.tsx';
import { DeleteAccountModal } from '../../DeleteAccountModal.tsx';
import { EditAccountDrawer, type EditAccountDrawerProps } from '../../EditAccountDrawer.tsx';

export interface AccountsTableProps {
  data: SelectableUser[];
}

const TableText = ({ children }: PropsWithChildren): JSX.Element => (
  <Text lineClamp={1} size={'sm'}>
    {children}
  </Text>
);

interface AccountsTableRowProps {
  user: SelectableUser;
}

const AccountsTableRow = ({ user }: AccountsTableRowProps): JSX.Element => {
  const { t } = useTranslation();

  const { trigger: triggerEdit, isMutating: isMutatingEdit } = useEditUser(user.id);
  const { trigger: triggerDelete, isMutating: isMutatingDelete } = useDeleteUser(user.id);

  const [editModalOpened, editModalActions] = useDisclosure(false);
  const [deleteModalOpened, deleteModalActions] = useDisclosure(false);

  const onEdit: EditAccountDrawerProps['onMutate'] = async (partial) => {
    await triggerEdit(partial);
    notifications.show({
      title: t('success', 'Success'),
      message: t('theUserAccountWasEdited', 'The user account was edited.'),
      color: 'green',
    });
    return;
  };

  const onDelete = async () => {
    await triggerDelete();
    notifications.show({
      title: t('success', 'Success'),
      message: t('theUserAccountWasDeleted', 'The user account was deleted.'),
      color: 'green',
    });
    return;
  };

  return (
    <>
      <EditAccountDrawer
        user={user}
        deleteModalActions={deleteModalActions}
        opened={editModalOpened}
        title={t('editAccount', 'Edit account')}
        onMutate={onEdit}
        onClose={editModalActions.close}
        mutateButtonText={t('saveChanges', 'Save changes')}
        isMutatingEdit={isMutatingEdit}
        isMutatingDelete={isMutatingDelete}
      />
      <DeleteAccountModal
        user={user}
        opened={deleteModalOpened}
        onDelete={onDelete}
        onClose={deleteModalActions.close}
      />
      <Table.Tr
        key={user.id}
        onClick={editModalActions.open}
        style={{ cursor: 'pointer' }}
        aria-label={t('editAccount', 'Edit account')}
        role="button"
        tabIndex={0}
      >
        <Table.Td w={48}>
          <Avatar userId={user.id} email={user.email} />
        </Table.Td>
        <Table.Td>
          <TableText>{user.email}</TableText>
        </Table.Td>
        <Table.Td>
          {user.role === 'admin' ? (
            <Badge variant={'light'} color={'red'}>
              {t('administrator', 'Administrator')}
            </Badge>
          ) : (
            <Badge variant={'light'} color={'blue'}>
              {t('user', 'User')}
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          {user.active ? (
            <Badge variant={'light'} color={'green'}>
              {t('active', 'Active')}
            </Badge>
          ) : (
            <Badge variant={'light'} color={'gray'}>
              {t('inactive', 'Inactive')}
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <TableText>{dayjs(user.createdAt).format('lll')}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{dayjs(user.modifiedAt).format('lll')}</TableText>
        </Table.Td>
      </Table.Tr>
    </>
  );
};

export const AccountsTable = ({ data }: AccountsTableProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Table highlightOnHover={true}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={48} />
          <Table.Th>{t('email', 'Email')}</Table.Th>
          <Table.Th>{t('role', 'Role')}</Table.Th>
          <Table.Th>{t('status', 'Status')}</Table.Th>
          <Table.Th>{t('createdAt', 'Created at')}</Table.Th>
          <Table.Th>{t('lastModified', 'Last modified')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((user) => (
          <AccountsTableRow key={user.id} user={user} />
        ))}
      </Table.Tbody>
    </Table>
  );
};
