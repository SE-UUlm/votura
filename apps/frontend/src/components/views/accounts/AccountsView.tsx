import { Divider, Flex, Group, Loader, Space, ThemeIcon, Title } from '@mantine/core';
import { IconBug } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUsers } from '../../../swr/useGetUsers.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { AccountsTable } from './AccountsTable.tsx';

export const AccountsView = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetUsers();

  if (isLoading || data === undefined) {
    return <Loader />;
  }

  if (error !== undefined) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  const sortedUsers = data.sort((a, b) => {
    const aCreated = a.createdAt;
    const bCreated = b.createdAt;
    if (aCreated < bCreated) {
      return -1;
    } else if (aCreated > bCreated) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Title order={1}>{t('accounts', 'Accounts')}</Title>
      </Group>
      <Divider />
      <Space h={'md'} />
      <AccountsTable data={sortedUsers} />
    </Flex>
  );
};
